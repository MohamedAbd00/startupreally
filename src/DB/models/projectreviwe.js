import mongoose from "mongoose";

const { Schema, model } = mongoose;

const projectreviweSchema = new Schema(
{
    developer:{
        type:Schema.Types.ObjectId,
        ref:"Users",
        required:true
    },

    client:{
        type:Schema.Types.ObjectId,
        ref:"Users",
        required:true
    },

    project:{
        type:Schema.Types.ObjectId,
        ref:"projects"
    },

   

    rating:{
        type:Number,
        min:1,
        max:5,
        required:true
    },

    comment:{
        type:String,
        default:""
    }

},
{
    timestamps:true
});

export default model("projectreviwe",projectreviweSchema);