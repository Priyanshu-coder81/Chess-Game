import { Game } from "./Game.js";
import {
  CONNECTING,
  GAME_OVER,
  INIT_GAME,
  MOVE,
  RESIGN,
  DRAW_OFFER,
  DRAW_ACCEPTED,
  DRAW_DECLINED,
  RESIGN_ACCEPTED,
} from "./message.js";
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
      }
    });

    socket.on(RESIGN, (payload) => {
      const { gameId } = payload;
      const game = this.games.get(gameId);
      if (game) {
        // The Game class will handle the resign logic
        // We just need to ensure the game exists
      }
    });

    socket.on(DRAW_OFFER, (payload) => {
      const { gameId } = payload;
      const game = this.games.get(gameId);
      if (game) {
        // The Game class will handle the draw offer logic
        // We just need to ensure the game exists
      }
    });

    socket.on(DRAW_ACCEPTED, (payload) => {
      const { gameId } = payload;
      const game = this.games.get(gameId);
      if (game) {
        // The Game class will handle the draw acceptance logic
        // We just need to ensure the game exists
      }
    });

    socket.on(DRAW_DECLINED, (payload) => {
      const { gameId } = payload;
      const game = this.games.get(gameId);
      if (game) {
        // The Game class will handle the draw decline logic
        // We just need to ensure the game exists
      }
    });

    socket.on("disconnect", () => {
      this.removeUser(socket);
    });
  }

  handleMatchmaking(socket) {
    // Check if the user is already in a game and clean up
    for (const [gameId, game] of this.games) {
      if (game.player1 === socket || game.player2 === socket) {
        try {
          // Properly destroy the game and clear all resources
          if (game && typeof game.destroy === "function") {
            game.destroy();
          }
          this.games.delete(gameId);
        } catch (error) {
          console.log("Error destroying game:", error);
          // Remove the game even if destroy fails
          this.games.delete(gameId);
        }
      }
    }

    // Check if user is still in any game after cleanup
    const inGame = Array.from(this.games.values()).some(
      (game) => game.player1 === socket || game.player2 === socket
    );

    if (inGame) {
      return; // User is already in a game, do not add to queue
    }

    if (this.matchQueue.includes(socket)) {
      return; // User is already in the queue
    }

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
        try {
          // Properly destroy the game and clear all resources
          if (game && typeof game.destroy === "function") {
            game.destroy();
          }

          const winnerColor = game.player1 === socket ? "black" : "white";
          this.io.to(gameId).emit(GAME_OVER, {
            winner: winnerColor,
            reason: "disconnect",
          });
        } catch (error) {
          console.log("Error during user removal:", error);
        } finally {
          // Always remove the game from the map
          this.games.delete(gameId);
        }
        break;
      }
    }

    // Remove from queue if waiting
    this.matchQueue = this.matchQueue.filter((s) => s !== socket);
  }
}
