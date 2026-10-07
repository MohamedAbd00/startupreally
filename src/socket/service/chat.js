import Chats from "../../DB/models/chat.js";
import Projects from "../../DB/models/projects.js";
import Messages from "../../DB/models/massege.js";
import { asyncHandelr } from "../../utlis/response/error.response.js";
import { successresponse } from "../../utlis/response/success.response.js";
import chatsupport from "../../DB/models/chatsupport.js";
import chatdiscussion from "../../DB/models/chatdiscussion.js";
import mongoose from "mongoose";
import storeModel from "../../DB/models/store.js";
import { sendemail } from "../../utlis/email/sendemail.js";
import { clientInquiryTemplate } from "../../utlis/temblete/vervication.email.js";
import Usermodel from "../../DB/models/usermodel.js";


// =======================================
// إنشاء شات للمشروع
// =======================================
export const createChat = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.body;

  const project = await Projects.findById(projectId);

  if (!project)
    return next(new Error("Project not found", { cause: 404 }));

  if (!project.developertaked)
    return next(new Error("لا يوجد مبرمج لهذا المشروع", { cause: 400 }));

  const allowed =
    project.owner.toString() === userId.toString() ||
    project.developertaked.toString() === userId.toString();

  if (!allowed)
    return next(new Error("غير مصرح", { cause: 403 }));

  let chat = await Chats.findOne({
    project: projectId,
  });

  if (chat) {
    return successresponse(res, "Chat exists", 200, { chat });
  }

  chat = await Chats.create({
    project: projectId,
    client: project.owner,
    developer: project.developertaked,
  });

  return successresponse(res, "Chat created", 201, { chat });
});
//جلب شات مشروع معين
export const getProjectChat = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.params;

  const chat = await Chats.findOne({
    project: projectId,
  })
    .populate("project", "projectName")
    .populate("client", "username profileImage isOnline lastSeen")
    .populate("developer", "username profileImage isOnline lastSeen")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username profileImage",
      },
    });
  if (!chat)
    return next(new Error("Chat not found", { cause: 404 }));

  const allowed =
    chat.client._id.toString() === userId.toString() ||
    chat.developer._id.toString() === userId.toString();

  if (!allowed)
    return next(new Error("غير مصرح", { cause: 403 }));

  const otherUser =
    chat.client._id.toString() === userId.toString()
      ? chat.developer
      : chat.client;

  const unreadCount = await Messages.countDocuments({
    chat: chat._id,
    sender: { $ne: userId },
    isRead: false,
  });

  return successresponse(res, "Done", 200, {
    chatId: chat._id,

    project: {
      _id: chat.project._id,
      projectName: chat.project.projectName,
    },

    otherUser,

    lastMessage: chat.lastMessage,

    unreadCount,
  });
});
//جلب شات الدعم الفني
export const getsupportChat = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.params;

  const chat = await chatsupport.findOne({
    project: projectId,
  })
    .populate("project", "projectName")
    .populate("client", "username profileImage isOnline lastSeen")
    .populate("developer", "username profileImage isOnline lastSeen")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username profileImage",
      },
    });
  if (!chat)
    return next(new Error("Chat not found", { cause: 404 }));

  const allowed =
    chat.client._id.toString() === userId.toString() ||
    chat.developer._id.toString() === userId.toString();

  if (!allowed)
    return next(new Error("غير مصرح", { cause: 403 }));

  const otherUser =
    chat.client._id.toString() === userId.toString()
      ? chat.developer
      : chat.client;

  const unreadCount = await Messages.countDocuments({
    chat: chat._id,
    sender: { $ne: userId },
    isRead: false,
  });

  return successresponse(res, "Done", 200, {
    chatId: chat._id,

    project: {
      _id: chat.project._id,
      projectName: chat.project.projectName,
    },

    otherUser,

    lastMessage: chat.lastMessage,

    unreadCount,
  });
});

