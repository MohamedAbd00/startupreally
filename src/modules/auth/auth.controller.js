import Router from "express"
import { singupclint, singupdev } from "./service/register.service.js"
import { changePassword, changePasswordemail, completeProfile, login, me, verifyemail } from "./service/login.service.js"
import { upload   } from "../../utlis/multer/cloud.multer.js";
import { middlewere } from "../../middlewere/middlewere.js";
import passport from "./service/google.service.js";
import { generatetoken } from "../../utlis/security/Token.security.js";
const router = Router()
//dev register
router.post("/signupdev" , singupdev )
router.post("/signupclient" , singupclint )
router.post("/login" , login )
router.post("/verify-email" , verifyemail )
router.get("/me", middlewere() , me )



//تغير كلمة سر العميل
router.put(
  "/changePassword",
  middlewere(),
  changePassword
);
router.post(
  "/changePasswordemail",

  changePasswordemail
);
  
router.put(
  "/complete-profile",
  upload  .fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  completeProfile
);

export default router