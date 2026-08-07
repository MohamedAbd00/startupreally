import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import Usermodel from "../../../DB/models/usermodel.js";
import profileImage from "../../../DB/models/profileImage.js";
import projects from "../../../DB/models/projects.js";
import proposal from "../../../DB/models/proposal.js";
import chat from "../../../DB/models/chat.js";
import Payment from "../../../DB/models/Payment .js";
import { createProjectActivity } from "../../../utlis/activity/projectActivity.js";
import storeModel from "../../../DB/models/store.js";
 import {createNotification} from "../../../utlis/activity/createNotification.js"
  import ProductViews from "../../../DB/models/ProductViews.js"
import Order from "../../../DB/models/Order.js";
import previousprojects from "../../../DB/models/previousprojects.js"
import Review from "../../../DB/models/Review.js"; // ✅ أضف الـ import ده
import chatsupport from "../../../DB/models/chatsupport.js";
import projectreviwe from "../../../DB/models/projectreviwe.js";
import reportModel from "../../../DB/models/report.js";
import { uploadToCloudinary } from "../../../utlis/multer/clouid.multern.js";
import { sendemail } from "../../../utlis/email/sendemail.js";
import { acceptedEmail } from "../../../utlis/temblete/vervication.email.js";

//جلب المستخدمين
export const getusers = asyncHandelr(async (req, res, next) => {
  const user = await Usermodel.find().sort({createdAt: -1});

 
  return successresponse(
    res,
    "تم جلب جميع المستخدمين بنجاح",
    200,
    {
        users: user
    }
  
  );
});
//جلب مستخدم معين
export const getuser = asyncHandelr(async (req, res, next) => {
  const { userId } = req.params;

  const user = await Usermodel.findById(userId);

  return successresponse(
    res,
    "تم جلب المستخدم بنجاح",
    200,
    {
      user,
    }
  );
});