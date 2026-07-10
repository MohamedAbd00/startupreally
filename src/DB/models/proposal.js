import mongoose from "mongoose";

const { Schema, model } = mongoose;

const proposalSchema = new Schema(
  {
    //مالك المشروع
       owner: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    // المشروع
    project: {
      type: Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },

    // المبرمج
    developer: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    // رسالة العرض
    coverLetter: {
      type: String,
      required: true,
      trim: true,
    },

    // الميزانية المقترحة
    budget: {
      type: Number,
      required: true,
      min: 1,
    },

    // مدة التنفيذ
    duration: {
      type: String,
      required: true,
      trim: true,
    },

    
    // حالة العرض
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// منع تقديم أكثر من عرض لنفس المشروع من نفس المبرمج
proposalSchema.index(
  {
    project: 1,
    developer: 1,
  },
  {
    unique: true,
  }
);

export default model("Proposal", proposalSchema);