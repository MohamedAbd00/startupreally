import mongoose from "mongoose";

const { Schema, model } = mongoose;

const projectFileSchema = new Schema(
  {
    // المشروع
    project: {
      type: Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },

    // الفولدر
    folder: {
      type: Schema.Types.ObjectId,
      ref: "ProjectFolders",
      required: true,
    },

    // اسم الملف
    fileName: {
      type: String,
      required: true,
    },

    // رابط الملف
    url: {
      type: String,
      required: true,
    },

    // Cloudinary Public ID
    public_id: {
      type: String,
      required: true,
    },

    // نوع الملف
    type: {
      type: String,
      enum: ["pdf", "excel", "powerpoint"],
      required: true,
    },

    // حجم الملف بالبايت
    size: {
      type: Number,
      default: 0,
    },

    // امتداد الملف
    extension: {
      type: String,
      enum: ["pdf", "xls", "xlsx", "ppt", "pptx"],
      required: true,
    },

    // رافع الملف
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("ProjectFiles", projectFileSchema);