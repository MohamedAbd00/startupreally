
import mongoose, { Schema, model } from "mongoose";

const xpayTransactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    purpose: {
      type: String,
      enum: ["project_purchase", "freelance"],
      required: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    currency: {
      type: String,
      default: "EGP",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "expired"],
      default: "pending",
      index: true,
    },

    xpaySessionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    xpayCheckoutUrl: String,
    xpayPaymentStatus: String,
    xpayPaymentIntentId: String,
    paidAt: Date,
  },
  { timestamps: true }
);

export default model("XPayTransaction", xpayTransactionSchema);
