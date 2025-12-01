// Simple in-memory rate limiter middleware for review submissions
// Not suitable for multi-instance production but ok for initial protection

const limits = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 6; // allow 6 requests per window per key

function keyFromReq(req) {
  // Use IP and (if provided) user_email to distinguish
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  const email = (req.body && req.body.user_email) || (req.body && req.body.user_name) || '';
  return `${ip}:${email}`;
}

module.exports = function rateLimit(req, res, next) {
  try {
    const key = keyFromReq(req);
    const now = Date.now();
    const entry = limits.get(key) || { count: 0, firstAt: now };
    if (now - entry.firstAt > WINDOW_MS) {
      entry.count = 0;
      entry.firstAt = now;
    }
    entry.count += 1;
    limits.set(key, entry);
    if (entry.count > MAX_REQUESTS) {
      return res.status(429).json({ error: 'Too many requests, please wait a moment.' });
    }
    next();
  } catch (err) {
    next();
  }
};