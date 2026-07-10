import "./src/config/env.js"
import express from "express"
import bootstrap from "./src/app.controller.js"
import http from "http";
import { Server } from "socket.io";
import { socketConnection } from "./src/socket/service/socket.js";

const app = express()
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
bootstrap(app , express)
socketConnection();
server.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT} MR/Mostafa`);
});