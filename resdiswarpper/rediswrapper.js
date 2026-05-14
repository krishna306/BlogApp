import redisClient from "../redisClient.js";

export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis GET error:", err.message);
    return null; // graceful fallback
  }
};

export const setCache = async (key, ttl, value) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error("Redis SET error:", err.message);
  }
};

export const delCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error("Redis DEL error:", err.message);
  }
};