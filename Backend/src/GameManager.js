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
  RECOVER_GAME,
  RECOVERY_FAILED,
} from "./message.js";
import { nanoid } from "nanoid";

export class GameManager {
  constructor(io) {
    this.io = io;
    this.games = new Map();
    this.matchQueue = [];
  }

  addUser(socket) {
    // Game initialization and matchmaking
    socket.on(INIT_GAME, () => {
      this.handleMatchmaking(socket);
    });

    // Game recovery
    socket.on(RECOVER_GAME, async ({ gameId }) => {
      try {
        const game = this.games.get(gameId);
        if (!game) {
          socket.emit(RECOVERY_FAILED, { reason: "Game not found or already ended" });
          return;
        }

        await game.handleRecovery(socket);
      } catch (err) {
        console.error("Error during game recovery:", err);
        socket.emit(RECOVERY_FAILED, { reason: "Internal server error" });
      }
    });

    // Game moves
    socket.on(MOVE, async ({ gameId, move }) => {
      try {
        const game = this.games.get(gameId);
        if (!game) {
          socket.emit(RECOVERY_FAILED, { reason: "Game not found" });
          return;
        }
        await game.makeMove(socket, move);
      } catch (err) {
        console.error("Error processing move:", err);
      }
    });

    // Game resignation
    socket.on(RESIGN, async ({ gameId }) => {
      try {
        const game = this.games.get(gameId);
        if (game) {
          await game.handleResign(socket);
        }
      } catch (err) {
        console.error("Error processing resignation:", err);
      }
    });

    // Draw offers and responses
    socket.on(DRAW_OFFER, ({ gameId }) => {
      try {
        const game = this.games.get(gameId);
        if (game) {
          game.handleDrawOffer(socket);
        }
      } catch (err) {
        console.error("Error processing draw offer:", err);
      }
    });

    socket.on(DRAW_ACCEPTED, async ({ gameId }) => {
      try {
        const game = this.games.get(gameId);
        if (game) {
          await game.handleDrawAccepted(socket);
        }
      } catch (err) {
        console.error("Error processing draw acceptance:", err);
      }
    });

    socket.on(DRAW_DECLINED, ({ gameId }) => {
      try {
        const game = this.games.get(gameId);
        if (game) {
          game.handleDrawDeclined(socket);
        }
      } catch (err) {
        console.error("Error processing draw decline:", err);
      }
    });

    socket.on("disconnect", () => {
      this.removeUser(socket);
    });
  }

  async handleMatchmaking(socket) {
    try {
      console.log(`Matchmaking request from user: ${socket.user?.username} (${socket.id})`);
      
      // Validate socket has user data
      if (!socket.user || !socket.user._id) {
        console.log("Rejecting matchmaking: No user data");
        socket.emit(RECOVERY_FAILED, { reason: "User data not found" });
        return;
      }

      // Clean up any existing games for this socket
      await this.cleanupExistingGames(socket);

      // Don't add to queue if already in a game or queue
      if (this.isPlayerInGame(socket)) {
        console.log(`${socket.user.username} is already in a game, rejecting matchmaking`);
        return;
      }

      // Remove any existing instances of this socket from queue
      this.matchQueue = this.matchQueue.filter(s => s !== socket);

      // Log current queue state
      console.log(`Current queue before adding ${socket.user.username}:`, 
        this.matchQueue.map(s => ({ id: s.id, username: s.user.username }))
      );

      // Add to matchmaking queue
      this.matchQueue.push(socket);
      socket.emit(CONNECTING);
      
      console.log(`Added ${socket.user.username} to queue. Queue size: ${this.matchQueue.length}`);

      // Create game if we have enough players
      if (this.matchQueue.length >= 2) {
        console.log("Found enough players for a game!");
        
        const player1 = this.matchQueue.shift();
        const player2 = this.matchQueue.shift();

        console.log("Attempting to create game between:", {
          player1: { id: player1.id, username: player1.user?.username },
          player2: { id: player2.id, username: player2.user?.username }
        });

        // Double check both players have user data
        if (!player1.user?._id || !player2.user?._id) {
          console.log("Match failed: Missing user data");
          this.handleFailedMatch(player1, player2);
          return;
        }

        await this.createGame(player1, player2);
        console.log(`Game created successfully between ${player1.user.username} and ${player2.user.username}`);
      } else {
        console.log(`Waiting for more players. Current queue size: ${this.matchQueue.length}`);
      }
    } catch (err) {
      console.error("Error in matchmaking:", err);
      socket.emit(RECOVERY_FAILED, { reason: "Matchmaking failed" });
    }
  }

  handleFailedMatch(player1, player2) {
    console.error("Players missing user data:", {
      player1Has: !!player1.user?._id,
      player2Has: !!player2.user?._id
    });
    
    // Notify players
    player1.emit(RECOVERY_FAILED, { reason: "Invalid player data" });
    player2.emit(RECOVERY_FAILED, { reason: "Invalid player data" });
    
    // Put valid players back in queue
    if (player1.user?._id) this.matchQueue.push(player1);
    if (player2.user?._id) this.matchQueue.push(player2);
  }

  async cleanupExistingGames(socket) {
    for (const [gameId, game] of this.games) {
      if (game.player1 === socket || game.player2 === socket) {
        try {
          if (game && typeof game.destroy === "function") {
            await game.destroy();
          }
        } catch (error) {
          console.error("Error destroying game:", error);
        } finally {
          this.games.delete(gameId);
        }
      }
    }
  }

  isPlayerInGame(socket) {
    return Array.from(this.games.values()).some(
      game => game.player1?.id === socket.id || game.player2?.id === socket.id
    );
  }

  async createGame(player1, player2) {
    try {
      const gameId = nanoid();
      
      // Create and initialize the game
      const game = new Game(player1, player2, gameId, this.io);
      await game.init();
      
      // Store the game only after successful initialization
      this.games.set(gameId, game);

      // Log successful game creation
      console.log("Game created successfully:", {
        gameId,
        player1: player1.user.username,
        player2: player2.user.username
      });
    } catch (err) {
      console.error("Error creating game:", err);
      player1.emit(RECOVERY_FAILED, { reason: "Failed to create game" });
      player2.emit(RECOVERY_FAILED, { reason: "Failed to create game" });
      
      // Put players back in queue if game creation fails
      if (player1.user?._id) this.matchQueue.push(player1);
      if (player2.user?._id) this.matchQueue.push(player2);
    }
  }

  async removeUser(socket) {
    try {
      // Handle disconnection for active games
      for (const [gameId, game] of this.games.entries()) {
        if (game.player1 === socket || game.player2 === socket) {
          await game.handleDisconnect(socket);
          
          // If both players are disconnected, clean up the game
          if (!game.player1?.connected && !game.player2?.connected) {
            await game.destroy();
            this.games.delete(gameId);
          }
          break;
        }
      }

      // Remove from matchmaking queue
      const queueIndex = this.matchQueue.indexOf(socket);
      if (queueIndex !== -1) {
        this.matchQueue.splice(queueIndex, 1);
      }
    } catch (err) {
      console.error("Error removing user:", err);
    }
  }
}
