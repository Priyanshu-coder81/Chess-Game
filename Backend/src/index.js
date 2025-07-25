import dotenv from "dotenv";
import express from 'express'
import { Server } from "socket.io";
import http from "http";
import { GameManager } from "./GameManager.js";
import connectDB from "./db/index.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT;

const app = express();

const server = http.createServer(app);

// Todo adjust CORS
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const gameManger = new GameManager(io);

connectDB()
  .then(() => {
    console.log("Database Connected");
    server.listen(port, () => {
      console.log(`Socket.IO server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Connection Failed: ", err);
    process.exit(1);
  });

  
  io.on("connection", (socket) => {
    gameManger.addUser(socket);
  });
