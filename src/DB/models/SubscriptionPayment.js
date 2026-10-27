
import mongoose from "mongoose";

const subscriptionPaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      default: 450,
      enum: [450],
    },

    currency: {
      type: String,
      enum: ["EGP"],
      default: "EGP",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "expired"],
      default: "pending",
      required: true,
      index: true,
    },

    xpaySessionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    xpayCheckoutUrl: {
      type: String,
      default: null,
    },

    xpayPaymentStatus: {
      type: String,
      default: "unpaid",
    },

    xpayPaymentIntentId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    subscriptionStartDate: {
      type: Date,
      default: null,
    },

    subscriptionEndDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "SubscriptionPayment",
  subscriptionPaymentSchema
);
