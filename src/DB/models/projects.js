import mongoose from "mongoose";

const { Schema } = mongoose;


const projectsSchema = new Schema({

    // 🧑 البيانات الأساسية
    owner: {
         type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    developertaked: {
          type: Schema.Types.ObjectId,
      ref: "Users",
    },
     projectName: {
      type: String,
      required: true,
      trim: true,
    },
      
    category: {
      type: String,
      required: true,
      trim: true,
    },
 public: {
        type: Boolean,
        default: true
    },
      Description: {
      type: String,
      required: true,
   
    },
     budget: {
        type: String,
        
    },
     time: {
        type: String,
        
    },
     skills: [
      {
        type: String,
        trim: true,
      },
    ],
     Objectives: [
      {
        type: String,
        trim: true,
      },
    ],
     features: [
      {
        type: String,
        trim: true,
      },
    ],
  amount: {
      type: Number,
   
    },
      paidAmount: {
    type: Number,
    default: 0
},
     status: {
  type: String,
  enum: [
    "pending",
    "in_progress",
    "review",
    "completed",
    "cancelled",
  ],
  default: "review",
},
     progress: {
  type: Number,
  default: 0,
  min: 0,
  max: 100,
},
      startDate: {
      type: String,
   
    },
     completedAt: {
      type: String,
   
    },
clientApproved: {
      type: Boolean,
      default: false,
    },
    dueDate: {
  type: Date,
  default: null,
},
startDate: {
  type: Date,
  default: null,
},
completedAt: {
  type: Date,
  default: null,
},
deadline: {
  type: Date,
  default: null,
},
members: [
  {
    idmember: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
  },
],
    githubRepo: {
  type: String,
  default: "",
},
demoLink: {
  type: String,
  default: "",
},

clientRating: {
    type: Number,
    default: 0,
},

developerRating: {
    type: Number,
    default: 0,
},
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const projects = mongoose.model("projects", projectsSchema);
export default projects;