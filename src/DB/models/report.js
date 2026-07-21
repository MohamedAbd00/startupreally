import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reportSchema = new Schema(
  {
    // صاحب البلاغ
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },





    // وصف مفصل
    fullDescription: {
      type: String,
   
    },

    // صور البلاغ
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "الحد الأقصى للصور هو 10 صور",
      },
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const reportModel = model("report", reportSchema);

export default reportModel;