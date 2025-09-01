import { createClient } from 'redis';

const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-10386.c8.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 10386,
  },
});


redisClient.on('error', err => console.log('Redis Client Error', err));

await redisClient.connect();
console.log("Redis connect Sucessfully");

export {redisClient};