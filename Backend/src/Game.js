import { Chess } from "chess.js";
import {
  GAME_OVER,
  INIT_GAME,
  MOVE,
  RESIGN,
  DRAW_OFFER,
  DRAW_ACCEPTED,
  DRAW_DECLINED,
  RESIGN_ACCEPTED,
} from "./message.js";
import {redisClient} from './db/redis.js';
import {Game as GameModel} from "./models/GameModel.models.js";
import { timingSafeEqual } from "crypto";

export class Game {
  constructor(player1, player2, gameId, io) {
    this.gameId = gameId;
    this.player1 = player1;
    this.player2 = player2;
    this.io = io;
    this.board = new Chess();
    this.startTime = new Date();
    this.gameState = "playing"; // playing, resigned, draw, checkmate, timeout

    this.playersColors = new Map();
    this.playersColors.set(player1, "w");
    this.playersColors.set(player2, "b");

    this.currentTurnStartTime = new Date();
    this.maxTimePerPlayer = 120000; // 120 seconds
    this.whiteTimeUsed = 0;
    this.blackTimeUsed = 0;
    this.whiteTimeRemaining = this.maxTimePerPlayer;
    this.blackTimeRemaining = this.maxTimePerPlayer;

    this.player1.join(this.gameId);
    this.player2.join(this.gameId);


   
  }

  async init() {
    
    await redisClient.set(
      `game:${this.gameId}:initial_state`,
      JSON.stringify({
        gameId: this.gameId,
        player1Id: this.player1.user._id,
        player2Id: this.player2.user._id,
        initialFen: this.board.fen(),
        maxTimePerPlayer: this.maxTimePerPlayer,
      })
    );
    await redisClient.set(`game:${this.gameId}:current_fen`, this.board.fen());

    
    this.gameInstance = await GameModel.create({
      gameId: this.gameId,
      whitePlayer: this.player1.user._id,
      blackPlayer: this.player2.user._id,
      status: "playing",
      startedAt:this.startTime,
    },)

     
    this.player1.emit(INIT_GAME, {
      color: "white",
      gameId: this.gameId,
      players: {
        player: {
          username: this.player1.user.username,
          avatar: this.player1.user.avatar,
        },
        opponent: {
          username: this.player2.user.username,
          avatar: this.player2.user.avatar,
        },
      },
    });

    this.player2.emit(INIT_GAME, {
      color: "black",
      gameId: this.gameId,
      players: {
        opponent: {
          username: this.player1.user.username,
          avatar: this.player1.user.avatar,
        },
        player: {
          username: this.player2.user.username,
          avatar: this.player2.user.avatar,
        },
      },
    });


    this.timeInterval = setInterval(() => {
      if (this.gameState !== "playing") return;

      const now = new Date();
      const timeSpent = now - this.currentTurnStartTime;
      const currentTurn = this.board.turn();

      if (currentTurn === "w") {
        this.whiteTimeRemaining = Math.max(
          0,
          this.maxTimePerPlayer - this.whiteTimeUsed - timeSpent
        );
        if (this.whiteTimeRemaining <= 0) {
          this.endGameDueToTimeEnd("black");
        }
      } else {
        this.blackTimeRemaining = Math.max(
          0,
          this.maxTimePerPlayer - this.blackTimeUsed - timeSpent
        );
        if (this.blackTimeRemaining <= 0) {
          this.endGameDueToTimeEnd("white");
        }
      }

      // Emit time updates to keep frontend synchronized
      this.io
        .to(this.gameId)
        .emit("time_update", {
          whiteTime: this.whiteTimeRemaining,
          blackTime: this.blackTimeRemaining,
        });
      
        
    }, 100); // Update every 100ms for smoother countdown
    // Ensure the timer is properly initialized
    if (!this.timeInterval) {
      console.error("Failed to initialize game timer");
    }
  }

  async clearGameDataFromRedis() {
    const keysToDelete = [`game:${this.gameId}:initial_status`,`game:${this.gameId}:current_fen`,`game:${this.gameId}:status`,`game:${this.gameId}:moves_queue`];
  
    await redisClient.del(keysToDelete);
  
  }
  

  async updateMongoDBGameEnd(status, result , winnerId = null) {
    if(this.gameInstance) {
      await GameModel.findByIdAndUpdate(this.gameInstance._id, {
        status: status,
        result: result,
        winner: winnerId,
        endedAt: new Date(),
      })
    }
  }
 
  async handleResign(resigningPlayer) {
    if (this.gameState !== "playing") return;

    this.gameState = "resigned";
    const winnerId =
      this.playersColors.get(resigningPlayer) === "w" ? this.player2.user._id : this.player1.user._id;

      const result =
      this.playersColors.get(resigningPlayer) === 'w' ? 'black' : 'white';

    this.clearTimer();

    await redisClient.set(`game:${this.gameId}:status`, this.gameState);

    await this.updateMongoDBGameEnd(this.gameState,result,winnerId);

    await this.clearGameDataFromRedis();



    this.io.to(this.gameId).emit(RESIGN_ACCEPTED, {
      gameId: this.gameId,
      winner:result,
      reason: "resignation",
    });

    this.io.to(this.gameId).emit(GAME_OVER, {
      winner:result,
      reason: "resignation",
    });
  }

  

