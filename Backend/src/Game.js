import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./message.js";

export class Game {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    (this.board = new Chess()), (this.startTime = new Date());

    this.playersColors = new Map();
    this.playersColors.set(player1, "w");
    this.playersColors.set(player2, "b");

    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "white",
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "black",
        },
      })
    );
  }

  makeMove(socket, move) {
    const currentTurn = this.board.turn();

    const playerColor = this.playersColors.get(socket);

    if (playerColor !== currentTurn) {
      console.log("Invalid move : Not this player's turn");
      socket.send(
        JSON.stringify({
          type: "Invalid Turn",
          message: "It's not your turn",
        })
      );
      return;
    }

    // this will validate automatically
    let result;
   try {
      result = this.board.move(move);
 
   } catch (error) {
    console.log("Error occured while moving",error);
   }
    if (!result) {
      console.log("Illegal move attempted");
      socket.send(
        JSON.stringify({
          type: "Invalid Move",
          message: "Illegal Move",
        })
      );
      return;
    }

    const payload = {
      type: MOVE,
      payload: move,
    };

    this.player1.send(JSON.stringify(payload));
    this.player2.send(JSON.stringify(payload));

    if (this.board.isGameOver()) {
      const winner = this.board.turn() === "w" ? "black" : "white";

      const gameOverPayload = JSON.stringify({
        type: GAME_OVER,
        payload: { winner },
      });

      this.player1.send(gameOverPayload);
      this.player2.send(gameOverPayload);
    }
  }
}
