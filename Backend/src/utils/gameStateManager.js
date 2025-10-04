import { redisClient } from "../db/redis.js";
import { Game as GameModel } from "../models/GameModel.models.js";

export class GameStateManager {
  static async saveGameState(gameId, gameState) {
    const key = `game:${gameId}:state`;
    await redisClient.set(key, JSON.stringify(gameState));
  }

  static async getGameState(gameId) {
    const key = `game:${gameId}:state`;
    const state = await redisClient.get(key);
    return state ? JSON.parse(state) : null;
  }

  static async updateGameState(gameId, updates) {
    const currentState = await this.getGameState(gameId);
    if (!currentState) return null;

    const newState = {
      ...currentState,
      ...updates,
      updatedAt: Date.now()
    };

    await this.saveGameState(gameId, newState);
    return newState;
  }

  static async deleteGameState(gameId) {
    const key = `game:${gameId}:state`;
    await redisClient.del(key);
  }

  static async persistToMongoDB(gameId) {
    try {
      const gameState = await this.getGameState(gameId);
      console.log(gameState);
      if (!gameState) {
        console.error("No game state found for persistence:", gameId);
        return;
      }

      // Map moves to match the moveSchema structure
      const formattedMoves = gameState.moves.map(move => ({
        san: move.san,
        color: move.color === "w" ? "white" : "black",
        timeSpent: move.timeSpent || 0,
        fen: move.fen
      }));

      // Map the game result to schema enum values
      let result = "aborted";
      if (gameState.status === "checkmate" || gameState.status === "timeout") {
        result = gameState.winner === gameState.players.white.id ? "white" : "black";
      } else if (gameState.status === "draw") {
        result = "draw";
      }

      const gameData = {
        gameId,
        whitePlayer: gameState.players.white?.id,
        blackPlayer: gameState.players.black?.id,
        moves: formattedMoves,
        result,
        winner: gameState.winner ? 
          (gameState.winner === gameState.players.white.id ? gameState.players.white.id : gameState.players.black.id) 
          : undefined,
        status: gameState.status,
        startedAt: new Date(gameState.updatedAt),
        endedAt: new Date()
      };

      console.log("Persisting game to MongoDB:", {
        gameId,
        status: gameState.status,
        movesCount: formattedMoves.length
      });

      await GameModel.create(gameData);
      await this.deleteGameState(gameId);
      
      console.log("Game successfully persisted to MongoDB:", gameId);
    } catch (error) {
      console.error("Error persisting game to MongoDB:", {
        gameId,
        error: error.message
      });
      throw error;
    }
  }
}
