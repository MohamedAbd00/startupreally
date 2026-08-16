import { Router } from "express";

import { middlewere } from "../../middlewere/middlewere.js";
import { createPaymentRequest, createappToken, getPaymentStatus, getPendingPayments, verifyPayment } from "./service/payment.service.js";
import { paymentAppAuth } from "../../middlewere/financeMobileAuth.js";


const router = Router();
router.post(
  "/create",
  middlewere(),
  createPaymentRequest
);


// حالة الدفع للمستخدم
router.get(
  "/status/:paymentId",
  middlewere(),
  getPaymentStatus
);


// =====================================================
// PAYMENT MOBILE APP
// =====================================================

// جلب الطلبات المعلقة
router.get(
  "/mobile/pending",
  paymentAppAuth,
  getPendingPayments
);


// تأكيد / رفض الدفع
router.post(
  "/verifyPayment",
  paymentAppAuth,
  verifyPayment
);
router.post(
  "/payment-app/simulator-token",
  createappToken
);

export default router;