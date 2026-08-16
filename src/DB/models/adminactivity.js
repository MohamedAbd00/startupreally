import mongoose from "mongoose";

const { Schema, model } = mongoose;

const adminActivitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "project",
        "store",
        "payment",
        "withdraw",
        "message",
        "login",
        "profile",
        "user",
        "support",
        "content",
      ],
      required: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

adminActivitySchema.index({
  user: 1,
  createdAt: -1,
});

adminActivitySchema.index({
  type: 1,
  createdAt: -1,
});

export default model("adminActivity", adminActivitySchema);