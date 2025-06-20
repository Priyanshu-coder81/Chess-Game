import dotenv from "dotenv";

import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT;

const wss = new WebSocketServer({ port });

const gameManger = new GameManager();

wss.on("listening", () => {
  console.log(`WebSocket server is listening on port ${port}`);
});

wss.on("connection", function connection(ws) {
  gameManger.addUser(ws);

  ws.on("close", (ws) => {
    gameManger.removeUser(ws);
  });
});
