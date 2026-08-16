import mongoose from "mongoose";

const { Schema } = mongoose;

const userActivitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
    
        "login",

        "page_view",

        
//previousprojects
    "previousprojects_created",
    "previousprojects_deleted",
         //project dev
"project_created",
       
        "project_buy",
        "project_updated",
        "project_deleted",
        "project_completed",
        "payment_created",
        //payment
            "payment_Withdraw",
        "payment_completed",
        "subscription_created",
         "subscription_cancelled",
         // project client
         "projectclient_created",
        //proposal
        "create_proposal",
        "approved_proposal",
        "Rejected_proposal",
         //profile && problme
        "profile_updated",
        "user_deleted",
        "create_problme",
        //support
        "chat_support_client",
        "add_report"
        
      ],
      index: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

userActivitySchema.index({ user: 1, createdAt: -1 });
userActivitySchema.index({ type: 1, createdAt: -1 });
userActivitySchema.index({ createdAt: -1 });

const UserActivity = mongoose.model(
  "UserActivity",
  userActivitySchema
);

export default UserActivity;