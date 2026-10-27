import mongoose, { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
completedAt: Date,

delivered: {
    type: Boolean,
    default: false,
},
    developer: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: "store",
      required: true,
    },

    package: {
      type: String,
      enum: ["Basic", "Pro", "Enterprise"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "refunded"],
      default: "pending",
    },
paymentMethod: {
  type: String,
  enum: ["manual", "xpay"],
  default: "manual",
  required: true,
},

phone: {
  type: String,
  required: function () {
    return this.paymentMethod === "manual";
  },
},

typewallet: {
  type: String,
  enum: [
    "vodafone_cash",
    "etisalat_cash",
    "instapay",
    "orange_cash",
  ],
  required: function () {
    return this.paymentMethod === "manual";
  },
},
    name :{
     type: String,
     required: true,

    }

  },
  {
    timestamps: true,
  }
);

export default model("Order", orderSchema);