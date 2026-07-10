import { Router } from "express";
import * as notificationService from "./service/notification.service.js";
import { middlewere } from "../middlewere/middlewere.js";

const router = Router();

// ==========================
// Get All Notifications
// ==========================

router.get(
  "/",
  middlewere(),
  notificationService.getNotifications
);

// ==========================
// Get Unread Count
// ==========================

router.get(
  "/unread-count",
  middlewere(),
  notificationService.getUnreadCount
);

// ==========================
// Mark All As Read
// ==========================
router.patch(
  "/read-all",
  middlewere(),
  notificationService.readAllNotifications
);

// ==========================
// Mark As Read
// ==========================
router.patch(
  "/:notificationId/read",
  middlewere(),
  notificationService.readNotification
);
// ==========================
// Delete One
// ==========================

router.delete(
  "/:notificationId",
  middlewere(),
  notificationService.deleteNotification
);

// ==========================
// Delete All
// ==========================

router.delete(
  "/",
  middlewere(),
  notificationService.deleteAllNotifications
);

export default router;