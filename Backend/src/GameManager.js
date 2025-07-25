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
        game.makeMove(socket, move);
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

      this.io.to(gameId).emit("GAME_STARTED", {
        gameId,
        colorAssignments: {
          [player1.id]: "white",
          [player2.id]: "black"
        }
      });
    } else {
      socket.emit(CONNECTING);
    }
  }

  removeUser(socket) {
    for (const [gameId, game] of this.games.entries()) {
      if (game.hasPlayer(socket)) {
        const winnerColor = game.getOpponentColor(socket);
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



