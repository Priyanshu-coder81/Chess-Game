import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./message.js";

export class Game {
  constructor(player1, player2, gameId, io) {
    this.gameId = gameId;
    this.player1 = player1;
    this.player2 = player2;
    this.io = io;
    (this.board = new Chess()), (this.startTime = new Date());

    this.playersColors = new Map();
    this.playersColors.set(player1, "w");
    this.playersColors.set(player2, "b");

    this.currentTurnStartTime = new Date();
    this.maxTimePerPlayer = 20000; // 20sec
    this.whiteTimeUsed = 0;
    this.blackTimeUsed = 0;

    this.player1.join(this.gameId);
    this.player2.join(this.gameId);

    this.player1.emit(INIT_GAME, {
      color: "white",
      gameId: this.gameId,
      players: {
        player: { username: this.player1.user.username, avatar: this.player1.user.avatar },
        opponent: { username: this.player2.user.username, avatar: this.player2.user.avatar },
      },
    });

    this.player2.emit(INIT_GAME, {
      color: "black",
      gameId: this.gameId,
      players: {
        opponent: { username: this.player1.user.username, avatar: this.player1.user.avatar },
        player: { username: this.player2.user.username, avatar: this.player2.user.avatar },
      },
    });

    this.timeInterval = setInterval(() => {
      const now = new Date();
      const timeSpent = now - this.currentTurnStartTime;
      const currentTurn = this.board.turn();

      if (currentTurn == "w") {
        if (timeSpent + this.whiteTimeUsed > this.maxTimePerPlayer) {
          this.endGameDueToTimeEnd("black");
        }
      } else {
        if (timeSpent + this.blackTimeUsed > this.maxTimePerPlayer) {
          this.endGameDueToTimeEnd("white");
        }
      }
    }, 1000);
  }

  endGameDueToTimeEnd(winner) {
    clearInterval(this.timeInterval);
    const reason = "timeout";
    this.io.to(this.gameId).emit(GAME_OVER, {
      winner,
      reason,
    });
  }

  makeMove(socket, move) {
    const currentTurn = this.board.turn();

    const playerColor = this.playersColors.get(socket);

    if (playerColor !== currentTurn) {
      console.log("Invalid move : Not this player's turn");

      socket.emit("invalid_turn", {
        message: "It's  not you turn",
      });
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
      socket.emit("invalid_move", {
        message: "Illegal Move",
      });
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
      this.io.to(this.gameId).emit(GAME_OVER, {
        move,
        winner,
        reason,
      });

      return;
    }

    if (this.blackTimeUsed > this.maxTimePerPlayer) {
      const winner = "white";
      this.io.to(this.gameId).emit(GAME_OVER, {
        move,
        winner,
        reason,
      });

      return;
    }

    this.currentTurnStartTime = now;

    this.io.to(this.gameId).emit(MOVE, {
      move,
      timeSpent,
    });

    if (this.board.isGameOver()) {
      clearInterval(this.timeInterval);
      const winner = this.board.turn() === "w" ? "black" : "white";
      const reason = "checkmate";

      this.io.to(this.gameId).emit(GAME_OVER, {
        winner,
        reason,
      });
    }
  }
}
