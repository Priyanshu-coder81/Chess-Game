import { Game } from "./Game.js";
import { CONNECTING, GAME_OVER, INIT_GAME, MOVE } from "./message.js";
import { nanoid } from "nanoid";

export class GameManager {
  constructor(io) {
    this.io = io;
    this.games = new Map();
    this.matchQueue = [];
  }

  addUser(socket) {
    socket.on(INIT_GAME, () => {
      this.handleMatchmaking(socket);
    });

    socket.on(MOVE, (payload) => {
      const { gameId, move } = payload;
      const game = this.games.get(gameId);
      if (game) {
        console.log("Before making move in backend");
        game.makeMove(socket, move);
        console.log("After making move in backend");
        this.io.to(gameId).emit("MOVE", move); // broadcast move to room

      }
    });

    socket.on("disconnect", () => {
      this.removeUser(socket);
    });
  }

  handleMatchmaking(socket) {
    this.matchQueue.push(socket);

    if (this.matchQueue.length >= 2) {
      const player1 = this.matchQueue.shift();
      const player2 = this.matchQueue.shift();

      const gameId = nanoid();

      player1.join(gameId);
      player2.join(gameId);

      const game = new Game(player1, player2, gameId, this.io);
      this.games.set(gameId, game);

    } else {
      socket.emit(CONNECTING);
    }
  }

  removeUser(socket) {
    for (const [gameId, game] of this.games.entries()) {
      if (game.player1 === socket || game.player2 === socket) {
        const winnerColor = game.player1 === socket ? "black" : "white";
        this.io.to(gameId).emit(GAME_OVER, {
          winner: winnerColor,
          reason: "disconnect",
        });
        this.games.delete(gameId);
        break;
      }
    }

    // Remove from queue if waiting
    this.matchQueue = this.matchQueue.filter((s) => s !== socket);
  }
}
