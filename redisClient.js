import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
  commandTimeout: 2000,
  socket: {
    connectTimeout: 3000,
    reconnectStrategy(retries) {
      if (retries > 10) return new Error("Redis reconnect limit");
      return Math.min(retries * 200, 2000);
    },
  },
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error", err.message);
});

try {
  await redisClient.connect();
} catch (err) {
  console.error("Redis unavailable, continuing without cache:", err.message);
}

export default redisClient;
