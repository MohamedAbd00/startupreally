import mongoose from "mongoose";

const { Schema, model } = mongoose;

const taskSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },

    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Tasks", taskSchema);