import { io } from "../../../index.js";
import Notification from "../../DB/models/Notification.js";
import Users from "../../DB/models/usermodel.js";
import Chats from "../../DB/models/chat.js";
import Messages from "../../DB/models/massege.js";
import { createNotification } from "../../utlis/activity/createNotification.js";
import chatsupport from "../../DB/models/chatsupport.js";
import {
  verifyPaymentAppToken,
} from "../../utlis/security/Token.security.js";
import chatdiscussion from "../../DB/models/chatdiscussion.js";
const onlineUsers = new Map();
const extractId = (data, key = "userId") => {
  if (!data) return null;

  // لو ObjectId أو String
  if (typeof data === "string") return data;

  // لو Object
  if (typeof data === "object") {
    if (data[key]) return data[key];

    // لو اتبعت ObjectId داخل id
    if (data._id) return data._id;
  }

  return null;
};
export { onlineUsers };

export const socketConnection = () => {
  io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);


// =====================================================
// PAYMENT / FINANCE SOCKET AUTHENTICATION
// =====================================================

const paymentToken =
  socket.handshake.auth?.paymentToken;

const adminToken =
  socket.handshake.auth?.token;


// =====================================================
// PAYMENT APP
// =====================================================

if (paymentToken) {

  try {

    const decoded =
      verifyPaymentAppToken(
        paymentToken
      );


    if (
      decoded.type ===
      "payment-app"
    ) {

      socket.paymentApp = true;

      socket.paymentDeviceId =
        decoded.deviceId;


      // ===============================================
      // PAYMENT APP -> FINANCE ROOM
      // ===============================================

      socket.join(
        "finance-mobile"
      );


      console.log(
        `💰 Payment App Joined finance-mobile: ${decoded.deviceId}`
      );


      socket.emit(
        "payment-app-connected",
        {

          success: true,

          deviceId:
            decoded.deviceId,

          room:
            "finance-mobile",

        }
      );

    }

  } catch (error) {

    console.log(
      "❌ Invalid Payment App Token:",
      error.message
    );


    socket.emit(
      "payment-app-error",
      {
        message:
          "Payment App Token غير صالح",
      }
    );

  }

}


// =====================================================
// FINANCE DASHBOARD
// =====================================================

// وجود adminToken يسمح للـ socket بالاتصال
// لكن دخول غرفة المالية يتم من خلال join-finance

if (adminToken) {

  socket.financeDashboard =
    true;


  console.log(
    `💰 Finance Dashboard Socket Connected: ${socket.id}`
  );


  socket.emit(
    "finance-dashboard-connected",
    {

      success: true,

      socketId:
        socket.id,

    }
  );

}


// =====================================================
// JOIN FINANCE ROOM
// =====================================================

socket.on(
  "join-finance",
  () => {

    try {

      // ===============================================
      // تأكد أن الاتصال Admin Dashboard
      // ===============================================

      if (
        !socket.financeDashboard
      ) {

        console.log(
          `❌ Unauthorized join-finance: ${socket.id}`
        );

        return;

      }


      // ===============================================
      // JOIN ROOM
      // ===============================================

      socket.join(
        "finance-mobile"
      );


      console.log(
        `💰 Finance Dashboard Joined finance-mobile: ${socket.id}`
      );


      // ===============================================
      // CONFIRM TO FRONTEND
      // ===============================================

      socket.emit(
        "finance-joined",
        {

          success: true,

          room:
            "finance-mobile",

          socketId:
            socket.id,

        }
      );

    } catch (error) {

      console.log(
        "❌ join-finance Error:",
        error
      );

    }

  }
);


// =====================================================
// FINANCE MOBILE OFFLINE
// =====================================================

socket.on(
  "finance-mobile-offline",
  () => {

    try {

      socket.leave(
        "finance-mobile"
      );


      console.log(
        `💰 Finance Mobile Left finance-mobile: ${socket.id}`
      );

    } catch (err) {

      console.log(
        "Finance Mobile Offline Error:",
        err
      );

    }

  }
);

