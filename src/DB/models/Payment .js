import mongoose from "mongoose";

const { Schema, model } = mongoose;

const PaymentSchema = new Schema(
  {

    project: {
      type: Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },

    namePayment: {
      type: String,
      required: true,

    },
   

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },


    transferNumber: {
      type: String,
           required: true,

    },
amount: {
      type: Number,
           required: true,

    },

 status: {
      type: String,
      enum: ["paid", "failed", "pending"],
      default: "pending",
            

    },
    
    typewallet: {
      type: String,
      enum: ["vodafone_cash", "etisalat_cash", "instapay","orange_cash"],
      default: "vodafone_cash",
            required: true,

    },

   
  },
  {
    timestamps: true,
  }
);

export default model("Payment", PaymentSchema);