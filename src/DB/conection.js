

import mongoose from "mongoose";

export const connectDB =async () => {
    console.log("MongoDB URL:", process.env.DB);

    return await mongoose.connect(process.env.DB).then(res => {
    
console.log("DB connected successfly");


    }).catch(error => {
    
        console.log("invalid-db" ,error);
        
})

}
