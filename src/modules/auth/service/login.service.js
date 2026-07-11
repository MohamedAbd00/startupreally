import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import { comparehash, generatehash } from "../../../utlis/security/hash.security.js";
import Usermodel from "../../../DB/models/usermodel.js";
import {generateCode } from "../../../utlis/security/Token.security.js";
import { sendemail, sendpassword } from "../../../utlis/email/sendemail.js";
import { devtoken, generatetoken, clienttoken } from "../../../utlis/security/Token.security.js";
import { v2 as cloudinary } from 'cloudinary';
import passport from "../service/google.service.js"; // المسار حسب مشروعك
//تسجيل الدخول
export const login = asyncHandelr(async(req , res , next)=>{
    const {email , password} = req.body
    if(!email || !password){
         return next(new Error("جميع الحقول مطلوبة", { cause: 400 }));
    }

    const users = await Usermodel.findOne({email})
    if(!users){
         return next(new Error("الايميل غير موجود", { cause: 400 }));
    }
    if (users.isBlocked == true) {
        return next(new Error("الايميل محظور تواصل مع الدعم", { cause: 400 }));
    }
    
     const ismatch = await comparehash({
        planText: password ,
        valuehash: users.password
    })
  

    if(!ismatch){
      return next(new Error("كلمة السر غير صحيحة", { cause: 400 }));
    }

    if(!users.isConfirmed ){
         return next(new Error("يرجي تفعيل الايميل", { cause: 400 }));
    }
    
    if(!users.compleytprofile && users.userType == "developer" ){
         return next(new Error("استكمل الملف", { cause: 400 }));
    }
    
    if(!users.compleytprofile && users.userType == "client" ){
         return next(new Error("اكمل ملف العميل", { cause: 400 }));
    }
    
    
         const tokens = generatetoken({
        payload:{id: users._id}
    })
      console.log("client")
       return successresponse(
        res,
        "تم تسجيل الدخول بنجاح",
        200,
      {token: tokens}
    );
    
  })

//تفعيل الايميل
export const verifyemail = asyncHandelr(async(req , res , next)=>{
    const {code , email} = req.body
    if(!email || !code){
         return next(new Error("جميع الحقول مطلوبة", { cause: 400 }));
    }

    const users = await Usermodel.findOne({email})
    if(!users){
         return next(new Error("الايميل غير موجود", { cause: 400 }));
    }
    
    if(code != users.emailotp){
                 return next(new Error("الكود غير صحيح", { cause: 400 }));

    }
    await Usermodel.updateOne({email} , {isConfirmed: true})

        return successresponse(
        res,
        "تم تفعيل الاكونت بنجاح",
        200,
     
    );
})

