import dotenv from "dotenv";
import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { GameManager } from "./GameManager.js";
import connectDB from "./db/index.js";
import userRoutes from "./routes/user.routes.js";
import { verifyAccessToken } from "./utils/verifyAccessToken.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);

// CORS configuration for Express
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRoutes);

// Health check route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

const gameManager = new GameManager(io);

// Socket.IO connection handling
io.on("connection", async (socket) => {
  console.log("New socket connection attempt", socket.id);
  const token = socket.handshake.auth.token;

  if (
    typeof token === "string" &&
    token.trim() &&
    token !== "undefined" &&
    token !== "null"
  ) {
    try {
      const user = await verifyAccessToken(token);
      if (user) {
        socket.user = user;
        console.log(
          `Authenticated user connected: ${user.username} (Socket ID: ${socket.id})`
        );
      }
    } catch (err) {
      console.error("Socket authentication failed:", err);
      socket.emit("auth_error", { message: "Authentication failed" });
      socket.disconnect();
      return;
    }
  } else {
    console.log("No valid token provided");
    socket.emit("auth_error", { message: "No valid token provided" });
    socket.disconnect();
    return;
  }

  // Only add authenticated users
  if (socket.user) {
    gameManager.addUser(socket);

    socket.emit("auth_success", { username: socket.user.username });
  } else {
    console.log("no socket.user object ");
  }
});

// Connect to database and start server
connectDB()
  .then(() => {
    console.log("Database Connected");
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database Connection Failed:", err);
    process.exit(1);
  });
