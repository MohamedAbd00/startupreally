import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
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

    store:{
        type:Schema.Types.ObjectId,
        ref:"store"
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

export default model("Review",reviewSchema);