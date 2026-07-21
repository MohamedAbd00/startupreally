import mongoose from "mongoose";

const { Schema, model } = mongoose;

const previousprojectsSchema = new Schema(
  {
    // صاحب المشروع
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },





    // اسم المشروع
    projectName: {
      type: String,
      required: true,
      trim: true,
    },

    // التصنيف
    category: {
      type: String,
     
      required: true,
    },

    // وصف قصير
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    // وصف مفصل
    fullDescription: {
      type: String,
   
    },

    // رابط العرض التجريبي
    demoUrl: {
      type: String,
      default: "",
    },

    // رابط github
    githubUrl: {
      type: String,
      default: "",
    },

    

    // التقنيات المستخدمة
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],

    // المميزات الرئيسية
    mainFeatures: [
      {
        type: String,
        trim: true,
      },
    ],

    // رابط الفيديو
    videoUrl: {
      type: String,
      default: "",
    },

    




 

   

    // صور المشروع
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

const previousprojectsModel = model("previousprojects", previousprojectsSchema);

export default previousprojectsModel;