import mongoose from "mongoose";

const { Schema, model } = mongoose;

const folderSchema = new Schema(
  {
    // المشروع التابع له الفولدر
    project: {
      type: Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },

    // اسم الفولدر
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // منشئ الفولدر
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("ProjectFolders", folderSchema);