// =====================================================
// 💰 FINANCE MOBILE DISCONNECT
// =====================================================

socket.on("finance-mobile-offline", () => {
  try {
    socket.leave("finance-mobile");

    console.log(
      `💰 Finance Mobile Offline: ${socket.financeAdminId || socket.id}`
    );

  } catch (err) {
    console.log("Finance Mobile Offline Error:", err);
  }
});
    // ==========================
    // USER ONLINE
    // ==========================

    socket.on("user-online", async (data) => {
  try {
    const userId = extractId(data);

    if (!userId) return;

    socket.userId = userId.toString();

    onlineUsers.set(userId.toString(), socket.id);

    await Users.findByIdAndUpdate(userId, {
      isOnline: true,
    });

    socket.broadcast.emit("online-users", [...onlineUsers.keys()]);
  } catch (err) {
    console.log(err);
  }
});
// ==========================
// GET NOTIFICATION COUNT
// ==========================
socket.on("get-notification-count", async (data) => {
  try {
    const userId = extractId(data);

    if (!userId) return;

    const count = await Notification.countDocuments({
      receiver: userId,
      isRead: false,
    });

    socket.emit("notification-count", {
      count,
    });
  } catch (err) {
    console.log(err);
  }
});
// ==========================
// LOAD NOTIFICATIONS
// ==========================

socket.on("load-notifications", async (data) => {
  try {
    const userId = extractId(data);

    if (!userId) return;

    const notifications = await Notification.find({
      receiver: userId,
    })
      .populate("sender", "username profileImage")
      .populate("project", "projectName")
      .sort({ createdAt: -1 })
      .limit(20);

    socket.emit("notifications", notifications);
  } catch (err) {
    console.log(err);
  }
});
// ==========================
// READ NOTIFICATION
// ==========================
socket.on("read-notification", async (data) => {
  try {
    const userId = extractId(data);
    const notificationId = data.notificationId;

    if (!userId || !notificationId) return;

    await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        receiver: userId,
      },
      {
        isRead: true,
      }
    );

    const count = await Notification.countDocuments({
      receiver: userId,
      isRead: false,
    });

    socket.emit("notification-read", notificationId);

    socket.emit("notification-count", {
      count,
    });
  } catch (err) {
    console.log(err);
  }
});
// ==========================
// READ NOTIFICATION
// ==========================

socket.on("read-notification", async ({ userId, notificationId }) => {
  try {
    await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        receiver: userId,
      },
      {
        isRead: true,
      }
    );

    const count = await Notification.countDocuments({
      receiver: userId,
      isRead: false,
    });

    socket.emit("notification-read", notificationId);

    socket.emit("notification-count", {
      count,
    });
  } catch (err) {
    console.log(err);
  }
});
// ==========================
// DELETE NOTIFICATION
// ==========================

socket.on("delete-notification", async (data) => {
  try {
    const userId = extractId(data);
    const notificationId = data.notificationId;

    if (!userId || !notificationId) return;

    await Notification.deleteOne({
      _id: notificationId,
      receiver: userId,
    });

    const count = await Notification.countDocuments({
      receiver: userId,
      isRead: false,
    });

    socket.emit("notification-deleted", notificationId);

    socket.emit("notification-count", {
      count,
    });
  } catch (err) {
    console.log(err);
  }
});
// ==========================
// DELETE ALL
// ==========================

