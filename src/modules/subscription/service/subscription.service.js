
import mongoose from "mongoose";
import crypto from "node:crypto";
import XPayTransaction from "../../../DB/models/XPayTransaction.js";
import Order from "../../../DB/models/Order.js";
import Payment from "../../../DB/models/Payment .js";
import storeModel from "../../../DB/models/store.js";
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";

import Usermodel from "../../../DB/models/usermodel.js";
import Subscription from "../../../DB/models/subscription.js";
import SubscriptionPayment from "../../../DB/models/SubscriptionPayment.js";

const VIP_MONTHLY_PRICE = 450;
const VIP_SUBSCRIPTION_NAME = "Progzila VIP Monthly";

// --------------------------------------------------
// التحقق من توقيع XPay باستخدام الـ Raw Body
// --------------------------------------------------

const verifyXPaySignature = (rawBody, signatureHeader) => {
  if (
    !process.env.XPAY_WEBHOOK_SECRET ||
    !Buffer.isBuffer(rawBody) ||
    !signatureHeader
  ) {
    return null;
  }

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    })
  );

  const timestamp = Number(parts.t);
  const receivedSignature = parts.v1;

  if (
    !Number.isFinite(timestamp) ||
    !receivedSignature ||
    Math.abs(Math.floor(Date.now() / 1000) - timestamp) > 300
  ) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.XPAY_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody.toString("utf8")}`)
    .digest("hex");

  if (!/^[a-fA-F0-9]+$/.test(receivedSignature)) {
    return null;
  }

  const expected = Buffer.from(expectedSignature, "hex");
  const received = Buffer.from(receivedSignature, "hex");

  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    return null;
  }

  try {
    return JSON.parse(rawBody.toString("utf8"));
  } catch {
    return null;
  }
};

// --------------------------------------------------
// إنشاء Checkout جديد
// POST /subscription/create-checkout
// --------------------------------------------------

export const createSubscriptionCheckout = asyncHandelr(
  async (req, res, next) => {
    if (!req.user || req.user.userType !== "developer") {
      return next(
        new Error("اشتراك VIP متاح للمبرمجين فقط", { cause: 403 })
      );
    }

    const user = await Usermodel.findOne({
      _id: req.user._id,
      userType: "developer",
      isBlocked: { $ne: true },
      deleted: { $ne: true },
    });

    if (!user) {
      return next(
        new Error("الحساب غير موجود أو غير مسموح له بالاشتراك", {
          cause: 403,
        })
      );
    }

    if (
      !process.env.XPAY_SECRET_KEY ||
      !process.env.XPAY_WEBHOOK_SECRET ||
      !process.env.FRONTEND_URL
    ) {
      return next(
        new Error("إعدادات دفع الاشتراك غير مكتملة على السيرفر", {
          cause: 500,
        })
      );
    }

    const paymentRecord = await SubscriptionPayment.create({
      user: user._id,
      amount: VIP_MONTHLY_PRICE,
      currency: "EGP",
      status: "pending",
    });

    try {
      const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, "");

      const response = await fetch(
        "https://api.xpay.app/checkout/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.XPAY_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: "payment",
            uiMode: "hosted",
            currency: "EGP",
            lineItems: [
              {
                priceData: {
                  currency: "EGP",
                  unitAmount: VIP_MONTHLY_PRICE * 100,
                  productData: {
                    name: "Progzila VIP - Monthly Subscription",
                  },
                },
                quantity: 1,
              },
            ],
            metadata: {
              progzilaSubscriptionPaymentId: paymentRecord._id.toString(),
              userId: user._id.toString(),
              subscriptionType: "vip_monthly",
            },
            afterCompletion: {
              type: "redirect",
              redirect: {
                url: `${
                  process.env.XPAY_SUBSCRIPTION_RETURN_URL ||
                  `${frontendUrl}/subscription/result/{CHECKOUT_SESSION_ID}`
                }`,
              },
            },
          }),
        }
      );

      const session = await response.json();

      if (!response.ok || !session.id || !session.url) {
        throw new Error("تعذر إنشاء جلسة الدفع لدى XPay");
      }

      paymentRecord.xpaySessionId = session.id;
      paymentRecord.xpayCheckoutUrl = session.url;
      paymentRecord.xpayPaymentStatus =
        session.paymentStatus || "unpaid";

      await paymentRecord.save();

      return successresponse(
        res,
        "تم إنشاء جلسة اشتراك VIP بنجاح",
        201,
        {
          paymentId: paymentRecord._id,
          checkoutUrl: session.url,
          amount: VIP_MONTHLY_PRICE,
          currency: "EGP",
          status: paymentRecord.status,
        }
      );
    } catch (error) {
      paymentRecord.status = "failed";
      await paymentRecord.save();

      console.error("Progzila VIP checkout error:", error.message);

      return next(
        new Error("تعذر إنشاء جلسة الدفع، حاول مرة أخرى", {
          cause: 502,
        })
      );
    }
  }
);

// --------------------------------------------------
// Webhook: تأكيد الدفع وتفعيل الاشتراك
// POST /subscription/webhook
// --------------------------------------------------


export const subscriptionWebhook = asyncHandelr(async (req, res) => {
  const event = verifyXPaySignature(
    req.rawBody,
    req.headers["xpay-signature"]
  );

  if (!event) {
    return res.status(400).json({
      message: "توقيع إشعار الدفع غير صحيح",
    });
  }

  const checkout = event.data?.object;

  if (!checkout?.id || !event.type) {
    return res.status(400).json({
      message: "بيانات إشعار الدفع غير صحيحة",
    });
  }

  // البحث عن المعاملة في سجلات شراء المشاريع والفريلانس أولًا.
  const transaction = await XPayTransaction.findOne({
    xpaySessionId: checkout.id,
  });

  // لو المعاملة ليست ضمن النظام الأول، نبحث عن اشتراك VIP.
  if (!transaction) {
    const payment = await SubscriptionPayment.findOne({
      xpaySessionId: checkout.id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "معاملة الدفع غير موجودة",
      });
    }

    if (payment.status === "paid") {
      return res.status(200).json({
        received: true,
        alreadyProcessed: true,
      });
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      await SubscriptionPayment.updateOne(
        { _id: payment._id, status: "pending" },
        {
          $set: {
            status:
              event.type === "checkout.session.expired"
                ? "expired"
                : "failed",
            xpayPaymentStatus: checkout.paymentStatus || "unpaid",
          },
        }
      );

      return res.status(200).json({ received: true });
    }

    if (
      event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded"
    ) {
      return res.status(200).json({
        received: true,
        ignored: true,
      });
    }

    if (checkout.paymentStatus !== "paid") {
      return res.status(200).json({
        received: true,
        paymentPending: true,
      });
    }

    if (
      Number(checkout.amountTotal) !==
        Math.round(payment.amount * 100) ||
      checkout.currency?.toUpperCase() !==
        payment.currency?.toUpperCase()
    ) {
      console.error("VIP payment amount/currency mismatch:", checkout.id);

      return res.status(400).json({
        message: "مبلغ أو عملة الدفع غير مطابقين",
      });
    }

    const mongoSession = await mongoose.startSession();

    try {
      await mongoSession.withTransaction(async () => {
        const paidPayment =
          await SubscriptionPayment.findOneAndUpdate(
            {
              _id: payment._id,
              status: "pending",
              xpaySessionId: checkout.id,
            },
            {
              $set: {
                status: "paid",
                xpayPaymentStatus: "paid",
                xpayPaymentIntentId:
                  checkout.paymentIntentId ||
                  checkout.paymentIntent?.id ||
                  null,
                paidAt: new Date(),
              },
            },
            {
              new: true,
              session: mongoSession,
            }
          );

        if (!paidPayment) return;

        const user = await Usermodel.findOne({
          _id: paidPayment.user,
          userType: "developer",
          isBlocked: { $ne: true },
          deleted: { $ne: true },
        }).session(mongoSession);

        if (!user) {
          throw new Error(
            "المبرمج المرتبط بالدفع غير موجود أو غير نشط"
          );
        }

        const now = new Date();

        let subscription = await Subscription.findOne({
          user: user._id,
          name: VIP_SUBSCRIPTION_NAME,
        })
          .sort({ updatedAt: -1 })
          .session(mongoSession);

        const currentEndDate = subscription?.endDate
          ? new Date(subscription.endDate)
          : null;

        const hasActiveSubscription =
          subscription?.status === "active" &&
          currentEndDate &&
          currentEndDate > now;

        const startDate = hasActiveSubscription
          ? subscription.startDate || now
          : now;

        const endDate = new Date(
          hasActiveSubscription ? currentEndDate : now
        );

        endDate.setMonth(endDate.getMonth() + 1);

        if (!subscription) {
          subscription = new Subscription({
            user: user._id,
            name: VIP_SUBSCRIPTION_NAME,
          });
        }

        subscription.plan = "vip";
        subscription.status = "active";
        subscription.startDate = startDate;
        subscription.endDate = endDate;
        subscription.amount = VIP_MONTHLY_PRICE;

        await subscription.save({ session: mongoSession });

        user.plan = "vip";
        user.substriction = true;

        await user.save({ session: mongoSession });

        paidPayment.subscriptionStartDate = startDate;
        paidPayment.subscriptionEndDate = endDate;

        await paidPayment.save({ session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }

    return res.status(200).json({ received: true });
  }

  // من هنا نعالج شراء المشاريع والفريلانس.
  if (transaction.status === "paid") {
    return res.status(200).json({
      received: true,
      alreadyProcessed: true,
    });
  }

  if (
    event.type === "checkout.session.expired" ||
    event.type === "checkout.session.async_payment_failed"
  ) {
    await XPayTransaction.updateOne(
      { _id: transaction._id, status: "pending" },
      {
        $set: {
          status:
            event.type === "checkout.session.expired"
              ? "expired"
              : "failed",
          xpayPaymentStatus: checkout.paymentStatus || "unpaid",
        },
      }
    );

    return res.status(200).json({ received: true });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return res.status(200).json({
      received: true,
      ignored: true,
    });
  }

  if (checkout.paymentStatus !== "paid") {
    return res.status(200).json({
      received: true,
      paymentPending: true,
    });
  }

  if (
    Number(checkout.amountTotal) !==
      Math.round(transaction.amount * 100) ||
    checkout.currency?.toUpperCase() !==
      transaction.currency?.toUpperCase()
  ) {
    console.error("XPay amount/currency mismatch:", checkout.id);

    return res.status(400).json({
      message: "المبلغ أو العملة غير مطابقين",
    });
  }

  const mongoSession = await mongoose.startSession();

  try {
    await mongoSession.withTransaction(async () => {
      const paidTransaction = await XPayTransaction.findOneAndUpdate(
        {
          _id: transaction._id,
          status: "pending",
          xpaySessionId: checkout.id,
        },
        {
          $set: {
            status: "paid",
            xpayPaymentStatus: "paid",
            xpayPaymentIntentId:
              checkout.paymentIntentId ||
              checkout.paymentIntent?.id ||
              null,
            paidAt: new Date(),
          },
        },
        {
          new: true,
          session: mongoSession,
        }
      );

      if (!paidTransaction) return;

      if (paidTransaction.purpose === "project_purchase") {
        const order = await Order.findOneAndUpdate(
          {
            _id: paidTransaction.order,
            buyer: paidTransaction.user,
            status: "pending",
            amount: paidTransaction.amount,
          },
          {
            $set: {
              status: "paid",
              paidAt: new Date(),
            },
          },
          {
            new: true,
            session: mongoSession,
          }
        );

        if (!order) {
          throw new Error(
            "تعذر مطابقة طلب المشروع مع معاملة الدفع"
          );
        }

        const result = await storeModel.updateOne(
          { _id: order.project },
          { $inc: { salesCount: 1 } },
          { session: mongoSession }
        );

        if (result.matchedCount === 0) {
          throw new Error("المشروع المرتبط بالطلب غير موجود");
        }
      } else if (paidTransaction.purpose === "freelance") {
        const paidFreelancePayment = await Payment.findOneAndUpdate(
          {
            _id: paidTransaction.payment,
            createdBy: paidTransaction.user,
            typepayment: "freelance",
            amount: paidTransaction.amount,
            status: "pending",
          },
          {
            $set: { status: "paid" },
          },
          {
            new: true,
            session: mongoSession,
          }
        );

        if (!paidFreelancePayment) {
          throw new Error(
            "تعذر مطابقة دفعة الفريلانس مع معاملة XPay"
          );
        }
      } else {
        throw new Error(
          `نوع معاملة XPay غير مدعوم: ${paidTransaction.purpose}`
        );
      }
    });
  } finally {
    await mongoSession.endSession();
  }

  return res.status(200).json({ received: true });
});


// --------------------------------------------------
// الاستعلام عن عملية اشتراك المستخدم
// GET /subscription/status/:paymentId
// --------------------------------------------------

export const getSubscriptionPaymentStatus = asyncHandelr(
  async (req, res, next) => {
    if (!req.user || req.user.userType !== "developer") {
      return next(
        new Error("اشتراك VIP متاح للمبرمجين فقط", { cause: 403 })
      );
    }

    const { paymentId } = req.params;

    if (!mongoose.isValidObjectId(paymentId)) {
      return next(
        new Error("معرف عملية الدفع غير صحيح", { cause: 400 })
      );
    }

    const payment = await SubscriptionPayment.findOne({
      _id: paymentId,
      user: req.user._id,
    }).lean();

    if (!payment) {
      return next(
        new Error("عملية الاشتراك غير موجودة", { cause: 404 })
      );
    }

    return successresponse(
      res,
      "تم جلب حالة الاشتراك بنجاح",
      200,
      {
        paymentId: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paidAt: payment.paidAt,
        subscriptionStartDate: payment.subscriptionStartDate,
        subscriptionEndDate: payment.subscriptionEndDate,
        createdAt: payment.createdAt,
      }
    );
  }
);


export const getSubscriptionResult = asyncHandelr(
  async (req, res, next) => {
    if (!req.user || req.user.userType !== "developer") {
      return next(
        new Error("الصفحة متاحة لحسابات المبرمجين فقط", {
          cause: 403,
        })
      );
    }

    const { sessionId } = req.params;

    if (
      typeof sessionId !== "string" ||
      !sessionId.trim() ||
      sessionId.length > 255
    ) {
      return next(
        new Error("معرف جلسة الدفع غير صحيح", { cause: 400 })
      );
    }

    // نبحث عن الجلسة ونضمن أنها تخص المبرمج الحالي.
    const payment = await SubscriptionPayment.findOne({
      xpaySessionId: sessionId,
      user: req.user._id,
    }).lean();

    if (!payment) {
      return next(
        new Error("عملية الدفع غير موجودة أو لا تخص حسابك", {
          cause: 404,
        })
      );
    }

    return successresponse(
      res,
      "تم جلب نتيجة الاشتراك بنجاح",
      200,
      {
        paymentId: payment._id,
        sessionId: payment.xpaySessionId,
        status: payment.status,
        paymentStatus: payment.xpayPaymentStatus,
        amount: payment.amount,
        currency: payment.currency,
        paidAt: payment.paidAt,
        subscriptionStartDate: payment.subscriptionStartDate,
        subscriptionEndDate: payment.subscriptionEndDate,
        createdAt: payment.createdAt,
      }
    );
  }
);
