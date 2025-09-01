import {redisClient} from "../db/redis.js";
import { Game as GameModel } from "../models/GameModel.models.js"; 
import connectDB from "../db/index.js";


const BATCH_SIZE = 50;
const PROCESSING_INTERVAL_MS = 10000;

async function processGameMoves() {


  try {
    const gameToProcess = await GameModel.find({
      status: { $in: ["playing","resigned","draw","checkmate","timeout"] },
    },'_id gameId status').lean();


    for(const game of gameToProcess) {
        const mongoGameId = game._id;
        const nanoidGameId = game.gameId;

        
      const redisQueueKey = `game:${nanoidGameId}:moves_queue`;
      const redisCurrentFenKey = `game:${nanoidGameId}:current_fen`;
      const redisInitialStateKey = `game:${nanoidGameId}:initial_state`;
      const redisStatusKey = `game:${nanoidGameId}:status`;


      
      let hasMoreMovesInRedis = true;
      let totalMovesProcessedForGame = 0;

      while (hasMoreMovesInRedis) {
        const movesToProcessJson = await redisClient.lRange(redisQueueKey, 0, BATCH_SIZE - 1);

        if (movesToProcessJson.length === 0) {
          hasMoreMovesInRedis = false;
          continue;
        }

        await redisClient.lTrim(redisQueueKey, movesToProcessJson.length, -1);

        const parsedMoves = movesToProcessJson.map(moveJson => JSON.parse(moveJson));

        console.log(parsedMoves);

        if (parsedMoves.length > 0) {
          await GameModel.findByIdAndUpdate(
            mongoGameId,
            {
              $push: {
                moves: {
                  $each: parsedMoves,
                },
              },
            },
            { new: true }
          );
          totalMovesProcessedForGame += parsedMoves.length;
        }
      }

      // Cleanup logic for completed games
      // `game.status` here reflects the status in MongoDB *when the worker fetched it*.
      // We also check `currentQueueLength` to be sure Redis is empty.
      if (game.status !== 'playing') { // Only consider cleanup if MongoDB already says the game has ended
          const currentQueueLength = await redisClient.lLen(redisQueueKey);
          if (currentQueueLength === 0) {
            await redisClient.del(
              redisQueueKey,
              redisCurrentFenKey,
              redisInitialStateKey,
              redisStatusKey
            );
            // After cleaning Redis, mark as 'completed' in MongoDB to prevent re-processing
            await GameModel.findByIdAndUpdate(mongoGameId, { status: 'completed' });
            console.log(`[Worker] Cleaned up Redis keys for game ${nanoidGameId} and marked as 'completed' in MongoDB.`);
          } else {
              console.log(`[Worker] Game ${nanoidGameId} ended but Redis queue still has ${currentQueueLength} moves. Will re-attempt cleanup.`);
          }
      }
    }
  } catch (error) {
    console.error('[Worker] Error processing game moves:', error);
  } finally {
    // Schedule the next run of the worker
    setTimeout(processGameMoves, PROCESSING_INTERVAL_MS);
  }
}

export async function startMovePersistenceWorker() {
  await connectDB(); // Ensure MongoDB is connected for the worker
  console.log('Move persistence worker started.');
  processGameMoves(); // Start the first processing cycle
}