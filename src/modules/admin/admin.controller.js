import Router from "express"

import { middlewere } from "../../middlewere/middlewere.js";
import {  getuser, getusers } from "./service/admin.service.js";

const router = Router()
//جلب المستخدمين
router.get("/getusers", getusers)
//جلب مستخدم معين
router.get("/getuser/:userId", getuser)
export default router