socket.on("delete-all-notifications", async (data) => {
  try {
    const userId = extractId(data);

    if (!userId) return;

    await Notification.deleteMany({
      receiver: userId,
    });

    socket.emit("notification-cleared");

    socket.emit("notification-count", {
      count: 0,
    });
  } catch (err) {
    console.log(err);
  }
});
    // ==========================
    // JOIN CHAT
    // ==========================

    socket.on("join-chat", async (chatId) => {
      try {
        if (!chatId || !socket.userId) return;

        const chat = await Chats.findById(chatId);

        if (!chat) return;

        if (
          chat.client.toString() !== socket.userId &&
          chat.developer.toString() !== socket.userId
        ) {
          return;
        }

        socket.join(chatId);

        console.log(`Joined Chat : ${chatId}`);
      } catch (err) {
        console.log(err);
      }
    });



  //==============================
    //chat join support
    //==============================
     socket.on("join-chat-Discussion", async (chatId) => {
      try {
        if (!chatId || !socket.userId) return;

        const chat = await chatdiscussion.findById(chatId);

        if (!chat) return;

        if (
          chat.client.toString() !== socket.userId &&
          chat.developer.toString() !== socket.userId
        ) {
          return;
        }

        socket.join(chatId);

        console.log(`Joined Chat : ${chatId}`);
      } catch (err) {
        console.log(err);
      }
    });

    //==============================
    //chat join support
    //==============================
     socket.on("join-chat-support", async (chatId) => {
      try {
        if (!chatId || !socket.userId) return;

        const chat = await chatsupport.findById(chatId);

        if (!chat) return;

        if (
          chat.client.toString() !== socket.userId &&
          chat.developer.toString() !== socket.userId
        ) {
          return;
        }

        socket.join(chatId);

        console.log(`Joined Chat : ${chatId}`);
      } catch (err) {
        console.log(err);
      }
    });

    // ==========================
    // LEAVE CHAT
    // ==========================

    socket.on("leave-chat", (chatId) => {
      socket.leave(chatId);
    });

    // ==========================
    // LOAD OLD MESSAGES
    // ==========================

    socket.on("load-messages", async (chatId) => {
      try {
        const messages = await Messages.find({
          chat: chatId,
        })
          .populate("sender", "username profileImage isOnline")
          .sort({ createdAt: 1 });

        socket.emit("old-messages", messages);
      } catch (err) {
        console.log(err);
      }
    });

    // ==========================
    // SEND MESSAGE
    // ==========================
// ==========================
    // SEND MESSAGE
    // ==========================

    socket.on("send-message", async (data) => {
  try {
    const { chatId, sender, text, file = "", fileType = "" } = data;

    if (!chatId || (!text && !file)) return;

    // بيانات المرسل
    const currentUser = await Users.findById(sender).select(
      "username profileImage isOnline"
    );

    // رسالة مؤقتة للعرض الفوري
    const tempMessageId = "msg-" + Date.now();

    const messagePayload = {
      _id: tempMessageId,
      chat: chatId,
      sender: {
        _id: currentUser?._id,
        username: currentUser?.username,
        profileImage: currentUser?.profileImage,
        isOnline: currentUser?.isOnline,
      },
      text,
      file,
      fileType,
      delivered: true,
      seen: false,
      createdAt: new Date().toISOString(),
    };
    // إرسال الرسالة فوراً للطرفين
    io.to(chatId).emit("receive-message", messagePayload);

    // الحفظ بالخلفية
    Messages.create({
      chat: chatId,
      sender,
      text,
      file,
      fileType,
      delivered: true,
      seen: false,
    })
      .then(async (savedMessage) => {
        // تحديث آخر رسالة بالشات
        await Chats.findByIdAndUpdate(chatId, {
          lastMessage: savedMessage._id,
          lastActivity: new Date(),
        });

        // جلب الشات لمعرفة المستقبل
        const chat = await Chats.findById(chatId);

        if (!chat) return;

        const receiver =
          chat.client.toString() === sender
            ? chat.developer.toString()
            : chat.client.toString();

        // إشعار الرسالة
        await createNotification({
          receiver,
          sender,
          type: "message",
          title: "رسالة جديدة",
          body: text || "قام بإرسال ملف",
          chat: chatId,
          metadata: {
            messageId: savedMessage._id,
          },
        });

        // لو الشخص أونلاين ابعتله الرسالة بالـ id الحقيقي
        if (onlineUsers.has(receiver)) {
          io.to(onlineUsers.get(receiver)).emit(
            "new-message-notification",
            {
              ...messagePayload,
              _id: savedMessage._id,
            }
          );
        }
      })
      .catch((err) => {
        console.log("DB Error:", err);
      });
  } catch (err) {
    console.log(err);
  }
});

