import express from "express";
import cors from "cors";
import { globalerror } from "./utlis/response/error.response.js";
import { connectDB } from "./DB/conection.js";
import authcontroller from "./modules/auth/auth.controller.js";
import clientcontroller from "./modules/client/client.controller.js";
import devcontroller from "./modules/develper/dev.controller.js";
import chatcontroller from "./socket/chat.controller.js";
import notcontroller from "./notification/notification.controller.js";

const bootstrap = (app) => {

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cors({
<<<<<<< HEAD
  origin: "http://localhost:5173",
=======
  origin: "https://progzila.com",
>>>>>>> 66dd1edf24f1d3dbf86264d63715fa2d3ca574a7
  credentials: true
}));
connectDB();
app.use("/client", clientcontroller);
app.use("/dev", devcontroller);
app.use("/auth", authcontroller);
app.use("/chat", chatcontroller);
app.use("/notification", notcontroller);
app.use(globalerror);
};

export default bootstrap;