//جلب محادثات المستخدم
export const getMyChats = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  const chats = await Chats.find({
    $or: [
      { client: userId },
      { developer: userId },
    ],
  })
    .populate("project", "projectName")
    .populate("client", "username profileImage isOnline lastSeen")
    .populate("developer", "username profileImage isOnline lastSeen")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username profileImage",
      },
    })
    .sort({ updatedAt: -1 });

  const data = await Promise.all(
    chats.map(async (chat) => {
      const isClient =
        chat.client?._id?.toString() === userId.toString();

      const otherUser = isClient
        ? chat.developer
        : chat.client;

      const unreadCount = await Messages.countDocuments({
        chat: chat._id,
        sender: { $ne: userId },
        isRead: false,
      });

      return {
        chatId: chat._id,

        projectId: chat.project?._id,

        projectName: chat.project?.projectName,

        user: otherUser
          ? {
              _id: otherUser._id,
              username: otherUser.username,
              profileImage: otherUser.profileImage,
              isOnline: otherUser.isOnline,
              lastSeen: otherUser.lastSeen,
            }
          : {
              _id: null,
              username: "محذوف",
              profileImage: null,
              isOnline: false,
              lastSeen: null,
            },

        lastMessage: chat.lastMessage,

        unreadCount,

        updatedAt: chat.updatedAt,
      };
    })
  );

  return successresponse(res, "تم جلب المحادثات", 200, {
    chats: data,
  });
});
//جلب رسائل
export const getMessages = asyncHandelr(async (req, res) => {
  const { chatId } = req.params;

  const messages = await Messages.find({ chat: chatId })
    .populate("sender", "username profileImage")
    .sort({ createdAt: 1 });

  return successresponse(res, "Done", 200, {
    messages,
  });
});
//جلب محادثات الدعم الفني الخاص بالمبرج
export const getMyChatsupport = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  const chats = await chatsupport.find({
  
    
       developer: userId 

  })
    .populate("project", "projectName")
    .populate("client", "username profileImage isOnline lastSeen")
    .populate("developer", "username profileImage isOnline lastSeen")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username profileImage",
      },
    })
    .sort({ updatedAt: -1 });

  const data = await Promise.all(
    chats.map(async (chat) => {
      const isClient =
        chat.client?._id?.toString() === userId.toString();

      const otherUser = isClient
        ? chat.developer
        : chat.client;

      const unreadCount = await Messages.countDocuments({
        chat: chat._id,
        sender: { $ne: userId },
        isRead: false,
      });

      return {
        chatId: chat._id,

        projectId: chat.project?._id,

        projectName: chat.project?.projectName,

        user: otherUser
          ? {
              _id: otherUser._id,
              username: otherUser.username,
              profileImage: otherUser.profileImage,
              isOnline: otherUser.isOnline,
              lastSeen: otherUser.lastSeen,
            }
          : {
              _id: null,
              username: "محذوف",
              profileImage: null,
              isOnline: false,
              lastSeen: null,
            },

        lastMessage: chat.lastMessage,

        unreadCount,

        updatedAt: chat.updatedAt,
      };
    })
  );

  return successresponse(res, "تم جلب المحادثات", 200, {
    chats: data,
  });
});
//جلب محادثات  المناقشة الخاص بالمبرج
export const getMyChatDiscussion = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  const chats = await chatdiscussion.find({
  
    
       developer: userId 

  })
    .populate("project", "projectName")
    .populate("client", "username profileImage isOnline lastSeen")
    .populate("developer", "username profileImage isOnline lastSeen")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username profileImage",
      },
    })
    .sort({ updatedAt: -1 });

  const data = await Promise.all(
    chats.map(async (chat) => {
      const isClient =
        chat.client?._id?.toString() === userId.toString();

      const otherUser = isClient
        ? chat.developer
        : chat.client;

      const unreadCount = await Messages.countDocuments({
        chat: chat._id,
        sender: { $ne: userId },
        isRead: false,
      });

      return {
        chatId: chat._id,

        projectId: chat.project?._id,

        projectName: chat.project?.projectName,

        user: otherUser
          ? {
              _id: otherUser._id,
              username: otherUser.username,
              profileImage: otherUser.profileImage,
              isOnline: otherUser.isOnline,
              lastSeen: otherUser.lastSeen,
            }
          : {
              _id: null,
              username: "محذوف",
              profileImage: null,
              isOnline: false,
              lastSeen: null,
            },

        lastMessage: chat.lastMessage,

        unreadCount,

        updatedAt: chat.updatedAt,
      };
    })
  );

  return successresponse(res, "تم جلب المحادثات", 200, {
    chats: data,
  });
});
//جلب شات المناقشة
export const getDiscussionChat = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.params;
  if (
    !projectId ||
    projectId === "null" ||
    !mongoose.Types.ObjectId.isValid(projectId)
  ) {
    return next(new Error("معرف المشروع غير صحيح", { cause: 400 }));
  }

  let chat = await chatdiscussion.findOne({
    project: projectId,
  });

  // لو الشات مش موجود، أنشئه
  if (!chat) {
    const project = await storeModel.findById(projectId);

    if (!project) {
      return next(new Error("المشروع غير موجود", { cause: 404 }));
    }

    // لازم المستخدم يكون العميل أو المطور الخاص بالمشروع
    const isClient =
      project.client &&
      project.client.toString() === userId.toString();

    const isDeveloper =
      project.developer &&
      project.developer.toString() === userId.toString();

 
    const dev = await Usermodel.findById(project.owner);

   
    try {
      chat = await chatdiscussion.create({
        project: projectId,
        client: userId,
        developer: project.owner,
      });

      await sendemail({
    to: dev.email,
    subject: "A client is considering buying your project.",
    html:clientInquiryTemplate(req.user.username , project.projectName )
    
})
    } catch (error) {
      // في حالة شخصين حاولوا إنشاء الشات في نفس اللحظة
      // الـ unique على project يمنع إنشاء شات ثاني
      if (error.code === 11000) {
        chat = await chatdiscussion.findOne({
          project: projectId,
        });

        
      } else {
        throw error;
      }
    }
  }

  // Populate
  chat = await chatdiscussion.findById(chat._id)
    .populate("project", "projectName")
    .populate("client", "username profileImage isOnline lastSeen")
    .populate("developer", "username profileImage isOnline lastSeen email")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username profileImage",
      },
    });

  if (!chat) {
    return next(new Error("Chat not found", { cause: 404 }));
  }

  // التأكد أن المستخدم طرف في الشات
  const allowed =
    chat.client._id.toString() === userId.toString() ||
    chat.developer._id.toString() === userId.toString();

  if (!allowed) {
    return next(new Error("غير مصرح", { cause: 403 }));
  }

  const otherUser =
    chat.client._id.toString() === userId.toString()
      ? chat.developer
      : chat.client;

  const unreadCount = await Messages.countDocuments({
    chat: chat._id,
    sender: { $ne: userId },
    isRead: false,
  });

  return successresponse(res, "Done", 200, {
    chatId: chat._id,

    project: {
      _id: chat.project._id,
      projectName: chat.project.projectName,
    },

    otherUser,

    lastMessage: chat.lastMessage,

    unreadCount,
  });
});