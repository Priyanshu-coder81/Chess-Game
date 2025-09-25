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
  GAME_RECOVERED,
  RECOVERY_FAILED,
} from "./message.js";
import { GameStateManager } from "./utils/gameStateManager.js";

export class Game {
  constructor(player1, player2, gameId, io) {
    this.gameId = gameId;
    this.player1 = player1;
    this.player2 = player2;
    this.io = io;
    this.board = new Chess();
    this.startTime = Date.now();
    this.gameState = "playing"; // playing, resigned, draw, checkmate, timeout, disconnect

    // playersColors maps socket (object) -> 'w' | 'b'
    this.playersColors = new Map();
    this.playersColors.set(player1, "w");
    this.playersColors.set(player2, "b");

    this.disconnectTimeouts = new Map();
    this.maxTimePerPlayer = 120000; // 120 seconds
    this.currentTurnStartTime = null; // Initialize as null

    // Ensure sockets are in the room
    this.player1.join(this.gameId);
    this.player2.join(this.gameId);

    this.clocks = {
      white: this.maxTimePerPlayer,
      black: this.maxTimePerPlayer,
    };

    this.lastUpdateTime = null;
    this.turnStartTime = null;
    this.turnClockAtStart = null;
  }

  async init() {
    try {
      // Validate player data before initialization
      if (!this.player1?.user?._id || !this.player2?.user?._id) {
        throw new Error("Invalid player data during initialization");
      }

      console.log("Initializing game:", {
        gameId: this.gameId,
        player1: {
          id: this.player1.id,
          userId: this.player1.user._id,
          username: this.player1.user.username,
        },
        player2: {
          id: this.player2.id,
          userId: this.player2.user._id,
          username: this.player2.user.username,
        },
      });

      const initialState = {
        fen: this.board.fen(),
        moves: [],
        players: {
          white: {
            id: this.player1.user._id,
            name: this.player1.user.username,
          },
          black: {
            id: this.player2.user._id,
            name: this.player2.user.username,
          },
        },
        clocks: {
          white: this.maxTimePerPlayer,
          black: this.maxTimePerPlayer,
        },
        turn: "w",
        status: "playing",
        updatedAt: Date.now(),
      };

      console.log("Saving initial game state to Redis:", {
        gameId: this.gameId,
        fen: initialState.fen,
        turn: initialState.turn,
        status: initialState.status,
      });

      await GameStateManager.saveGameState(this.gameId, initialState);
      console.log(
        "Game state successfully saved to Redis for game:",
        this.gameId
      );

      // Set the initial turn start time only after game is fully initialized
      this.currentTurnStartTime = Date.now();
      console.log("Initial turn start time set:", this.currentTurnStartTime);
    } catch (error) {
      console.error("Error initializing game:", {
        error: error.message,
        gameId: this.gameId,
        player1Id: this.player1?.id,
        player2Id: this.player2?.id,
      });
      throw error;
    }

    // Prepare and emit init events to both players
    try {
      const player1Data = {
        color: "white",
        gameId: this.gameId,
        initialWhiteTime: this.maxTimePerPlayer,
        initialBlackTime: this.maxTimePerPlayer,
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
      };

      const player2Data = {
        color: "black",
        gameId: this.gameId,
        initialWhiteTime: this.maxTimePerPlayer,
        initialBlackTime: this.maxTimePerPlayer,
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
      };

      console.log("Sending INIT_GAME to players:", {
        gameId: this.gameId,
        player1: {
          id: this.player1.id,
          username: this.player1.user.username,
          data: player1Data,
        },
        player2: {
          id: this.player2.id,
          username: this.player2.user.username,
          data: player2Data,
        },
      });

      // Emit to both players with acknowledgment
      this.player1.emit(INIT_GAME, player1Data, (error) => {
        if (error) {
          console.error("Error sending INIT_GAME to player1:", {
            playerId: this.player1.id,
            error,
          });
        } else {
          console.log(
            "INIT_GAME successfully sent to player1:",
            this.player1.id
          );
        }
      });

      this.player2.emit(INIT_GAME, player2Data, (error) => {
        if (error) {
          console.error("Error sending INIT_GAME to player2:", {
            playerId: this.player2.id,
            error,
          });
        } else {
          console.log(
            "INIT_GAME successfully sent to player2:",
            this.player2.id
          );
        }
      });
    } catch (error) {
      console.error("Error sending INIT_GAME events:", {
        error: error.message,
        gameId: this.gameId,
        player1Id: this.player1?.id,
        player2Id: this.player2?.id,
      });
      throw error;
    }
    console.log("Both players notified of game start:", this.gameId);

    this.lastUpdateTime = Date.now();
    const initialColor = this.board.turn() === "w" ? "white" : "black";
    this.turnStartTime = this.lastUpdateTime;
    this.turnClockAtStart = this.clocks[initialColor];

    // Start the game timer
    this.timeInterval = setInterval(() => {
      if (this.gameState !== "playing") {
        return;
      }
      const currentColor = this.board.turn() === "w" ? "white" : "black";
      const now = Date.now();
      const elapsed = now - this.lastUpdateTime;
      this.lastUpdateTime = now;
      this.clocks[currentColor] = Math.max(
        0,
        this.clocks[currentColor] - elapsed
      );

      if (this.clocks[currentColor] <= 0) {
        this.endGameDueToTimeEnd(currentColor === "white" ? "black" : "white");
        return;
      }

      this.io.to(this.gameId).emit("time_update", this.clocks);
    }, 1000);

    if (!this.timeInterval) {
      console.error("Failed to initialize game timer");
    }
  }

