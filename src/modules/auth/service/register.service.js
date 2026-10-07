import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import { comparehash, generatehash } from "../../../utlis/security/hash.security.js";
import Usermodel from "../../../DB/models/usermodel.js";
import {generateCode } from "../../../utlis/security/Token.security.js";
import {sendemail} from "../../../utlis/email/sendemail.js"
//dev register

export const singupdev = asyncHandelr(async(req , res , next )=>{
    const {name , email  , password , experience , track,whatsapp} = req.body
    if( !name || !email  || !password || !experience || !track ){
         return next(new Error("جميع الحقول مطلوبة", { cause: 400 }));
    }

    const user = await Usermodel.findOne({email})

    if(user){
        return next(new Error("الايميل موجود ", { cause: 400 }));
    }

     const code =generateCode(6)
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
        whatsapp,
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
    const {name , email  , password , companyName , whatsapp} = req.body
    if( !name || !email  || !password || !companyName  ){
         return next(new Error("جميع الحقول مطلوبة", { cause: 400 }));
    }

    const user = await Usermodel.findOne({email})

    if(user){
        return next(new Error("الايميل موجود ", { cause: 400 }));
    }

     const code =generateCode(6)
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
        emailotp: code,
        whatsapp

    })
     return successresponse(
            res,
            "تم إنشاء الحساب بنجاح، يرجى تفعيل الحساب من خلال البريد الإلكتروني",
            201,
            {email}
        );
})

export const createDevAccounts = asyncHandelr(async (req, res, next) => {
  let { users } = req.body;

  // =========================
  // Parse & Validate Users Array
  // =========================

  // في حال تم إرسال المصفوفة كـ string
  if (typeof users === "string") {
    try {
      users = JSON.parse(users);
    } catch (e) {
      return next(new Error("صيغة بيانات الحسابات غير صحيحة", { cause: 400 }));
    }
  }

  if (!Array.isArray(users) || users.length === 0) {
    return next(
      new Error("يجب إرسال بيانات الحسابات", {
        cause: 400,
      })
    );
  }

  // اقتطاع أول 10 عناصر فقط لتأكيد الحد الأقصى وتجاهل أي زيادة تلقائياً
  const limitedUsers = users.slice(0, 10);

  const createdUsers = [];
  const failedUsers = [];

  // دالة آمنة لتحليل حقول الـ Arrays
  const safeJsonParse = (data) => {
    if (typeof data !== "string") return data;
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  };

  // =========================
  // Create Accounts
  // =========================

  for (const data of limitedUsers) {
    try {
      const {
        name,
        email,
        password,
        experience,
        track,
        fullName,
        title,
        bio,
        hourlyRate,
        techStack,
        skills,
        languages,
        github,
        linkedin,
        twitter,
        website,
        phone,
        education,
        country,
        certificates,
        goverment,
        profileImage,
        coverImage,
        
      } = data;

      // Required Fields Check
      if (!name || !email || !password || !experience || !track  ) {
        failedUsers.push({
          email: email || null,
          message: "جميع حقول التسجيل مطلوبة",
        });
        continue;
      }

      // Check Existing Email
      const existingUser = await Usermodel.findOne({
        email: email.trim().toLowerCase(),
      });

      if (existingUser) {
        failedUsers.push({
          email,
          message: "الإيميل موجود بالفعل",
        });
        continue;
      }

      // Hash Password
      const hash = generatehash({
        planText: password,
      });

      // Create User
      const user = await Usermodel.create({
        username: (fullName || name).trim(),
        email: email.trim().toLowerCase(),
        password: hash,
        userType: "developer",
        experience,
        track,
       
        isConfirmed: true,
        compleytprofile: true, // الحقل الخاص بتأكيد الملف الشخصي
        title: title?.trim(),
        bio: bio?.trim(),
        hourlyRate:
          hourlyRate !== undefined && hourlyRate !== null && hourlyRate !== ""
            ? Number(hourlyRate)
            : undefined,
        phone,
        country,
        goverment,
        github,
        linkedin,
        twitter,
        website,
        techStack: safeJsonParse(techStack),
        skills: safeJsonParse(skills),
        languages: safeJsonParse(languages),
        education: safeJsonParse(education),
        certificates: safeJsonParse(certificates),
        profileImage,
        coverImage,
      });

      createdUsers.push({
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
      });
    } catch (error) {
      console.error(`❌ Error creating developer ${data?.email}:`, error);

      failedUsers.push({
        email: data?.email || null,
        message: error.message || "حدث خطأ أثناء إنشاء الحساب",
      });
    }
  }

  // =========================
  // Response
  // =========================

  return successresponse(
    res,
    "تم إنشاء حسابات المطورين بنجاح",
    201,
    {
      totalRequested: users.length,
      processed: limitedUsers.length,
      success: createdUsers.length,
      failed: failedUsers.length,
      createdUsers,
      failedUsers,
    }
  );
});