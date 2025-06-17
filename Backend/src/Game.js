import { Chess } from "chess.js";
import { INIT_GAME, MOVE } from "./message.js";

export class Game {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    (this.board = new Chess()), (this.startTime = new Date());
    this.moveCount = 0;
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


    // Validate user
    if (this.moveCount % 2 === 0 && socket != this.player1) {
      console.log("Invalid move: Not player1's turn");
      return;
    }
    if (this.moveCount % 2 === 1 && socket != this.player2) {
      console.log("Invalid move: Not player2's turn");
      return;
    }

    // this will validate automatically
    try {
        this.board.move(move);
    } catch (error) {
      console.log("Move failed with error:", error);
      return;
    }

    // if game is over tell the winner of game to both

    if (this.board.isGameOver()) {
      this.player1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );

      this.player2.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );

      return;
    }

    if (this.moveCount % 2 === 0) {
      this.player2.send(JSON.stringify({ type: MOVE, payload: move }));
    } else {
      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }
    this.moveCount++;
  }
}
