import mongoose from "mongoose";

const { Schema } = mongoose;


const profileImageSchema = new Schema({

    // 🧑 البيانات الأساسية
    image: {
        type: String,

    },
    type: {
        type: String,

    },

   
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const profileImage = mongoose.model("profileImage", profileImageSchema);
export default profileImage;