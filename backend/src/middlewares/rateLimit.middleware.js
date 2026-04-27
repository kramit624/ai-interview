// Simple per-user rate limiter (in-memory).
// Allows `maxRequests` per `windowMs` milliseconds per authenticated user (req.user.id).
// NOTE: This in-memory store is fine for single-instance development. For production use a shared store (Redis).

const stores = new Map(); // userId => [timestamps]

const rateLimit = ({ maxRequests = 2, windowMs = 60 * 1000 } = {}) => {
  return (req, res, next) => {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const now = Date.now();
      const windowStart = now - windowMs;

      let timestamps = stores.get(userId) || [];

      // prune old timestamps
      timestamps = timestamps.filter((t) => t > windowStart);

      if (timestamps.length >= maxRequests) {
        return res.status(429).json({ message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.` });
      }

      // record current
      timestamps.push(now);
      stores.set(userId, timestamps);

      next();
    } catch (err) {
      // On error, allow through but log
      console.error('Rate limiter error:', err);
      next();
    }
  };
};

module.exports = rateLimit;
