const { RATE_LIMIT_WINDOW, RATE_LIMIT_MAX } = require('../config');

class RateLimiter {
  constructor() {
    this.rateLimit = new Map();
  }

  checkRateLimit(ip, action) {
    const key = `${ip}:${action}`;
    const now = Date.now();
    if (!this.rateLimit.has(key)) {
      this.rateLimit.set(key, { count: 1, reset: now + RATE_LIMIT_WINDOW });
      return false;
    }
    const data = this.rateLimit.get(key);
    if (now > data.reset) {
      data.count = 1;
      data.reset = now + RATE_LIMIT_WINDOW;
      return false;
    }
    if (data.count >= RATE_LIMIT_MAX) {
      return true; // blocked
    }
    data.count++;
    return false;
  }
}

module.exports = RateLimiter;