  handleDisconnect(socket) {
    if (this.gameState !== "playing") return;

    let color = null;
    if (this.player1 === socket) {
      // Do not set player1 to null, keep reference for recovery
      color = "white";
    } else if (this.player2 === socket) {
      // Do not set player2 to null, keep reference for recovery
      color = "black";
    }

    if (color) {
      this.startDisconnectTimeout(color);
    }
  }

  startDisconnectTimeout(color) {
    const timeout = setTimeout(async () => {
      if (this.gameState === "playing") {
        this.gameState = "disconnect";
        const winner = color === "white" ? "black" : "white";
        this.clearTimer();

        // Update game state in Redis
        const state = await GameStateManager.getGameState(this.gameId);
        if (state) {
          const updates = {
            status: "disconnect",
            updatedAt: Date.now(),
          };
          await GameStateManager.updateGameState(this.gameId, updates);
        }

        // Persist to MongoDB and cleanup
        await GameStateManager.persistToMongoDB(this.gameId);

        this.io
          .to(this.gameId)
          .emit(GAME_OVER, { winner, reason: "disconnect" });
      }
    }, 30000); // 30 seconds

    this.disconnectTimeouts.set(color, timeout);
  }

  async endGame(reason, winner) {
    if (this.gameState !== "playing") return;

    this.gameState = reason;
    this.clearTimer();

    const state = await GameStateManager.getGameState(this.gameId);
    if (state) {
      const updates = {
        status: reason,
        result: winner || "draw", // For checkmate: 'white' or 'black', for draw: 'draw'
        winner: winner
          ? winner === "white"
            ? this.player1.user._id
            : this.player2.user._id
          : null,
        endedAt: new Date(),
        updatedAt: Date.now(),
      };
      await GameStateManager.updateGameState(this.gameId, updates);
    }

    // Persist to MongoDB and cleanup Redis
    await GameStateManager.persistToMongoDB(this.gameId);

    this.io.to(this.gameId).emit(GAME_OVER, {
      winner,
      reason,
    });
  }

  async handleResign(resigningPlayer) {
    if (this.gameState !== "playing") return;

    this.gameState = "resigned";
    const winnerColor =
      this.playersColors.get(resigningPlayer) === "w" ? "black" : "white";
    const winnerId =
      winnerColor === "white" ? this.player1.user._id : this.player2.user._id;

    this.clearTimer();

    // Update game state in Redis
    const state = await GameStateManager.getGameState(this.gameId);
    if (state) {
      const updates = {
        status: "resigned",
        result: winnerColor,
        winner: winnerId,
        endedAt: new Date(),
        updatedAt: Date.now(),
      };
      await GameStateManager.updateGameState(this.gameId, updates);
    }

    // Persist to MongoDB and cleanup
    await GameStateManager.persistToMongoDB(this.gameId);

    // Notify players
    this.io.to(this.gameId).emit(RESIGN_ACCEPTED, {
      gameId: this.gameId,
      winner: winnerColor,
      reason: "resignation",
    });

    this.io.to(this.gameId).emit(GAME_OVER, {
      winner: winnerColor,
      reason: "resignation",
    });
  }

