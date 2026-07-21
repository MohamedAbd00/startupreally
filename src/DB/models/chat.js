import mongoose from "mongoose";

const { Schema, model } = mongoose;

const chatSchema = new Schema(
{
  
    project:{
        type:Schema.Types.ObjectId,
        ref:"projects",
        unique:true,
    },
   

    client:{
        type:Schema.Types.ObjectId,
        ref:"Users",
        required:true
    },

    developer:{
        type:Schema.Types.ObjectId,
        ref:"Users",
        required:true
    },

    lastMessage:{
        type:Schema.Types.ObjectId,
        ref:"Messages"
    }

},
{
    timestamps:true
});

export default model("Chats",chatSchema);