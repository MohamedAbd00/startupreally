import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messageSchema = new Schema(
{

    chat:{
        type:Schema.Types.ObjectId,
        ref:"Chats",
        required:true
    },

    sender:{
        type:Schema.Types.ObjectId,
        ref:"Users",
        required:true
    },

    text:{
        type:String,
        default:""
    },

    file:{
        type:String,
        default:""
    },

    delivered:{
        type:Boolean,
        default:false
    },

    seen:{
        type:Boolean,
        default:false
    }

},
{
    timestamps:true
});

export default model("Messages",messageSchema);