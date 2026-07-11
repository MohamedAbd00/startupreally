import Chats from "../../DB/models/chat.js";
import Projects from "../../DB/models/projects.js";
import Messages from "../../DB/models/massege.js";
import { asyncHandelr } from "../../utlis/response/error.response.js";
import { successresponse } from "../../utlis/response/success.response.js";


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
console.log(chat)
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