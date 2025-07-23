
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./message.js";

export class Game {
  constructor(player1, player2 , gameId) {
    this.gameId = gameId;
    this.player1 = player1;
    this.player2 = player2;
    (this.board = new Chess()), (this.startTime = new Date());

    this.playersColors = new Map();
    this.playersColors.set(player1, "w");
    this.playersColors.set(player2, "b");

    this.currentTurnStartTime = new Date();
    this.maxTimePerPlayer = 20000; // 20sec
    this.whiteTimeUsed = 0;
    this.blackTimeUsed = 0;

    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "white",
          gameId : this.gameId
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "black",
          gameId: this.gameId
        },
      })
    );

    this.timeInterval = setInterval(() => {
      const now = new Date();
      const timeSpent = now - this.currentTurnStartTime;
      const currentTurn = this.board.turn();

      if(currentTurn == 'w') {
      if(timeSpent+this.whiteTimeUsed > this.maxTimePerPlayer) {
          this.endGameDueToTimeEnd("black");
      }
    }
    else {
      if(timeSpent + this.blackTimeUsed > this.maxTimePerPlayer) {
        this.endGameDueToTimeEnd("white");
      }
    }

    }, 1000);
  }

  endGameDueToTimeEnd(winner) {
    clearInterval(this.timeInterval); 
  const gameOverPayload = JSON.stringify({
    type: GAME_OVER,
    payload: {
      winner,
      reason: "timeout"
    }
  });

  this.player1.send(gameOverPayload);
  this.player2.send(gameOverPayload);
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
      console.log("Error occured while moving", error);
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

    const now = new Date();
    const timeSpent = now - this.currentTurnStartTime;

    if (currentTurn === "w") {
      this.whiteTimeUsed += timeSpent;
    } else {
      this.blackTimeUsed += timeSpent;
    }

    const reason = "timeout";

    if (this.whiteTimeUsed > this.maxTimePerPlayer) {
      const winner = "black";
      const gameOverPayload = JSON.stringify({
        type: GAME_OVER,
        payload: {
          move,
          winner,
          reason
        },
      });

      this.player1.send(gameOverPayload);
      this.player2.send(gameOverPayload);

      return;
    }

    if (this.blackTimeUsed > this.maxTimePerPlayer) {
      const winner = "white";
      const gameOverPayload = JSON.stringify({
        type: GAME_OVER,
        payload: { move, winner,reason },
      });

      this.player1.send(gameOverPayload);
      this.player2.send(gameOverPayload);

      return;
    }

    this.currentTurnStartTime = now;

    const payload1 = {
      type: MOVE,
      payload: {
        move,
        timeSpent,
      },
    };

    this.player1.send(JSON.stringify(payload1));
    this.player2.send(JSON.stringify(payload1));

    if (this.board.isGameOver()) {
      clearInterval(this.timeInterval);
      const winner = this.board.turn() === "w" ? "black" : "white";
      const reason = "checkmate"
      const gameOverPayload = JSON.stringify({
        type: GAME_OVER,
        payload: { winner,reason },
      });

      this.player1.send(gameOverPayload);
      this.player2.send(gameOverPayload);
    }
  }
}
