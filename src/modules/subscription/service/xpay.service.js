
import crypto from "node:crypto";
import mongoose from "mongoose";

import XPayTransaction from "../../../DB/models/XPayTransaction.js";
import Order from "../../../DB/models/Order.js";
import Payment from "../../../DB/models/Payment .js";
import storeModel from "../../../DB/models/store.js";
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import {successresponse} from "../../../utlis/response/success.response.js"
export const createXPaySession = async ({
  userId,
  purpose,
  amount,
  orderId = null,
  paymentId = null,
}) => {
  if (!process.env.XPAY_SECRET_KEY || !process.env.FRONTEND_URL) {
    throw new Error("إعدادات XPay غير مكتملة", { cause: 500 });
  }

  if (!purpose) {
    throw new Error("نوع عملية الدفع مطلوب", { cause: 400 });
  }

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    throw new Error("مبلغ الدفع غير صحيح", { cause: 400 });
  }

  const transaction = await XPayTransaction.create({
    user: userId,
    purpose,
    order: orderId,
    payment: paymentId,
    amount: Number(amount),
    currency: "EGP",
    status: "pending",
  });

  try {
    const frontendUrl = process.env.FRONTEND_URL.replace(/\/+$/, "");

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
                unitAmount: Math.round(Number(amount) * 100),
                productData: {
                  name:
                    purpose === "project_purchase"
                      ? "Progzila Project Purchase"
                      : "Progzila Freelance Payment",
                },
              },
              quantity: 1,
            },
          ],
          metadata: {
            xpayTransactionId: transaction._id.toString(),
            userId: userId.toString(),
            purpose,
            orderId: orderId?.toString() || "",
            paymentId: paymentId?.toString() || "",
          },
          afterCompletion: {
            type: "redirect",
            redirect: {
              url:
                process.env.XPAY_PAYMENT_RETURN_URL ||
                `${frontendUrl}/payment/result/{CHECKOUT_SESSION_ID}`,
            },
          },
        }),
      }
    );

    const session = await response.json();

    if (!response.ok || !session.id || !session.url) {
      console.error("XPay session creation failed:", session);
      throw new Error("XPay لم يتمكن من إنشاء جلسة الدفع");
    }

    transaction.xpaySessionId = session.id;
    transaction.xpayCheckoutUrl = session.url;
    transaction.xpayPaymentStatus = session.paymentStatus || "unpaid";

    await transaction.save();

    return {
      transactionId: transaction._id,
      checkoutUrl: session.url,
      sessionId: session.id,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
    };
  } catch (error) {
    transaction.status = "failed";
    await transaction.save();

    console.error("XPay checkout error:", error);

    throw new Error("تعذر إنشاء جلسة الدفع لدى XPay", {
      cause: 502,
    });
  }
};
export const verifyXPaySignature = (rawBody, signatureHeader) => {
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
  const signature = parts.v1;

  if (
    !Number.isFinite(timestamp) ||
    !signature ||
    Math.abs(Math.floor(Date.now() / 1000) - timestamp) > 300 ||
    !/^[a-fA-F0-9]+$/.test(signature)
  ) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.XPAY_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody.toString("utf8")}`)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "hex");
  const received = Buffer.from(signature, "hex");

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



export const createXPayCheckoutController = asyncHandelr(
  async (req, res, next) => {
    const { purpose, orderId, paymentId } = req.body;
    const userId = req.user._id;

    if (purpose === "project_purchase") {
      if (!mongoose.isValidObjectId(orderId)) {
        return next(new Error("معرف الطلب غير صحيح", { cause: 400 }));
      }

      const order = await Order.findOne({
        _id: orderId,
        buyer: userId,
        status: "pending",
      });

      if (!order) {
        return next(new Error("الطلب غير موجود أو غير متاح للدفع", { cause: 404 }));
      }

      const existing = await XPayTransaction.findOne({
        order: order._id,
        status: "pending",
      });

      if (existing?.xpayCheckoutUrl) {
        return res.status(200).json({
          message: "جلسة دفع موجودة بالفعل",
          checkoutUrl: existing.xpayCheckoutUrl,
          transactionId: existing._id,
        });
      }

      const result = await createXPaySession({
        userId,
        purpose,
        orderId: order._id,
        amount: order.amount,
      });

      return res.status(201).json(result);
    }

    if (purpose === "freelance") {
      if (!mongoose.isValidObjectId(paymentId)) {
        return next(new Error("معرف الدفعة غير صحيح", { cause: 400 }));
      }

      const payment = await Payment.findOne({
        _id: paymentId,
        createdBy: userId,
        typepayment: "freelance",
        status: "pending",
      });

      if (!payment) {
        return next(new Error("دفعة الفريلانس غير موجودة أو غير متاحة للدفع", { cause: 404 }));
      }

      const existing = await XPayTransaction.findOne({
        payment: payment._id,
        status: "pending",
      });

      if (existing?.xpayCheckoutUrl) {
        return res.status(200).json({
          message: "جلسة دفع موجودة بالفعل",
          checkoutUrl: existing.xpayCheckoutUrl,
          transactionId: existing._id,
        });
      }

      const result = await createXPaySession({
        userId,
        purpose,
        paymentId: payment._id,
        amount: payment.amount,
      });

      return res.status(201).json(result);
    }

    return next(new Error("نوع الدفع غير مدعوم", { cause: 400 }));
  }
);

export const getPaymentResult = asyncHandelr(async (req, res, next) => {
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

  const tx = await XPayTransaction.findOne({
    xpaySessionId: sessionId,
    user: req.user._id,
  }).lean();

  if (!tx) {
    return next(
      new Error("عملية الدفع غير موجودة أو لا تخص حسابك", {
        cause: 404,
      })
    );
  }

  return successresponse(
    res,
    "تم جلب نتيجة الدفع بنجاح",
    200,
    {
      transactionId: tx._id,
      sessionId: tx.xpaySessionId,
      purpose: tx.purpose,
      status: tx.status, // pending | paid | failed | expired
      paymentStatus: tx.xpayPaymentStatus,
      amount: tx.amount,
      currency: tx.currency,
      orderId: tx.order,
      paymentId: tx.payment,
      paidAt: tx.paidAt,
      createdAt: tx.createdAt,
    }
  );
});
