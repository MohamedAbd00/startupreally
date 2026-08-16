import crypto from "crypto";

import PaymentRequest from "../../../DB/models/PaymentRequest.js";

import {
  asyncHandelr,
} from "../../../utlis/response/error.response.js";

import {
  successresponse,
} from "../../../utlis/response/success.response.js";

import Order from "../../../DB/models/Order.js";
import { createPaymentAppToken } from "../../../utlis/security/Token.security.js";


// =====================================================
// CREATE PAYMENT REQUEST
// =====================================================

/*export const createPaymentRequest =
  asyncHandelr(async (req, res, next) => {

    const {
      type,
      amount,
      orderId,
      senderPhone,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !type ||
      amount === undefined ||
      amount === null ||
      !senderPhone
    ) {
      return next(
        new Error(
          "نوع الدفع والمبلغ ورقم المحفظة مطلوبين",
          {
            cause: 400,
          }
        )
      );
    }


    // ==========================================
    // NORMALIZE PHONE
    // ==========================================

    const cleanSenderPhone =
      String(senderPhone)
        .trim()
        .replace(/\s+/g, "")
        .replace(/^\+20/, "0");


    if (!/^01[0125]\d{8}$/.test(cleanSenderPhone)) {
      return next(
        new Error(
          "رقم المحفظة غير صحيح",
          {
            cause: 400,
          }
        )
      );
    }


    // ==========================================
    // AMOUNT
    // ==========================================

    const paymentAmount =
      Number(amount);


    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      return next(
        new Error(
          "المبلغ غير صحيح",
          {
            cause: 400,
          }
        )
      );
    }


    // ==========================================
    // PAYMENT NUMBER
    // ==========================================

    const paymentNumber =
      process.env.PAYMENT_NUMBER;


    if (!paymentNumber) {
      return next(
        new Error(
          "رقم استقبال الدفع غير مضبوط في إعدادات الخادم",
          {
            cause: 500,
          }
        )
      );
    }


    // ==========================================
    // ORDER
    // ==========================================

    let order = null;


    if (orderId) {

      order =
        await Order.findById(orderId);


      if (!order) {
        return next(
          new Error(
            "الطلب غير موجود",
            {
              cause: 404,
            }
          )
        );
      }


      // ========================================
      // CHECK ORDER OWNER
      // ========================================

      if (
        order.buyer &&
        order.buyer.toString() !==
          req.user._id.toString()
      ) {
        return next(
          new Error(
            "هذا الطلب لا يخص المستخدم",
            {
              cause: 403,
            }
          )
        );
      }
    }


    // ==========================================
    // PREVENT DUPLICATE PAYMENT
    // ==========================================

    if (orderId) {

      const existingPayment =
        await PaymentRequest.findOne({

          order: orderId,

          status: {
            $in: [
              "pending",
              "verifying",
              "paid",
            ],
          },

        });


      if (existingPayment) {
        return next(
          new Error(
            "يوجد طلب دفع لهذا الطلب بالفعل",
            {
              cause: 400,
            }
          )
        );
      }
    }


    // ==========================================
    // REFERENCE
    // ==========================================

    const reference =
      `PAY-${Date.now()}-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;


    // ==========================================
    // CREATE PAYMENT
    // ==========================================

    const payment =
      await PaymentRequest.create({

        user:
          req.user._id,

        order:
          orderId || null,

        type,

        amount:
          paymentAmount,

        // رقم العميل الذي سيحوّل منه
        senderPhone:
          cleanSenderPhone,

        reference,

        // رقمك الذي يستقبل التحويل
        paymentNumber,

        status:
          "pending",

        expiresAt:
          new Date(
            Date.now() +
            15 * 60 * 1000
          ),

      });


    // ==========================================
    // REALTIME -> PAYMENT APP
    // ==========================================

    const io =
      req.app.get("io");


    if (io) {
      io.to("finance-mobile")
        .emit(
          "payment:new-request",
          {

            paymentId:
              payment._id.toString(),

            reference:
              payment.reference,

            amount:
              payment.amount,

            type:
              payment.type,

            // رقم الاستقبال
            paymentNumber:
              payment.paymentNumber,

            // رقم العميل
            senderPhone:
              payment.senderPhone,

            orderId:
              payment.order
                ? payment.order.toString()
                : null,

            createdAt:
              payment.createdAt,

            expiresAt:
              payment.expiresAt,

          }
        );
    }


    // ==========================================
    // RESPONSE
    // ==========================================

    return successresponse(
      res,

      "تم إنشاء طلب الدفع",

      201,

      {

        payment: {

          _id:
            payment._id,

          reference:
            payment.reference,

          amount:
            payment.amount,

          type:
            payment.type,

          senderPhone:
            payment.senderPhone,

          paymentNumber:
            payment.paymentNumber,

          status:
            payment.status,

          expiresAt:
            payment.expiresAt,

        },

      }
    );

  });*/

