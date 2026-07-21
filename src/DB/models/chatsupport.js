import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ChatsupportSchema = new Schema(
{
  
    project:{
        type:Schema.Types.ObjectId,
        ref:"store",
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

export default model("Chatsupport",ChatsupportSchema);