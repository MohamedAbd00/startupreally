import { Router } from "express";

import { middlewere } from "../middlewere/middlewere.js";
import {
  createChat,
  getMyChats,
  getMessages,
  getProjectChat,
  getsupportChat,
  getMyChatsupport,
  getDiscussionChat,
  getMyChatDiscussion
} from "./service/chat.js";

const router = Router();

// كل محادثات المستخدم
router.get(
  "/my",
  middlewere(),
  getMyChats
);
router.get(
  "/getMyChatsupport",
  middlewere(),
  getMyChatsupport
);

// إنشاء الشات (أو إرجاعه إذا كان موجود)
router.post(
  "/create",
  middlewere(),
  createChat
);
//جلب الرسائل
router.get(
  "/messages/:chatId",
  middlewere(),
  getMessages
);

// جلب شات مشروع معين
router.get(
  "/project/:projectId",
  middlewere(),
  getProjectChat
);
//جلب شات الدعم الفني
router.get(
  "/support/:projectId",
  middlewere(),
  getsupportChat
);

//جلب محادثات  المناقشة الخاص بالمبرج
router.get(
  "/getMyChatDiscussion",
  middlewere(),
  getMyChatDiscussion
);
//جلب شات المناقشة

router.get(
  "/getDiscussionChat/:projectId",
  middlewere(),
  getDiscussionChat
);


export default router;