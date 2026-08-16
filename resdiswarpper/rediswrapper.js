import redisClient from "../redisClient.js";

export const getCache = async (key) => {
  try {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis GET error:", err.message);
    return null;
  }
};

export const setCache = async (key, ttl, value) => {
  try {
    if (!redisClient.isOpen || value == null) return;
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error("Redis SET error:", err.message);
  }
};

export const delCache = async (key) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.del(key);
  } catch (err) {
    console.error("Redis DEL error:", err.message);
  }
};

export const delCachePattern = async (pattern) => {
  try {
    if (!redisClient.isOpen) return;
    const batch = [];
    for await (const key of redisClient.scanIterator({
      MATCH: pattern,
      COUNT: 100,
    })) {
      batch.push(key);
      if (batch.length === 100) {
        await redisClient.del(batch);
        batch.length = 0;
      }
    }
    if (batch.length > 0) {
      await redisClient.del(batch);
    }
  } catch (err) {
    console.error("Redis DEL pattern error:", err.message);
  }
};
