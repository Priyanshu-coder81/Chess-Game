import { createClient } from 'redis';
let redisClient;

const connectRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    console.log("Redis client already connected.");
    return redisClient;
  }

  try {
    redisClient = createClient({
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST, // Use environment variable for host
        port: process.env.REDIS_PORT, // Use environment variable for port
      },
    });

    redisClient.on('error', err => console.log('Redis Client Error', err));

    await redisClient.connect();
    console.log("Redis connected successfully.");
    return redisClient;
  } catch (error) {
    console.error("Redis connection failed:", error);
    process.exit(1); // Exit if Redis connection fails
  }
};

export { connectRedis, redisClient }; 