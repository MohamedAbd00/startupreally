
import { Router } from "express";

import { middlewere } from "../../middlewere/middlewere.js";

import {
  createSubscriptionCheckout,
  getSubscriptionPaymentStatus,
  getSubscriptionResult,
  subscriptionWebhook,
} from "./service/subscription.service.js";
import { createXPayCheckoutController, getPaymentResult } from "./service/xpay.service.js";

const router = Router();

// إنشاء جلسة الدفع للمبرمج المسجل دخوله
router.post(
  "/create-checkout",
  middlewere(),
  createSubscriptionCheckout
);

// استقبال إشعارات XPay — لا يتطلب JWT من المستخدم
router.post(
  "/webhook",
  subscriptionWebhook
);

// حالة عملية الاشتراك الخاصة بالمستخدم الحالي
router.get(
  "/status/:paymentId",
  middlewere(),
  getSubscriptionPaymentStatus
);

router.get(
  "/result/:sessionId",
  middlewere(),
  getSubscriptionResult
);

// إنشاء جلسة دفع بعد تسجيل الدخول
router.post("/xpay/checkout", middlewere(), createXPayCheckoutController);
router.get(
  "/xpay/result/:sessionId",
  middlewere(),
  getPaymentResult
);

export default router;
