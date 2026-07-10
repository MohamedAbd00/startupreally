import mongoose from "mongoose";

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    // الشخص الذي سيستقبل الإشعار
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    // الشخص الذي قام بالفعل
    sender: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },

    // نوع الإشعار
    type: {
      type: String,
      enum: [
        "message",
        "project",
        "member",
        "task",
        "folder",
        "file",
        "payment",
        "system",
      ],
      required: true,
    },

    // عنوان الإشعار
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // وصف الإشعار
    body: {
      type: String,
      trim: true,
    },
link: {
    type: String,
    default: "",
},
    // المشروع (اختياري)
    project: {
      type: Schema.Types.ObjectId,
      ref: "projects",
      default: null,
    },

    // الشات (اختياري)
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chats",
      default: null,
    },

    // بيانات إضافية
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // هل تمت قراءة الإشعار؟
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Notification", notificationSchema);