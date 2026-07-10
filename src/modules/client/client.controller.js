import Router from "express"

import { middlewere } from "../../middlewere/middlewere.js";
import { acceptProposal, Addbatch, addfeatures, addObjective, clinetapprove, clinetdashboard, compliteprofileclient, createproject, deleteAccount, getalldev, getAllImages, getClientProjects, getdetilsproject, getdevprofile, getProjectProposals, getstore, rejectProposal, updateAccountSettings, updateNotificationSettings } from "./service/clinet.service.js";
const router = Router()
//اكمال الملف الشخصي
router.put(
  "/compliteprofileclient",

  compliteprofileclient
);
//جلب الصور الي هيختار منها العميل
router.get(
  "/getallimages",

  getAllImages
);

//انشاء مشروع 
router.post(
  "/createproject",
middlewere(),
  createproject
);
//جلب المشاريع
router.get(
  "/myprojects",
  middlewere(),
  getClientProjects
);
//جلب العروض للعميل
router.get(
  "/getProjectProposals",
  middlewere(),
  getProjectProposals
);
//قبول عرض
router.patch(
  "/accept/:proposalId",
  middlewere(),
  acceptProposal
);
//رفض العرض
router.patch(
  "/reject/:proposalId",
  middlewere(),
  rejectProposal
);
//اضافة هدف
router.post(
  "/addObjective/:projectId/objective",
  middlewere(),
  addObjective
);
//اضافة ميزة
router.post(
  "/addfeatures/:projectId/feature",
  middlewere(),
  addfeatures
);
//اضافة دفعة لمشروع معين
router.post(
  "/addbatch/:projectid",
  middlewere(),
  Addbatch
);
//الموافقة علي المشروع
router.patch(
  "/clinetapprove/:projectId",
  middlewere(),
  clinetapprove
);
//جلب بيانات الداش بورد
router.get(
  "/clinetdashboard",
  middlewere(),
  clinetdashboard
);
//جلب ملف مبرمج معين
router.get(
  "/getdevprofile/:id",
  getdevprofile
);
//جلب جميع المبرمجين
router.get(
  "/getalldev",

  getalldev
);
//جلب المتجر
router.get(
  "/getstore",

  getstore
);
//تعديل اعدادات الحساب للعميل
router.put(
  "/updateAccountSettings",
  middlewere(),
  updateAccountSettings
);
//تعديل اعدادات الاشعارات للعميل
router.put(
  "/updateNotificationSettings",
  middlewere(),
  updateNotificationSettings
);
//حذف حساب العميل
router.delete(
  "/deleteAccount",
  middlewere(),
  deleteAccount
);
//جلب بيانات مشروع معين
router.get(
  "/getdetilsproject/:id",
   middlewere(),
  getdetilsproject
);
export default router