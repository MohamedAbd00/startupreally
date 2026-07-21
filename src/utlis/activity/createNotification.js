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
    // استخراج ID المستقبل مهما كان نوع receiver
    const receiverId =
      typeof receiver === "object" && receiver !== null
        ? (receiver._id || receiver.id)?.toString()
        : receiver?.toString();

    if (!receiverId) {
      console.error("❌ Invalid receiver:", receiver);
      return null;
    }

    // إنشاء الإشعار
    const notification = await Notification.create({
      receiver: receiverId,
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
      receiver: receiverId,
      isRead: false,
    });

    // البحث عن Socket الخاص بالمستخدم
    const socketId = onlineUsers.get(receiverId);

    console.log({
      type,
      receiverId,
      socketId,
    });

    // إرسال الإشعار لحظيًا إذا كان المستخدم Online
    if (socketId) {
      io.to(socketId).emit("new-notification", notification);

      io.to(socketId).emit("notification-count", {
        count: unreadCount,
      });

      console.log(`🔔 Notification sent to ${receiverId}`);
    } else {
      console.log(`🟡 User ${receiverId} is offline`);
    }

    return notification;
  } catch (err) {
    console.error("❌ Notification Error:", err);
    return null;
  }
};