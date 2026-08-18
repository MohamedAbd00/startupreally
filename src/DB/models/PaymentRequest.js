import mongoose from "mongoose";

const paymentRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
senderPhone: {
  type: String,
  required: true,
  trim: true,
},
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    paymentNumber: {
      type: String,
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "verifying",
        "paid",
        "rejected",
        "expired",
      ],
      default: "pending",
      index: true,
    },

    transactionId: {
      type: String,
      default: null,
      index: true,
    },

    verification: {
      verifiedByApp: {
        type: String,
        default: null,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },

      transactionId: {
        type: String,
        default: null,
      },

      detectedAmount: {
        type: Number,
        default: null,
      },

      sender: {
        type: String,
        default: null,
      },

      note: {
        type: String,
        default: null,
      },
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "PaymentRequest",
  paymentRequestSchema
);