socket.on("send-message-vip", async (data) => {
  try {
    const {
      chatId,
      sender,
      text,
      file = "",
      fileType = "",
    } = data;

    if (!chatId || (!text && !file)) return;

    // بيانات المرسل
    const currentUser = await Users.findById(sender).select(
      "username profileImage isOnline plan userType"
    );

    if (!currentUser) {
      socket.emit("message-error", {
        message: "المستخدم غير موجود",
        status: 404,
      });
      return;
    }

    // المبرمج لازم يكون VIP
    if (
      currentUser.userType === "developer" &&
      currentUser.plan !== "vip"
    ) {
      socket.emit("message-error", {
        message: "اشترك في الباقة VIP لإرسال الرسائل",
        status: 403,
      });
      return;
    }

    // العميل يقدر يرسل عادي
    // client لا يحتاج VIP

    // رسالة مؤقتة للعرض الفوري
    const tempMessageId = "msg-" + Date.now();

    const messagePayload = {
      _id: tempMessageId,
      chat: chatId,
      sender: {
        _id: currentUser._id,
        username: currentUser.username,
        profileImage: currentUser.profileImage,
        isOnline: currentUser.isOnline,
      },
      text,
      file,
      fileType,
      delivered: true,
      seen: false,
      createdAt: new Date().toISOString(),
    };

    // إرسال الرسالة فوراً للطرفين
    io.to(chatId).emit("receive-message", messagePayload);

    // الحفظ في قاعدة البيانات
    Messages.create({
      chat: chatId,
      sender,
      text,
      file,
      fileType,
      delivered: true,
      seen: false,
    })
      .then(async (savedMessage) => {
        // تحديث آخر رسالة بالشات
        await Chats.findByIdAndUpdate(chatId, {
          lastMessage: savedMessage._id,
          lastActivity: new Date(),
        });

        // جلب الشات لمعرفة المستقبل
        const chat = await Chats.findById(chatId);

        if (!chat) return;

        const receiver =
          chat.client.toString() === sender
            ? chat.developer.toString()
            : chat.client.toString();

        // إشعار الرسالة
        await createNotification({
          receiver,
          sender,
          type: "message",
          title: "رسالة جديدة",
          body: text || "قام بإرسال ملف",
          chat: chatId,
          metadata: {
            messageId: savedMessage._id,
          },
        });

        // لو المستقبل أونلاين
        if (onlineUsers.has(receiver)) {
          io.to(onlineUsers.get(receiver)).emit(
            "new-message-notification",
            {
              ...messagePayload,
              _id: savedMessage._id,
            }
          );
        }
      })
      .catch((err) => {
        console.log("DB Error:", err);
      });
  } catch (err) {
    console.log("Socket Error:", err);

    socket.emit("message-error", {
      message: err.message || "حدث خطأ أثناء إرسال الرسالة",
      status: err.status || 500,
    });
  }
});
    // ==========================
    // USER TYPING
    // ==========================

    socket.on("typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("typing", userId);
    });

    // ==========================
    // STOP TYPING
    // ==========================

    socket.on("stop-typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("stop-typing", userId);
    });

    // ==========================
    // SEEN
    // ==========================

    socket.on("seen", async ({ chatId, userId }) => {
      try {
        await Messages.updateMany(
          {
            chat: chatId,
            sender: { $ne: userId },
            seen: false,
          },
          {
            seen: true,
          }
        );

        io.to(chatId).emit("messages-seen", {
          chatId,
          seenBy: userId,
        });
      } catch (err) {
        console.log(err);
      }
    });

    // ==========================
    // DISCONNECT
    // ==========================

    socket.on("disconnect", async () => {
      console.log("❌ Disconnected");

      if (socket.userId) {
        onlineUsers.delete(socket.userId.toString());

        await Users.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        socket.broadcast.emit("online-users", [...onlineUsers.keys()]);
      }
    });
  });
};