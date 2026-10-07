import Router from "express"

import { middlewere } from "../../middlewere/middlewere.js";
import {  approveWithdrawal, createAdmin, createClientAndProject, deleteAdmin, deleteStoreProject, getAdminAuditLog, getAdminTeam, getAllActivities, getAnalytics, getDashboard, getFinanceDashboard, getMarketplaceSales, getPendingWithdrawals, getProject, getProjects, getStoreProducts, getuser, getusers, getWithdrawalHistory, rejectWithdrawal, sendBroadcastEmail, sendBroadcastNotification, sendEmailToUser, sendNotificationToUser, toggleStoreProduct, updateAdmin } from "./service/admin.service.js";

const router = Router()
//جلب المستخدمين
router.get("/getusers", middlewere(), getusers)
//جلب مستخدم معين
router.get("/getuser/:userId",middlewere(), getuser)
router.get("/analytics",middlewere(), getAnalytics);
router.get("/getProjects",middlewere(), getProjects);
router.get("/getProject/:id",middlewere(), getProject);
router.get("/getStoreProducts",middlewere(), getStoreProducts);

router.delete("/deleteStoreProject/:id",middlewere(), deleteStoreProject);

router.get(
  "/getMarketplaceSales",middlewere(),
  getMarketplaceSales
);

router.get(
  "/toggleStoreProduct/:id",middlewere(),
  toggleStoreProduct
);
router.get(
  "/getDashboard",middlewere(),
  getDashboard
);
router.post(
  "/sendBroadcastNotification",middlewere(),
  sendBroadcastNotification
);

router.post(
  "/sendNotificationToUser",middlewere(),
  sendNotificationToUser
);
router.get(
  "/getAdminTeam",middlewere(),
  getAdminTeam
);

router.get(
  "/getAdminAuditLog",middlewere(),
  getAdminAuditLog
);
router.post(
  "/createAdmin",middlewere(),
  createAdmin
);
router.delete(
  "/deleteAdmin/:userId",middlewere(),
  deleteAdmin
);
router.put(
  "/updateAdmin/:userId",middlewere(),
  updateAdmin
);
router.get(
  "/getFinanceDashboard/",middlewere(),
  getFinanceDashboard
);

router.get(
  "/getPendingWithdrawals",middlewere(),
  getPendingWithdrawals
);
router.get(
  "/getWithdrawalHistory",middlewere(),
  getWithdrawalHistory
);
router.post(
  "/approveWithdrawal/:withdrawalId",middlewere(),
  approveWithdrawal
);
router.get(
  "/getAllActivities",middlewere(),
  getAllActivities
);

router.post(
    "/send-broadcast-email",
    middlewere(),
    sendBroadcastEmail
);
router.post(
  "/create-client-project",
  createClientAndProject
);
// إرسال إيميل لمستخدم واحد
router.post(
    "/send-email-user",
    middlewere(),
    sendEmailToUser
);

router.post(
  "/rejectWithdrawal/:withdrawalId",middlewere(),
  rejectWithdrawal
);






export default router