import { Game } from "./Game.js";
import { CONNECTING, GAME_OVER, INIT_GAME, MOVE } from "./message.js";

export class GameManager {
  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(socket) {
    this.users.push(socket);
    this.addHandler(socket);
  }

  removeUser(socket) {
    this.users = this.users.filter((user) => user !== socket);

    const game = this.games.find(
      (g) => g.player1 === socket || g.player2 === socket
    );
    if (game) {
      clearInterval(game.timerInterval);
      const winner = game.player1 === socket ? "black" : "white";
      const gameOverPayload = JSON.stringify({
        type: GAME_OVER,
        payload: {
          winner,
          reason: "disconnect",
        },
      });
      game.player1.send(gameOverPayload);
      game.player2.send(gameOverPayload);
    }
    
  }

  addHandler(socket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === INIT_GAME) {
        // Remove any old game involving this socket
        this.games = this.games.filter(
          (g) => g.player1 !== socket && g.player2 !== socket
        );

        // Prevent user from being added as pending if already in a game
        const inGame = this.games.some(
          (g) => g.player1 === socket || g.player2 === socket
        );
        if (inGame) return;

        if (this.pendingUser && this.pendingUser !== socket) {
          // Remove any old game involving pendingUser
          this.games = this.games.filter(
            (g) =>
              g.player1 !== this.pendingUser && g.player2 !== this.pendingUser
          );
          // start game
          const game = new Game(socket, this.pendingUser);
          this.games.push(game);
          this.pendingUser = null;
        } else {
          this.pendingUser = socket;
          socket.send(
            JSON.stringify({
              type: CONNECTING,
            })
          );
        }
        return;
      }

      if (message.type === MOVE) {
        const game = this.games.find(
          (game) => game.player1 === socket || game.player2 === socket
        );

        if (game) {
          game.makeMove(socket, message.payload);
        }
      }

      if (message.type === GAME_OVER) {
        const gameIndex = this.games.findIndex(
          (game) => game.player1 === socket || game.player2 === socket
        );

        if (gameIndex !== -1) {
          clearInterval(this.games[gameIndex].timerInterval);
          this.games.splice(gameIndex, 1);
        }
      }
    });
  }
}
