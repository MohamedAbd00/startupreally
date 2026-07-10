import Notification from "../../DB/models/Notification.js";
import { io } from "../../../index.js";
import { onlineUsers } from "../../socket/service/socket.js";

export const createNotification = async ({
  receiver,
  sender = null,
  type,
  title,
  body,
  project = null,
  chat = null,
  metadata = {},
}) => {
  try {
    // إنشاء الإشعار
    const notification = await Notification.create({
      receiver,
      sender,
      type,
      title,
      body,
      project,
      chat,
      metadata,
    });

    // Populate
    await notification.populate([
      {
        path: "sender",
        select: "username profileImage",
      },
      {
        path: "project",
        select: "projectName",
      },
      {
        path: "chat",
      },
    ]);

    // عدد الإشعارات غير المقروءة
    const unreadCount = await Notification.countDocuments({
      receiver,
      isRead: false,
    });

    // لو المستخدم Online ابعتله الإشعار والعداد
    const socketId = onlineUsers.get(receiver.toString());

    if (socketId) {
      io.to(socketId).emit("new-notification", notification);

      io.to(socketId).emit("notification-count", {
        count: unreadCount,
      });
    }

    return notification;
  } catch (err) {
    console.log("Notification Error:", err);
    return null;
  }
};