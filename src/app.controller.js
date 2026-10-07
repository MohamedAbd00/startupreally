import express from "express";
import cors from "cors";
import { globalerror } from "./utlis/response/error.response.js";
import { connectDB } from "./DB/conection.js";
import authcontroller from "./modules/auth/auth.controller.js";
import clientcontroller from "./modules/client/client.controller.js";
import devcontroller from "./modules/develper/dev.controller.js";
import chatcontroller from "./socket/chat.controller.js";
import notcontroller from "./notification/notification.controller.js";
import admincontroller from "./modules/admin/admin.controller.js";
import paymentcontroller from "./modules/payment/payment.controller.js";
import { socketConnection } from "./socket/service/socket.js"; // أو المسار الصح
import { io } from "../index.js";


const bootstrap = (app) => {

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

app.use(cors({
// origin: "https://progzila.com",

     origin: [
 //   "http://localhost:5173",
 //   "http://localhost:56902",
    "https://progzila.com",
  //  "http://localhost:5174"
  ],



  credentials: true
}));
connectDB();
app.set("io", io);
app.use("/client", clientcontroller);
app.use("/dev", devcontroller);
app.use("/auth", authcontroller);
app.use("/chat", chatcontroller);
app.use("/notification", notcontroller);
app.use("/admin", admincontroller);
app.use("/payment", paymentcontroller);

app.use(globalerror);
};

export default bootstrap;
