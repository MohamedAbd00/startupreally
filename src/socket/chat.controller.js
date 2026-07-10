import { Router } from "express";

import { middlewere } from "../middlewere/middlewere.js";
import {
  createChat,
  getMyChats,
  getMessages,
  getProjectChat
} from "./service/chat.js";

const router = Router();

// كل محادثات المستخدم
router.get(
  "/my",
  middlewere(),
  getMyChats
);

// إنشاء الشات (أو إرجاعه إذا كان موجود)
router.post(
  "/create",
  middlewere(),
  createChat
);
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

export default router;