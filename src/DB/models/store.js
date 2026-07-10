import mongoose from "mongoose";

const { Schema, model } = mongoose;

const storeSchema = new Schema(
  {
    // صاحب المشروع
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
salesCount: {
    type: Number,
    default: 0,
},
downloadurl: {
    type: String,
    default: 0,
},

totalRevenue: {
    type: Number,
    default: 0,
},

views: {
    type: Number,
    default: 0,
},

rating: {
    type: Number,
    default: 0,
},

reviewsCount: {
    type: Number,
    default: 0,
},
    // اسم المشروع
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    //منشور
   public: {
        type: Boolean,
        default: true
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

    // ترخيص المشروع
    license: {
      type: String,
      
      required: true,
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

    // Basic
   basic: {
  price: Number,
  deliveryTime: Number,
  features: [String],

},

pro: {
  price: Number,
  deliveryTime: Number,
  features: [String],
 
},

enterprise: {
  price: Number,
  deliveryTime: Number,
  features: [String],
 
},

    // الدعم الفني
    supportPeriod: {
      type: String,
     
      required: true,
    },

    // التحديثات
    updatesPeriod: {
      type: String,
   
      required: true,
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

const storeModel = model("store", storeSchema);

export default storeModel;