  handleDrawOffer(offeringPlayer) {
    if (this.gameState !== "playing") return;

    const opponent =
      offeringPlayer === this.player1 ? this.player2 : this.player1;
    opponent.emit(DRAW_OFFER, {
      gameId: this.gameId,
      fromPlayer: this.playersColors.get(offeringPlayer)==='w'?"white":"black",
    });
  }

  async handleDrawAccepted(acceptingPlayer) {
    if (this.gameState !== "playing") return;

    this.gameState = "draw";
    this.clearTimer();
    const result = "draw";

     // Update Redis status
     await redisClient.set(`game:${this.gameId}:status`, this.gameState);

     // Update MongoDB Game document immediately (no winner for a draw)
     await this.updateMongoDBGameEnd(this.gameState, result, null);
     
    await this.clearGameDataFromRedis();

    this.io.to(this.gameId).emit(DRAW_ACCEPTED, {
      gameId: this.gameId,
    });

    this.io.to(this.gameId).emit(GAME_OVER, {
      winner: null,
      reason: "draw",
    });
  }

  handleDrawDeclined(decliningPlayer) {
    if (this.gameState !== "playing") return;

    const opponent =
      decliningPlayer === this.player1 ? this.player2 : this.player1;
    opponent.emit(DRAW_DECLINED, {
      gameId: this.gameId,
    });
  }

   async endGameDueToTimeEnd(winner) {
    if (this.gameState !== "playing") return;

    this.gameState = "timeout";
    this.clearTimer();
    const result = winner;
    const winnerId = winner === 'white'? this.player1.user._id : this.player2.user._id;

      // Update Redis status
      await redisClient.set(`game:${this.gameId}:status`, this.gameState);

      // Update MongoDB Game document immediately
      await this.updateMongoDBGameEnd(this.gameState, result, winnerId);

    const reason = "timeout";
    this.io.to(this.gameId).emit(GAME_OVER, {
      winner,
      reason,
    });
  }

  // Add method to clear timer when game ends for any reason
  clearTimer() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  }

  // Destructor method to ensure cleanup
  async destroy() {
    this.clearTimer();
    if (this.gameInstance && this.gameInstance.isModified()) {
      await this.gameInstance.save();
  }
    
  }

 async makeMove(socket, move) {
    if (this.gameState !== "playing") return;

    const currentTurn = this.board.turn();
    const playerColor = this.playersColors.get(socket);

    if (playerColor !== currentTurn) {
      console.log("Invalid move : Not this player's turn");
      socket.emit("invalid_turn", {
        message: "It's not your turn",
      });
      return;
    }

    // this will validate automatically
    let result;
    try {
      result = this.board.move(move);
    } catch (error) {
      console.log("Error occurred while moving", error);
      socket.emit("invalid_move", {
        message: "Invalid Move",
      });
      return;
    }

    const now = new Date();

    const timeSpent = now - this.currentTurnStartTime;

    const fullMoveData = {
      san: result.san,
      color : result.color === 'w'? "white" : "black",
      timeSpent: timeSpent,
      fen: this.board.fen(),
    }
    await redisClient.rPush(`game:${this.gameId}:moves_queue`, JSON.stringify(fullMoveData));
    await redisClient.set(`game:${this.gameId}:current_fen`,this.board.fen());


    if (!result) {
      console.log("Illegal move attempted");
      socket.emit("invalid_move", {
        message: "Illegal Move",
      });
      return;
    }

    if (currentTurn === "w") {
      this.whiteTimeUsed += timeSpent;
      this.whiteTimeRemaining = Math.max(
        0,
        this.maxTimePerPlayer - this.whiteTimeUsed
      );
    } else {
      this.blackTimeUsed += timeSpent;
      this.blackTimeRemaining = Math.max(
        0,
        this.maxTimePerPlayer - this.blackTimeUsed
      );
    }

    // Check if time ran out after the move
    if (this.whiteTimeRemaining <= 0) {
      this.endGameDueToTimeEnd("black");
      return;
    }

    if (this.blackTimeRemaining <= 0) {
      this.endGameDueToTimeEnd("white");
      return;
    }

    this.currentTurnStartTime = now;

    this.io.to(this.gameId).emit(MOVE, {
      move,
      timeSpent,
      whiteTimeRemaining: this.whiteTimeRemaining,
      blackTimeRemaining: this.blackTimeRemaining,
    });

    if (this.board.isGameOver()) {
      this.gameState = "checkmate";
      this.clearTimer();
      const result = this.board.turn() === "w" ? "black" : "white";
      const reason = "checkmate";

      const winnerId = result === 'white'? this.player1.user._id : this.player2.user._id;
      
      await redisClient.set(`game:${this.gameId}:status`,this.gameState);

      await this.updateMongoDBGameEnd(this.gameState,result,winnerId);

      await this.clearGameDataFromRedis();
      
      this.io.to(this.gameId).emit(GAME_OVER, {
        winner:result,
        reason,
      });
    }
  }
  
}

