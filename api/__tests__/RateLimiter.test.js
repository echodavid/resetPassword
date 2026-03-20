const RateLimiter = require('../services/RateLimiter');

describe('RateLimiter', () => {
  let rateLimiter;
  let originalNow;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
    originalNow = Date.now;
  });

  afterEach(() => {
    Date.now = originalNow;
  });

  test('should allow requests within limit', () => {
    expect(rateLimiter.checkRateLimit('127.0.0.1', 'login')).toBe(false);
    expect(rateLimiter.checkRateLimit('127.0.0.1', 'login')).toBe(false);
  });

  test('should block requests over limit', () => {
    for (let i = 0; i < 5; i++) {
      rateLimiter.checkRateLimit('127.0.0.1', 'login');
    }
    expect(rateLimiter.checkRateLimit('127.0.0.1', 'login')).toBe(true);
  });

  test('should reset after window', () => {
    const now = Date.now();
    Date.now = jest.fn(() => now);
    for (let i = 0; i < 5; i++) {
      rateLimiter.checkRateLimit('127.0.0.1', 'login');
    }
    expect(rateLimiter.checkRateLimit('127.0.0.1', 'login')).toBe(true);
    // Advance time past window
    Date.now = jest.fn(() => now + 3600001);
    expect(rateLimiter.checkRateLimit('127.0.0.1', 'login')).toBe(false);
  });
});
