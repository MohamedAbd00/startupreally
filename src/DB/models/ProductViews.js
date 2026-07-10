import mongoose from "mongoose";

const {Schema,model}=mongoose;

const storeViewSchema=new Schema({

    project:{
        type:Schema.Types.ObjectId,
        ref:"store",
        required:true
    },

    user:{
        type:Schema.Types.ObjectId,
        ref:"Users"
    },

    ip:{
        type:String
    }

},{
    timestamps:true
});

export default model("StoreView",storeViewSchema);