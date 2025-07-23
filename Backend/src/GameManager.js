import { Game } from "./Game.js";
import { CONNECTING, GAME_OVER, INIT_GAME, MOVE } from "./message.js";
import { nanoid } from "nanoid";

export class GameManager {
  constructor() {
    this.games = new Map();
    this.matchQueue = [];
    this.users = [];
  }

  addUser(socket) {
    this.users.push(socket);
    this.addHandler(socket);
  }
  // TODO: To optimize this, Remove for loop and search with gameId, 
  // which is to be send by frontend (make changes at frontend) 
  // ***SAME FOR MOVE, and GAME_OVER***
   
  removeUser(socket) {
    this.users = this.users.filter((user) => user !== socket);

    for(const [gameId , game] of this.games.entries()) {

      if(game.player1 === socket || game.player2 === socket) {
        clearInterval(game.timerInterval);

        const winner = game.player1 === socket ? "black": "white";

        const gameOverPayload = JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner,
            reason: "disconnect",
          }
        });
        game.player1.send(gameOverPayload);
        game.player2.send(gameOverPayload);
        this.games.delete(gameId);
        break;
      }
    }
  }

  addHandler(socket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === INIT_GAME) {
        // Remove any old game involving this socket
        const user = { socket };

        this.matchQueue.push(user);

        if (this.matchQueue.length >= 2) {
          const player1 = this.matchQueue.shift();
          const player2 = this.matchQueue.shift();

          const gameId = nanoid();

          const game = new Game(player1.socket, player2.socket, gameId);

          this.games.set(gameId, game);
        } else {
          socket.send(
            JSON.stringify({
              type: CONNECTING,
            })
          );
        }
        return;
      }

      if (message.type === MOVE) {
        for (const [gameId, game] of this.games.entries()) {
          if (game.player1 === socket || game.player2 === socket) {
            game.makeMove(socket, message.payload);
            break;
          }
        }
      }

      if (message.type === GAME_OVER) {
        for(const [gameId , game] of this.games.entries()) {
          if(game.player1 === socket || game.player2 === socket) {
            clearInterval(game.timerInterval);
            this.games.delete(gameId);
            break;
          }
        }
      }
    });
  }
}
