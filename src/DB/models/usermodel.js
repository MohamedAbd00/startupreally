import mongoose from "mongoose";

const { Schema } = mongoose;


const userSchema = new Schema({

    // 🧑 البيانات الأساسية
    username: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 30,
        unique: false,
        sparse: true
    },
isOnline: {
    type: Boolean,
    default: false,
},

lastSeen: {
    type: Date,
},
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true
    },
    language :{
        type: String,
    },
    country : {
        type: String,
     
    },
    location : {
        type: String,
     
    },

    phone: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },

    password: {
        type: String,
        required: false,
        minlength: 6
    },

    // ✅ الحساب
    isConfirmed: {
        type: Boolean,
        default: false
    },

    substriction: {
        type: Boolean,
        default: false
    },

    plan: {
        type: String,
        enum: ["free", "basic", "vip"],
        default: "free"
    },

    isBlocked: {
        type: Boolean,
        default: false
    },
    
compleytprofile: {
        type: Boolean,
        default: false
    },
    emailotp: {
        type: String
    },

    // 🖼️ البروفايل
    profileImage: {
        type: String,
        ref: "Image",
        default: null
    },

    coverImage: {
        type: String,
        ref: "Image",
        default: null
    },

    google: {
        type: Boolean,
        default: false
    },


    // 👨‍💻 بيانات المبرمج
    userType: {
        type: String,
        enum: ["developer", "client"]
    },

    track: {
        type: String,
       
    },

    experience: {
        type: String,
        
    },

    title: {
        type: String
    },

    bio: {
        type: String
    },

    hourlyRate: {
        type: Number,
        default: 0
    },

    techStack: {
        type: [String]
    },

    skills: {
        type: [String]
    },

    languages: {
        type: [String]
    },

    github: {
        type: String
    },

    linkedin: {
        type: String
    },

    twitter: {
        type: String
    },

    website: {
        type: String
    },

    education: {
        type: [Object]
    },

    certificates: {
        type: [Object]
    },

    portfolio: {
        type: [Object]
    },

    completedProjects: {
        type: Number,
        default: 0
    },

    ongoingProjects: {
        type: Number,
        default: 0
    },

    totalProjects: {
        type: Number,
        default: 0
    },

    salesCount: {
        type: Number,
        default: 0
    },

    totalEarnings: {
        type: Number,
        default: 0
    },

    rating: {
        type: Number,
        default: 0
    },

    ratingsCount: {
        type: Number,
        default: 0
    },

    responseRate: {
        type: Number,
        default: 0
    },

    // 🏢 بيانات الشركة
    companyName: {
        type: String
    },

    companyBio: {
        type: String
    },

    companySize: {
        type: String,
        enum: ["1-10", "11-50", "51-200", "201-500", "500+"]
    },

    industry: {
        type: String,
        enum: ["tech", "ecommerce", "education", "healthcare", "finance", "realestate", "marketing", "other"]
    },

    companyWebsite: {
        type: String
    },

    projectsNeeded: {
        type: [String]
    },

    budget: {
        type: String,
        enum: ["under1000", "1000-5000", "5000-10000", "10000-50000", "above50000"]
    },

    preferredTech: {
        type: [String]
    },

    contactPerson: {
        type: String
    },

    contactPosition: {
        type: String
    },

    logo: {
        type: String,
        ref: "Image",
        default: null
    },
    timezone: {
  type: String,
  default: "Africa/Cairo",
},

dateFormat: {
  type: String,
  
},
currency: {
  type: String,
  default: "EGP",
},
profilpublic: {
  type: String,
  default: "public",
},
notificationSettings: {
  messages: {
    type: Boolean,
    default: true,
  },
  projects: {
    type: Boolean,
    default: true,
  },
   
  
  tasks: {
    type: Boolean,
    default: true,
  },
   lastLogin: {
    type: Date,
    default: null,
  },
  
  payments: {
    type: Boolean,
    default: true,
  },
  proposals: {
    type: Boolean,
    default: true,
  },
   newReviews: {
    type: Boolean,
    default: true,
  },
  newSales: {
    type: Boolean,
    default: true,
  },
  
  milestones: {
    type: Boolean,
    default: true,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  pushNotifications: {
    type: Boolean,
    default: true,
  },
},

deleted: {
  type: Boolean,
  default: false,
},

deletedAt: {
  type: Date,
  default: null,
},

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Usermodel = mongoose.model("Users", userSchema);
export default Usermodel;