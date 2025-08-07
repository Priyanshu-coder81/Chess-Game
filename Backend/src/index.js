import dotenv from "dotenv";
import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { GameManager } from "./GameManager.js";
import connectDB from "./db/index.js";
import userRoutes from "./routes/user.routes.js";
import { verify } from "crypto";
import { verifyAccessToken } from "./utils/verifyAccessToken.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 8000;

const app = express();

const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173/", // Frontend URL
    credentials: true,
  })
);

// Routes
app.use("/api/v1/users", userRoutes);

// Health check route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Todo adjust CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

const gameManger = new GameManager(io);

connectDB()
  .then(() => {
    console.log("Database Connected");
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Connection Failed: ", err);
    process.exit(1);
  });

io.on("connection", async (socket) => {
  const token = socket.handshake.auth.token;
  if (typeof token === "string" && token.trim() && token !== "undefined" && token !== "null") {

    let user = null; 
    try {
       user = await verifyAccessToken(token);
    }
    catch(err) {
      socket.disconnect();
      return;
    }
    if(user) {
      socket.user = user;
    }
  }/* else {
    // Guest connection
    const guestId = generateGuestId(); // your custom guest logic
    socket.user = { username: `Guest-${guestId}`, avatar: "default.png" };
    console.log("Guest connected:", socket.user.username);
  } */
  gameManger.addUser(socket);
});