export const createPaymentRequest =
  asyncHandelr(async (req, res, next) => {

    const {
      type,
      amount,
      orderId,
      senderPhone,
    } = req.body;

    const io =
      req.app.get("io");

    const payment =
      await createPaymentRequestService({
        userId: req.user._id,
        orderId,
        type,
        amount,
        senderPhone,
        io,
      });

    return successresponse(
      res,
      "تم إنشاء طلب الدفع",
      201,
      {
        payment: {
          _id:
            payment._id,

          reference:
            payment.reference,

          amount:
            payment.amount,

          type:
            payment.type,

          senderPhone:
            payment.senderPhone,

          paymentNumber:
            payment.paymentNumber,

          status:
            payment.status,

          expiresAt:
            payment.expiresAt,
        },
      }
    );
  });
  export const createPaymentRequestService = async ({
  userId,
  orderId,
  type,
  amount,
  senderPhone,
  io,
}) => {
  if (
    !type ||
    amount === undefined ||
    amount === null ||
    !senderPhone
  ) {
    throw new Error(
      "نوع الدفع والمبلغ ورقم المحفظة مطلوبين",
      {
        cause: 400,
      }
    );
  }

  const cleanSenderPhone = String(senderPhone)
    .trim()
    .replace(/\s+/g, "")
    .replace(/^\+20/, "0");

  if (!/^01[0125]\d{8}$/.test(cleanSenderPhone)) {
    throw new Error(
      "رقم المحفظة غير صحيح",
      {
        cause: 400,
      }
    );
  }

  const paymentAmount = Number(amount);

  if (
    !Number.isFinite(paymentAmount) ||
    paymentAmount <= 0
  ) {
    throw new Error(
      "المبلغ غير صحيح",
      {
        cause: 400,
      }
    );
  }

  const paymentNumber =
    process.env.PAYMENT_NUMBER;

  if (!paymentNumber) {
    throw new Error(
      "رقم استقبال الدفع غير مضبوط في إعدادات الخادم",
      {
        cause: 500,
      }
    );
  }

  let order = null;

  if (orderId) {
    order = await Order.findById(orderId);

    if (!order) {
      throw new Error(
        "الطلب غير موجود",
        {
          cause: 404,
        }
      );
    }

    if (
      order.buyer &&
      order.buyer.toString() !==
        userId.toString()
    ) {
      throw new Error(
        "هذا الطلب لا يخص المستخدم",
        {
          cause: 403,
        }
      );
    }
  }

  if (orderId) {
    const existingPayment =
      await PaymentRequest.findOne({
        order: orderId,
        status: {
          $in: [
            "pending",
            "verifying",
            "paid",
          ],
        },
      });

    if (existingPayment) {
      throw new Error(
        "يوجد طلب دفع لهذا الطلب بالفعل",
        {
          cause: 400,
        }
      );
    }
  }

  const reference =
    `PAY-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

  const payment =
    await PaymentRequest.create({
      user: userId,

      order: orderId || null,

      type,

      amount: paymentAmount,

      senderPhone:
        cleanSenderPhone,

      reference,

      paymentNumber,

      status: "pending",

      expiresAt: new Date(
        Date.now() +
          15 * 60 * 1000
      ),
    });

  if (io) {
    io.to("finance-mobile").emit(
      "payment:new-request",
      {
        paymentId:
          payment._id.toString(),

        reference:
          payment.reference,

        amount:
          payment.amount,

        type:
          payment.type,

        paymentNumber:
          payment.paymentNumber,

        senderPhone:
          payment.senderPhone,

        orderId:
          payment.order
            ? payment.order.toString()
            : null,

        createdAt:
          payment.createdAt,

        expiresAt:
          payment.expiresAt,
      }
    );
  }

  return payment;
};
// =====================================================
// VERIFY PAYMENT
// =====================================================

export const verifyPayment =
  asyncHandelr(async (req, res, next) => {

    const {
      paymentId,
      verified,
      transactionId,
      detectedAmount,
      sender,
      note,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!paymentId) {
      return next(
        new Error("معرف الدفع مطلوب", { cause: 400 })
      );
    }

    if (typeof verified !== "boolean") {
      return next(
        new Error("حالة التحقق مطلوبة", { cause: 400 })
      );
    }


    // ==========================================
    // FIND PAYMENT
    // ==========================================

    const payment = await PaymentRequest.findById(paymentId);

    if (!payment) {
      return next(
        new Error("طلب الدفع غير موجود", { cause: 404 })
      );
    }


    // ==========================================
    // EXPIRED
    // ==========================================

    if (payment.expiresAt <= new Date()) {

      if (payment.status === "pending" || payment.status === "verifying") {
        payment.status = "expired";
        await payment.save();
      }

      return next(
        new Error("انتهت صلاحية طلب الدفع", { cause: 400 })
      );
    }


    // ==========================================
    // ALREADY PROCESSED
    // ==========================================

    if (payment.status !== "pending" && payment.status !== "verifying") {
      return next(
        new Error("تمت معالجة طلب الدفع بالفعل", { cause: 400 })
      );
    }


    // ==========================================
    // PAYMENT APP AUTH
    // ==========================================

    if (!req.paymentApp || !req.paymentApp.deviceId) {
      return next(
        new Error("تطبيق الدفع غير مصرح له", { cause: 403 })
      );
    }

    const deviceId = req.paymentApp.deviceId;


    // =================================================
    // REJECT
    // =================================================

    if (!verified) {

      payment.status = "rejected";

      payment.verification = {
        verifiedByApp: deviceId,
        verifiedAt: new Date(),
        transactionId: transactionId || null,
        detectedAmount: detectedAmount != null ? Number(detectedAmount) : null,
        sender: sender || null,
        note: note || "لم يتم العثور على التحويل",
      };

      await payment.save();


      // ========================================
      // REALTIME
      // ========================================

      const io = req.app.get("io");

      if (io) {

        // Full payload so the finance table can update the row
        // in place instead of wiping amount/type/user to blank.
        const financePayload = {
          paymentId: payment._id.toString(),
          reference: payment.reference,
          status: "rejected",
          amount: payment.amount,
          type: payment.type,
          senderPhone: payment.senderPhone,
          paymentNumber: payment.paymentNumber,
          orderId: payment.order ? payment.order.toString() : null,
          note: payment.verification.note,
        };

        io.to(`user:${payment.user}`).emit("payment:updated", financePayload);

        io.to("finance-mobile").emit("payment:processed", financePayload);
      }

      return successresponse(res, "تم رفض عملية الدفع", 200, { payment });
    }


    // =================================================
    // VERIFIED PAYMENT
    // =================================================

    if (detectedAmount === undefined || detectedAmount === null) {
      return next(
        new Error("مبلغ التحويل مطلوب", { cause: 400 })
      );
    }

    const detected = Number(detectedAmount);

    if (!Number.isFinite(detected) || detected <= 0) {
      return next(
        new Error("مبلغ التحويل غير صحيح", { cause: 400 })
      );
    }

    if (detected !== payment.amount) {
      return next(
        new Error(
          `مبلغ التحويل لا يطابق المبلغ المطلوب (${payment.amount})`,
          { cause: 400 }
        )
      );
    }

    if (!sender) {
      return next(
        new Error("رقم المرسل مطلوب للتحقق", { cause: 400 })
      );
    }

    const normalizePhone = (value) => {
      if (!value) return "";
      return String(value).trim().replace(/\s+/g, "").replace(/^\+20/, "0");
    };

    const expectedSender = normalizePhone(payment.senderPhone);
    const detectedSender = normalizePhone(sender);

    if (expectedSender !== detectedSender) {
      return next(
        new Error(
          "رقم التحويل لا يطابق رقم المحفظة الذي أدخله العميل",
          { cause: 400 }
        )
      );
    }

    if (!transactionId) {
      return next(
        new Error("رقم العملية مطلوب", { cause: 400 })
      );
    }


    // ==========================================
    // PREVENT DUPLICATE TRANSACTION
    // ==========================================

    const usedTransaction = await PaymentRequest.findOne({
      transactionId,
      _id: { $ne: payment._id },
    });

    if (usedTransaction) {
      return next(
        new Error("رقم العملية مستخدم من قبل", { cause: 400 })
      );
    }


    // ==========================================
    // MARK PAID
    // ==========================================

    payment.status = "paid";
    payment.transactionId = transactionId;

    payment.verification = {
      verifiedByApp: deviceId,
      verifiedAt: new Date(),
      transactionId,
      detectedAmount: detected,
      sender: detectedSender,
      note: note || null,
    };

    await payment.save();


    // ==========================================
    // UPDATE ORDER
    // ==========================================

    if (payment.order) {
      await Order.findByIdAndUpdate(payment.order, {
        status: "paid",
        paidAt: new Date(),
      });
    }


    // ==========================================
    // REALTIME
    // ==========================================

    const io = req.app.get("io");

    if (io) {

      // Full payload — this is what fixes the finance table:
      // without amount/type/user here, the frontend's optimistic
      // merge overwrites the row with blank values until the next
      // full refresh.
      const financePayload = {
        paymentId: payment._id.toString(),
        reference: payment.reference,
        status: "paid",
        amount: payment.amount,
        type: payment.type,
        senderPhone: payment.senderPhone,
        paymentNumber: payment.paymentNumber,
        orderId: payment.order ? payment.order.toString() : null,
        transactionId,
      };

      // USER
      io.to(`user:${payment.user}`).emit("payment:updated", financePayload);

      // PAYMENT APP / FINANCE DASHBOARD
      io.to("finance-mobile").emit("payment:processed", financePayload);
    }


    // ==========================================
    // RESPONSE
    // ==========================================

    return successresponse(res, "تم تأكيد الدفع بنجاح", 200, { payment });

  });


// =====================================================
// GET PENDING PAYMENTS
// PAYMENT APP
// =====================================================

export const getPendingPayments =
  asyncHandelr(async (req, res, next) => {

    const payments =
      await PaymentRequest.find({

        status: {
          $in: [
            "pending",
            "verifying",
          ],
        },

        expiresAt: {
          $gt: new Date(),
        },

      })
        .populate(
          "user",
          "username email"
        )
        .populate(
          "order",
          "amount package project"
        )
        .sort({
          createdAt: -1,
        })
        .lean();


    return successresponse(
      res,

      "تم جلب طلبات الدفع",

      200,

      {
        payments,
      }
    );

  });


// =====================================================
// GET PAYMENT STATUS
// USER
// =====================================================

export const getPaymentStatus =
  asyncHandelr(async (req, res, next) => {

    const {
      paymentId,
    } = req.params;


    if (!paymentId) {

      return next(
        new Error(
          "معرف الدفع مطلوب",
          {
            cause: 400,
          }
        )
      );

    }


    const payment =
      await PaymentRequest.findOne({

        _id:
          paymentId,

        user:
          req.user._id,

      })
        .populate("order")
        .lean();


    if (!payment) {

      return next(
        new Error(
          "طلب الدفع غير موجود",
          {
            cause: 404,
          }
        )
      );

    }


    return successresponse(

      res,

      "تم جلب حالة الدفع",

      200,

      {
        payment,
      }

    );

  });



export const createSimulatorToken = (req, res, next) => {
  try {

    const token = createPaymentAppToken({
      deviceId: "payment-simulator-001",
    });

    return res.status(200).json({
      success: true,
      message: "تم إنشاء Payment App Token",
      token,
    });

  } catch (error) {
    console.log("Create Simulator Token Error:", error);

    return res.status(500).json({
      success: false,
      message: "فشل إنشاء Payment App Token",
    });
  }
};