  // --- Recovery method ---
  async handleRecovery(socket) {
    try {
      const state = await GameStateManager.getGameState(this.gameId);
      if (!state || state.status !== "playing") {
        socket.emit(RECOVERY_FAILED, { reason: "Game has ended or not found" });
        return;
      }

      // Validate socket has user
      if (!socket?.user || !socket.user._id) {
        socket.emit(RECOVERY_FAILED, { reason: "Missing user info" });
        return;
      }

      const reconnectingUserId = socket.user._id.toString();
      const isWhite = state.players.white.id === reconnectingUserId;
      const isBlack = state.players.black.id === reconnectingUserId;

      if (!isWhite && !isBlack) {
        socket.emit(RECOVERY_FAILED, { reason: "Not part of this game" });
        return;
      }

      const color = isWhite ? "white" : "black";
      const oldSocketRef = isWhite ? this.player1 : this.player2;

      // Update socket reference
      if (isWhite) {
        this.player1 = socket;
      } else {
        this.player2 = socket;
      }

      // Clear disconnect timeout if exists
      if (this.disconnectTimeouts.has(color)) {
        clearTimeout(this.disconnectTimeouts.get(color));
        this.disconnectTimeouts.delete(color);
      }

      // Update color mappings
      if (oldSocketRef) {
        this.playersColors.delete(oldSocketRef);
      }
      this.playersColors.set(socket, color === "white" ? "w" : "b");

      // Ensure new socket joins the game room
      socket.join(this.gameId);

      // Update in-memory board
      try {
        if (state.fen !== this.board.fen()) {
          this.board.load(state.fen);
        }
      } catch (err) {
        console.warn(
          "Failed to load fen into in-memory board on recovery:",
          err
        );
      }

      // Emit GAME_RECOVERED to the reconnecting socket
      socket.emit(GAME_RECOVERED, {
        gameId: this.gameId,
        color,
        fen: state.fen,
        moves: state.moves,
        clocks: state.clocks,
        players: state.players,
        status: state.status,
        turn: state.turn,
      });

      // Also optionally notify the other player that their opponent reconnected
      const otherSocket = color === "white" ? this.player2 : this.player1;
      if (otherSocket && otherSocket.id && otherSocket.id !== socket.id) {
        otherSocket.emit("opponent_reconnected", { gameId: this.gameId });
      }
    } catch (err) {
      console.error("Error during handleRecovery:", err);
      try {
        socket.emit(RECOVERY_FAILED, { reason: "internal_error" });
      } catch (_) {}
    }
  }

  handleDrawOffer(offeringPlayer) {
    if (this.gameState !== "playing") return;

    const opponent =
      offeringPlayer === this.player1 ? this.player2 : this.player1;
    opponent.emit(DRAW_OFFER, {
      gameId: this.gameId,
      fromPlayer:
        this.playersColors.get(offeringPlayer) === "w" ? "white" : "black",
    });
  }

  async handleDrawAccepted(acceptingPlayer) {
    if (this.gameState !== "playing") return;

    this.gameState = "draw";
    this.clearTimer();

    // Update game state in Redis
    const state = await GameStateManager.getGameState(this.gameId);
    if (state) {
      const updates = {
        status: "draw",
        result: "draw",
        winner: null,
        endedAt: new Date(),
        updatedAt: Date.now(),
      };
      await GameStateManager.updateGameState(this.gameId, updates);
    }

    // Persist to MongoDB and cleanup
    await GameStateManager.persistToMongoDB(this.gameId);

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
    const winnerId =
      winner === "white" ? this.player1.user._id : this.player2.user._id;

    // Update the game state in Redis
    const state = await GameStateManager.getGameState(this.gameId);
    if (state) {
      const updates = {
        status: "timeout",
        result: winner, // 'white' or 'black'
        winner: winnerId,
        endedAt: new Date(),
        updatedAt: Date.now(),
      };
      await GameStateManager.updateGameState(this.gameId, updates);
    }

    // Persist to MongoDB and cleanup
    await GameStateManager.persistToMongoDB(this.gameId);

    this.io.to(this.gameId).emit(GAME_OVER, {
      winner,
      reason: "timeout",
    });
  }

  // Add method to clear timer when game ends for any reason
  clearTimer() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
    // Clear disconnect timeouts
    for (const timeout of this.disconnectTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.disconnectTimeouts.clear();
  }

