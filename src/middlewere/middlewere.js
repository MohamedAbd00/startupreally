import Usermodel from "../DB/models/usermodel.js";
import { asyncHandelr } from "../utlis/response/error.response.js"
import { clienttoken, devtoken,  verifytoken,  } from "../utlis/security/Token.security.js";



export const middlewere = ()=>{
    return  asyncHandelr(async(req , res , next)=>{
    const {authorization} =  req.headers
    if(!authorization){
         return next(new Error("جميع الحقول مطلوبة", { cause: 400 }));
    }

 const   [barer ,token] = authorization.split(" ")

let userid  = ""
switch (barer) {
    case "user":
         userid = await verifytoken(token)
        break;
case "admin":
         userid = await clienttoken(token)
        break;
    default:
        break;
}


const users = await Usermodel.findById(userid.id) 

if (!users) {
      return next(new Error("الايدي غير موجود", { cause: 400 }));
}
req.user = users
next()
})
}

export const authorization =(accessrole = [])=>{
    return asyncHandelr(async(req , res , next)=>{

if(!req.user){
      return next(new Error("البيانات غير موجودة", { cause: 401 }));
}

        if (!accessrole.includes(req.user.role)) {
             return next(new Error("الدخول غير مسموح", { cause: 403 }));
        }
      
        next()
    })
}


export const middlewerestudent = ()=>{
    return  asyncHandelr(async(req , res , next)=>{
    const {authorization} =  req.headers
    if(!authorization){
         return next(new Error("جميع الحقول مطلوبة", { cause: 400 }));
    }

 const   token = authorization



       const  userid = await verifystudenttoken(token)
    


const users = await studentmodel.findById(userid.id) 
if (!users) {
      return next(new Error("الايدي غير موجود", { cause: 400 }));
}
req.user = users
next()
})
}