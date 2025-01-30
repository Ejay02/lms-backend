const redis = require("../config/redis");

const cache = (duration) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redis.get(key);

      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // Store original send
      const originalSend = res.json;

      // Override res.json method
      res.json = function (body) {
        // Store the response in cache
        redis.setex(key, duration, JSON.stringify(body));

        // Call original json method
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      console.error("Cache error:", error);
      next();
    }
  };
};

// Cache invalidation utility
const invalidateCache = async (patterns) => {
  try {
    const keys = await redis.keys(patterns);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
};

module.exports = { cache, invalidateCache };
