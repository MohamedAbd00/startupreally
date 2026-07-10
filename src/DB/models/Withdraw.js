import mongoose, { Schema, model } from "mongoose";

const withdrawSchema = new Schema(
  {
    developer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
phone: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: [
        "vodafone_cash",
        "etisalat_cash",
        "instapay",
        "orange_cash"
      ],
      required: true,
    },

    account: {
      type: String,
      required: true,
    },


    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "rejected"
      ],
      default: "pending",
    },

    note: String,

    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default model("Withdraw", withdrawSchema);