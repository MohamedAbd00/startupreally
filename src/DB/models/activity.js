import mongoose from "mongoose";

const { Schema, model } = mongoose;

const projectActivitySchema = new Schema(
  {
    // المشروع
    project: {
      type: Schema.Types.ObjectId,
      ref: "projects",
      required: true,
      index: true,
    },

    // الشخص الذي قام بالنشاط
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    // نوع النشاط
    action: {
  type: String,
  enum: [
    "project_created",
    "project_updated",
"clientApproved",
    "member_added",
    "member_removed",

    "folder_created",
    "folder_deleted",

    "file_uploaded",
    "file_deleted",
"Objective_created","feature_created",
    "task_created",
    "task_deleted",

    "status_changed",

    "milestone_created",
    "milestone_completed",

    "payment_added",      // إضافة دفعة جديدة
    "payment_paid",       // تم دفع الدفعة
    "payment_updated",    // تعديل قيمة الدفعة
    "payment_deleted",    // حذف دفعة

    "message_sent",
  ],
  required: true,
},

    // نوع العنصر
    targetType: {
      type: String,
      enum: [
        "Approved",
        "project",
        "member",
        "folder",
        "file",
        "payment",
        "milestone",
        "message",
        "feature",
         "Objective",
        
    "payment",
      ],
      required: true,
    },

    // الـ ID الخاص بالعنصر (اختياري)
    targetId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    // بيانات إضافية حسب النشاط
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const ProjectActivity = model(
  "ProjectActivity",
  projectActivitySchema
);

export default ProjectActivity;