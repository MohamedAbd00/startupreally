import Router from "express"

import { middlewere } from "../../middlewere/middlewere.js";
import { addMember,  createFolder, createProject, createProposal, createTask, deleteAccount, deleteFolder, deleteProject, deleteProjectFile, deleteTask, getallprojects, getDeveloperDashboard, getDeveloperEarnings, GetDeveloperProjects, getFolderFiles, getMyProposals, getOpenProjects, getProjectActivity, getProjectFolders, getProjectMembers, getProjectRoom, getProjectTasks, removeMember, requestwithdraw, updateAccountSettings, updateNotificationSettings, updateprofiledev, updateProject, updateProjectLinks, updatestate, updateTaskStatus, uploadProjectFil } from "./service/dev.service.js";
import { upload, uploadProjectFiles   } from "../../utlis/multer/cloud.multer.js";
import {  uploadStoreProject   } from "../../utlis/multer/clouid.multern.js";

const router = Router()
//تحديث بيانات المبرمج
router.put(
  "/updateprofiledev",
  middlewere(),
upload  .fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateprofiledev
);
//جلب حميع المشاريع
router.get(
  "/getallprojects",
  middlewere(),

  getallprojects
);
//اضافة مشروع
router.post(
  "/createproject",
  middlewere(),
  uploadStoreProject.fields([
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "downloadurl",
      maxCount: 1,
    },
  ]),
  createProject
);
//تحديث حالة النشر
router.put(
  "/updatestate",
  middlewere(),
  updatestate
);
//حذف المشروع
router.delete(
  "/deleteproject",
  middlewere(),
  deleteProject
);
//تعديل المشروع
router.put(
  "/updateProject",
  middlewere(),
  updateProject
);
//تقديم عرض علي المشروع
router.post(
  "/createProposal",
  middlewere(),
  createProposal
);
//جلب المشاريع المتاحة
router.get(
  "/getOpenProjects",
  middlewere(),
  getOpenProjects
);
//جلب عروض المبرمج
router.get(
  "/getMyProposals",
  middlewere(),
  getMyProposals
);
//جلب غرفة المشروع
router.get(
  "/room/:projectId",
  middlewere(),
  getProjectRoom
);
//انشاء مهمة
router.post("/createTask", middlewere(), createTask);
//جلب مهام المشؤوع
router.get("/getProjectTasks/:projectId", middlewere(), getProjectTasks);
//تحديث حالة المهمة
router.patch("/updateTaskStatus/:taskId", middlewere(), updateTaskStatus);
//حذف مهمة
router.delete("/deleteTask/:taskId", middlewere(), deleteTask);
//اضافة عضو
router.post("/addMember", middlewere(), addMember);

//جلب اعضاء الفريق
router.get(
  "/members/:projectId",
  middlewere(),
  getProjectMembers
);
//حذف عضو من فريق العمل
router.delete(
  "/removeMember/:projectId/:memberId",
  middlewere(),
  removeMember
);
//انشاء فولدر
router.post(
  "/createFolder/:projectId/folder",
  middlewere(),
  createFolder
);

// رفع ملفات داخل فولدر
router.post(
  "/uploadProjectFil/:projectId/folder/:folderId/upload",
  middlewere(),
  uploadProjectFiles.array("file", 20),
  uploadProjectFil
);
//جلب الفولدرات لمشروع معين
router.get(
  "/getProjectFolders/:projectId/folders",
  middlewere(),
  getProjectFolders
);
//حذف فولدر بالكامل
router.delete(
  "/deleteFolder/:projectId/folder/:folderId",
  middlewere(),
  deleteFolder
);
// جلب ملفات فولدر
router.get(
  "/getFolderFiles/:projectId/folder/:folderId/files",
  middlewere(),
  getFolderFiles
);

// حذف ملف
router.delete(
  "/deleteProjectFile/:projectId/file/:fileId",
  middlewere(),
  deleteProjectFile
);
//جلب الانشطة
router.get(
  "/getProjectActivity/:projectId/activity",
  middlewere(),
  getProjectActivity
);
//اضافة رابط ديمو و مستودع
router.patch(
  "/updateProjectLinks/:projectId/links",
  middlewere(),
  updateProjectLinks
);
//جلب مشاريع المبرمج
router.get(
  "/GetDeveloperProjects",
  middlewere(),
  GetDeveloperProjects
);
//تحديث بيانات الاعدادات
router.put(
  "/updateAccountSettings",
  middlewere(),
  updateAccountSettings
);
//تعديل اعدادات الاشعارات
router.put(
  "/updateNotificationSettings",
  middlewere(),
  updateNotificationSettings
);

//حذف الحساب
router.delete(
  "/deleteAccount",
  middlewere(),
  deleteAccount
);
//جلب صفحة الاربح
router.get(
  "/getDeveloperEarnings",
  middlewere(),
  getDeveloperEarnings
);
//جلب بيانات الداش بورد
router.get('/getDeveloperDashboard',   middlewere(), getDeveloperDashboard);
router.post('/requestwithdraw',   middlewere(), requestwithdraw);


export default router