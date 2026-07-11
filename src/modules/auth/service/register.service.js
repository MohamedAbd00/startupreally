import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import { comparehash, generatehash } from "../../../utlis/security/hash.security.js";
import Usermodel from "../../../DB/models/usermodel.js";
import {generateCode } from "../../../utlis/security/Token.security.js";
import {sendemail} from "../../../utlis/email/sendemail.js"
//dev register

export const singupdev = asyncHandelr(async(req , res , next )=>{
    const {name , email  , password , experience , track} = req.body
    if( !name || !email  || !password || !experience || !track ){
         return next(new Error("جميع الحقول مطلوبة", { cause: 400 }));
    }

    const user = await Usermodel.findOne({email})

    if(user){
        return next(new Error("الايميل موجود ", { cause: 400 }));
    }

     const code =generateCode(10)
        const hash = generatehash({planText:password})
await sendemail({
    to: email,
    subject: "Verify Your Email",
    code: code,
})

   const users = await Usermodel.create({
        username: name ,
        email , 
        password : hash ,
        userType: "developer",
        experience ,
        track,
        emailotp: code


    })
     return successresponse(
            res,
            "تم إنشاء الحساب بنجاح، يرجى تفعيل الحساب من خلال البريد الإلكتروني",
            201,
            {email}
        );
})

//client register
export const singupclint = asyncHandelr(async(req , res , next )=>{
    const {name , email  , password , companyName } = req.body
    if( !name || !email  || !password || !companyName  ){
         return next(new Error("جميع الحقول مطلوبة", { cause: 400 }));
    }

    const user = await Usermodel.findOne({email})

    if(user){
        return next(new Error("الايميل موجود ", { cause: 400 }));
    }

     const code =generateCode(10)
        const hash = generatehash({planText:password})
await sendemail({
    to: email,
    subject: "Verify Your Email",
    code: code,
})
  const   users = await Usermodel.create({
        username: name ,
        email , 
        password : hash,
        userType: "client",
        companyName ,
        emailotp: code

    })
     return successresponse(
            res,
            "تم إنشاء الحساب بنجاح، يرجى تفعيل الحساب من خلال البريد الإلكتروني",
            201,
            {email}
        );
})
