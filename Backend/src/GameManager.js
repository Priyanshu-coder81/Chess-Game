import { Game } from "./Game.js";
import { CONNECTING, INIT_GAME, MOVE } from "./message.js";

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

    // Stop the game because the user left
  }

  addHandler(socket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
          // start game
          const game = new Game(socket, this.pendingUser);
          this.games.push(game);
          this.pendingUser = null;
        } else {
          this.pendingUser = socket;
          socket.send(JSON.stringify({
            type: CONNECTING,
          }))
          
        }
        return;
      }

      if (message.type === MOVE) {
        const game = this.games.find(
          (game) => game.player1 === socket || game.player2 === socket
        );

        if (game) {
          game.makeMove(socket,message.payload);
        } 
      }
    });
  }
}