  // Destructor method to ensure cleanup
  async destroy() {
    this.clearTimer();
    try {
      // Ensure any pending state is saved before destruction
      const state = await GameStateManager.getGameState(this.gameId);
      if (state && state.status === "playing") {
        await GameStateManager.persistToMongoDB(this.gameId);
      }
    } catch (err) {
      console.error("Error during game destruction:", err);
    }
  }

  async makeMove(socket, move) {
    if (this.gameState !== "playing") return;

    const state = await GameStateManager.getGameState(this.gameId);
    if (!state) return;

    const playerColor = this.playersColors.get(socket);
    if (playerColor !== state.turn) {
      socket.emit("invalid_turn", { message: "Not your turn" });
      return;
    }

    try {
      const result = this.board.move(move);
      if (!result) {
        socket.emit("invalid_move", { message: "Invalid move" });
        return;
      }

      const now = Date.now();
      const currentColor = playerColor === "w" ? "white" : "black";
      
      const elapsedSinceLastUpdate = this.lastUpdateTime ? now - this.lastUpdateTime : 0;
      if (elapsedSinceLastUpdate > 0) {
        this.clocks[currentColor] = Math.max(0, this.clocks[currentColor] - elapsedSinceLastUpdate);
        this.lastUpdateTime = now;
      }
  
      // 2) Compute timeSpent for this turn
      // Prefer the difference from clocks to avoid small drift: turnClockAtStart - currentClock
      let timeSpent;
      if (typeof this.turnClockAtStart === "number") {
        const timeFromClocks = this.turnClockAtStart - this.clocks[currentColor];
        if (timeFromClocks >= 0) {
          timeSpent = timeFromClocks;
        } else {
          // fallback
          timeSpent = (this.turnStartTime ? now - this.turnStartTime : elapsedSinceLastUpdate);
        }
      } else {
        timeSpent = (this.turnStartTime ? now - this.turnStartTime : elapsedSinceLastUpdate);
      }


      console.log("Move timing:", {
        moveStartTime: this.currentTurnStartTime,
        moveEndTime: now,
        timeSpentMs: timeSpent,
        timeSpentSec: timeSpent / 1000,
      });

      const moveData = {
        color: playerColor === "w" ? "white" : "black",
        fen: this.board.fen(),
        san: result.san,
        timeSpent: timeSpent, // Store in milliseconds
        timeSpentSeconds: timeSpent / 1000, // Add seconds for readability in logs
      };

      const newClocks = {
        ...state.clocks,
        [currentColor]: this.clocks[currentColor]
      };

      // Check for timeout
      if (newClocks[currentColor] <= 0) {
        await GameStateManager.updateGameState(this.gameId, {
          clocks: newClocks,
          updatedAt: now
        });
        await this.endGameDueToTimeEnd(
          currentColor === "white" ? "black" : "white"
        );
        return;
      }

      const updates = {
        fen: this.board.fen(),
        moves: [...state.moves, moveData],
        turn: this.board.turn(),
        clocks: newClocks,
        updatedAt: now,
      };

      // Check game ending conditions
      if (this.board.isCheckmate()) {
        // The winner is the player who made the move (playerColor)
        // Since after a checkmate move, the turn switches but the game is over
        const winner = currentColor;
        console.log("Checkmate detected:", {
          movingPlayer: playerColor,
          winner,
          currentTurn: this.board.turn(),
        });

        updates.status = "checkmate";
        updates.winner = winner; // Store the winner in the game state
        await GameStateManager.updateGameState(this.gameId, updates);
        await this.endGame("checkmate", winner);
        return;
      } else if (this.board.isDraw()) {
        updates.status = "draw";
        await GameStateManager.updateGameState(this.gameId, updates);
        await this.endGame("draw", null);
        return;
      }

      // Update the game state
      await GameStateManager.updateGameState(this.gameId, updates);

      // First emit the move to all players
      this.io.to(this.gameId).emit(MOVE, {
        move: result,
        timeSpent,
      });

      // Only after emitting the move, update the turn start time for the next move
     const nextColor = this.board.turn() === "w"? "white":"black";
     this.turnStartTime = Date.now();
     this.turnClockAtStart = this.clocks[nextColor];
    } catch (err) {
      console.error("Move error:", err);
      socket.emit("invalid_move", { message: "Server error" });
    }
  }
}