// اكمال الملف الشخصي مبرمج
export const completeProfile = asyncHandelr(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new Error("الإيميل مطلوب", { cause: 400 }));
  }

  const user = await Usermodel.findOne({ email });

  if (!user) {
    return next(new Error("المستخدم غير موجود", { cause: 404 }));
  }

  console.log("BODY RECEIVED:", req.body);
  console.log("FILES RECEIVED:", req.files);

  const {
    fullName,
    title,
    bio,
    experience,
    hourlyRate,
    techStack,
    skills,
    languages,
    github,
    linkedin,
    twitter,
    website,
  } = req.body;

  const updateData = {};

  // 🖼️ دالة تحويل الـ Buffer إلى Data URI (Base64) بشكل سليم مع الـ mimetype لضمان امتداد اللينك الصحيح (.png/.jpg)
  const convertBufferToBase64Str = (file) => {
    const base64Content = file.buffer.toString('base64');
    return `data:${file.mimetype};base64,${base64Content}`;
  };

  // 🖼️ رفع الصورة الشخصية (Profile Image)
  if (req.files && req.files.profileImage && req.files.profileImage[0]) {
    try {
      const fileStr = convertBufferToBase64Str(req.files.profileImage[0]);
      
      const uploadResult = await cloudinary.uploader.upload(fileStr, {
        folder: "user_profiles",
        resource_type: "auto"
      });
      
      // ✅ استخدام secure_url لضمان رابط آمن ومطابق للمواصفات
      console.log("📸 Profile Image Secure URL:", uploadResult.secure_url);
      updateData.profileImage = uploadResult.secure_url;
    } catch (err) {
      console.error("❌ Cloudinary Profile Image Upload Error:", err);
      return next(new Error(`خطأ أثناء رفع الصورة الشخصية: ${err.message || err}`, { cause: 500 }));
    }
  }

  // 🖼️ رفع صورة الغلاف (Cover Image)
  if (req.files && req.files.coverImage && req.files.coverImage[0]) {
    try {
      const fileStr = convertBufferToBase64Str(req.files.coverImage[0]);
      
      const uploadResult = await cloudinary.uploader.upload(fileStr, {
        folder: "user_profiles",
        resource_type: "auto"
      });
      
      // ✅ استخدام secure_url لضمان رابط آمن ومطابق للمواصفات
      console.log("🖼️ Cover Image Secure URL:", uploadResult.secure_url);
      updateData.coverImage = uploadResult.secure_url;
    } catch (err) {
      console.error("❌ Cloudinary Cover Image Upload Error:", err);
      return next(new Error(`خطأ أثناء رفع صورة الغلاف: ${err.message || err}`, { cause: 500 }));
    }
  }

  // 🧠 تحديث البيانات النصية وحقل الـ Username
  if (fullName) updateData.username = fullName.trim();
  if (title) updateData.title = title.trim();
  if (bio) updateData.bio = bio.trim();
  if (experience) updateData.experience = experience;
  if (hourlyRate) updateData.hourlyRate = Number(hourlyRate);

  // 📦 معالجة المصفوفات (Arrays) القادمة من الـ FormData بالفرونت إند
  if (techStack) {
    updateData.techStack = Array.isArray(techStack)
      ? techStack
      : techStack.split(",").map((s) => s.trim()).filter(Boolean);
  }

  if (skills) {
    updateData.skills = Array.isArray(skills)
      ? skills
      : skills.split(",").map((s) => s.trim()).filter(Boolean);
  }

  if (languages) {
    updateData.languages = Array.isArray(languages)
      ? languages
      : languages.split(",").map((s) => s.trim()).filter(Boolean);
  }

  // 🔗 روابط وسائل التواصل
  if (github) updateData.github = github;
  if (linkedin) updateData.linkedin = linkedin;
  if (twitter) updateData.twitter = twitter;
  if (website) updateData.website = website;

  // ✅ تفعيل علامة اكتمال البروفايل للـ Schema
  updateData.compleytprofile = true;

  if (Object.keys(updateData).length === 1 && updateData.compleytprofile) {
    return next(new Error("لا يوجد بيانات جديدة للتحديث", { cause: 400 }));
  }

  // 💾 تحديث الحساب في قاعدة البيانات وإرجاع المستند الجديد
  const updatedUser = await Usermodel.findOneAndUpdate(
    { email },
    updateData,
    {
      new: true, // يضمن إرجاع الحساب بعد التعديل مباشرة بكامل الروابط الجديدة
    }
  );

  return res.status(200).json({
    message: "✅ تم استكمال واستلام الملف الشخصي بنجاح",
    user: updatedUser,
  });
});

//جلب بيانات المستخدم
export const me = asyncHandelr(async(req , res , next)=>{
    
    const id =  req.user._id
  const user = await Usermodel.findById(id)
   return successresponse(
        res,
        "تم جلب البيانات بنجاح",
        200,
      {user: user}
    );
   

       
})
//تغير كلمة السر
export const changePassword = asyncHandelr(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!req.user || !req.user._id) {
    return next(new Error("Unauthorized", { cause: 401 }));
  }

  if (!oldPassword || !newPassword) {
    return next(new Error("يرجى إدخال كلمة السر القديمة والجديدة", { cause: 400 }));
  }

  // 1. get user
  const user = await Usermodel.findById(req.user._id);
  if (!user) {
    return next(new Error("المستخدم غير موجود", { cause: 404 }));
  }

  // 2. check old password
  const ismatch = await comparehash({
        planText: oldPassword ,
        valuehash: user.password
    })

  if (!ismatch) {
    return next(new Error("كلمة السر القديمة غير صحيحة", { cause: 400 }));
  }

  // 3. hash new password
 const hash = generatehash({planText:newPassword})

  // 4. update password
  user.password = hash;
  await user.save();

  return res.status(200).json({
    message: "✅ تم تغيير كلمة السر بنجاح",
  });
});

//تغير كلمة السر عن طريق الايميل
export const changePasswordemail = asyncHandelr(async (req, res, next) => {
 const {email} = req.body
 if (!email) {
    return next(new Error("الايميل غير موجود", { cause: 404 }));
  }
  // 1. get user
  const user = await Usermodel.findOne({email});
  if (!user) {
    return next(new Error("الايميل غير موجود", { cause: 404 }));
  }

 const code =generateCode(10)
  
 const hash = generatehash({planText:code})

 await Usermodel.findOneAndUpdate({email}, {password :hash})
await sendpassword({
    to: email,
    subject: "New Password",
    code: code,
})

  return res.status(200).json({
    message: "✅ تم تغيير كلمة السر بنجاح",
  });
});