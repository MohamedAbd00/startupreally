import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    // صاحب الاشتراك
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // نوع الاشتراك
    plan: {
      type: String,
      enum: ["free", "vip"],
      default: "free",
      required: true,
    },

    // حالة الاشتراك
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "active",
      required: true,
    },

    // بداية الاشتراك
    startDate: {
      type: Date,
    },

    // نهاية الاشتراك
    endDate: {
      type: Date,
    },

    // قيمة الاشتراك
    amount: {
      type: Number,
      default: 0,
    },
name:{
   type: String,
},

    // طلب الدفع المرتبط بالاشتراك
    paymentRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentRequest",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema
);

export default Subscription;