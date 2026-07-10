import mongoose from "mongoose";

const {Schema,model}=mongoose;

const activitySchema=new Schema({

    user:{
        type:Schema.Types.ObjectId,
        ref:"Users",
        required:true
    },

    action:{
        type:String,
        required:true
    },

    type:{
        type:String,
        enum:[
            "project",
            "store",
            "payment",
            "withdraw",
            "message",
            "login",
            "profile"
        ]
    },

    metadata:{
        type:Schema.Types.Mixed,
        default:{}
    }

},{
    timestamps:true
});

export default model("Activity",activitySchema);