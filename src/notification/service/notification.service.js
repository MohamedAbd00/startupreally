import Notification from "../../DB/models/Notification.js";
import { asyncHandelr } from "../../utlis/response/error.response.js";
import { successresponse } from "../../utlis/response/success.response.js";
import { io } from "../../../index.js";
import { onlineUsers } from "../../socket/service/socket.js";


// ===============================
// Get Notifications
// ===============================

export const getNotifications = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  const notifications = await Notification.find({
    receiver: userId,
  })
    .populate("sender", "username profileImage")
    .populate("project", "projectName")
    .populate("chat")
    .sort({ createdAt: -1 });

  return successresponse(
    res,
    "تم جلب الإشعارات",
    200,
    notifications
  );
});


// ===============================
// Unread Count
// ===============================

export const getUnreadCount = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  const count = await Notification.countDocuments({
    receiver: userId,
    isRead: false,
  });

  return successresponse(res, "Unread Count", 200, {
    count,
  });
});


// ===============================
// Mark Read
// ===============================

export const readNotification = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    _id: notificationId,
    receiver: userId,
  });

  if (!notification) {
    return next(new Error("الإشعار غير موجود", { cause: 404 }));
  }

  notification.isRead = true;

  await notification.save();

  const count = await Notification.countDocuments({
    receiver: userId,
    isRead: false,
  });

  const socketId = onlineUsers.get(userId.toString());

  if (socketId) {
    io.to(socketId).emit("notification-read", {
      notificationId,
    });

    io.to(socketId).emit("notification-count", {
      count,
    });
  }

  return successresponse(
    res,
    "تم قراءة الإشعار",
    200,
    notification
  );
});


// ===============================
// Mark All Read
// ===============================

export const readAllNotifications = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  await Notification.updateMany(
    {
      receiver: userId,
      isRead: false,
    },
    {
      isRead: true,
    }
  );

  const socketId = onlineUsers.get(userId.toString());

  if (socketId) {
    io.to(socketId).emit("notification-read-all");

    io.to(socketId).emit("notification-count", {
      count: 0,
    });
  }

  return successresponse(
    res,
    "تم تعليم الكل كمقروء",
    200
  );
});


// ===============================
// Delete Notification
// ===============================

export const deleteNotification = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    _id: notificationId,
    receiver: userId,
  });

  if (!notification) {
    return next(new Error("الإشعار غير موجود", { cause: 404 }));
  }

  await notification.deleteOne();

  const count = await Notification.countDocuments({
    receiver: userId,
    isRead: false,
  });

  const socketId = onlineUsers.get(userId.toString());

  if (socketId) {
    io.to(socketId).emit("notification-deleted", {
      notificationId,
    });

    io.to(socketId).emit("notification-count", {
      count,
    });
  }

  return successresponse(
    res,
    "تم حذف الإشعار",
    200
  );
});


// ===============================
// Delete All
// ===============================

export const deleteAllNotifications = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  await Notification.deleteMany({
    receiver: userId,
  });

  const socketId = onlineUsers.get(userId.toString());

  if (socketId) {
    io.to(socketId).emit("notification-cleared");

    io.to(socketId).emit("notification-count", {
      count: 0,
    });
  }

  return successresponse(
    res,
    "تم حذف جميع الإشعارات",
    200
  );
});