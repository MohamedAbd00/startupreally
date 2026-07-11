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

   phone :{
     type: String,
     required: true,

   },
     typewallet: {
      type: String,
      enum: ["vodafone_cash", "etisalat_cash", "instapay","orange_cash"],
      
            required: true,

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