import dotenv from "dotenv";

import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager.js";
import connectDB from "./db/index.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT;

const wss = new WebSocketServer({ port });

const gameManger = new GameManager();

(connectDB().then(()=> {
   
    console.log(`WebSocket server is listening on port ${port}`);
  
}).catch((err) => {
  console.log("Connection Failed: ", err);
  process.exit(1);
}))

  
  wss.on("connection", function connection(ws) {
    gameManger.addUser(ws);
  
    ws.on("close", () => {
      gameManger.removeUser(ws);
    });
  });


