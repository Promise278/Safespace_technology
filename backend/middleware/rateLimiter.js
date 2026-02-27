const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

// ─── Helper: standard JSON response for 429 errors ───────────────────────────
const rateLimitHandler = (req, res) => {
  const retryAfter = Math.ceil(res.getHeader("Retry-After") || 60);
  res.status(429).json({
    success: false,
    status: 429,
    message: "Too many requests — please slow down and try again later.",
    retryAfter: `${retryAfter} seconds`,
  });
};

// ─── 1. GLOBAL LIMITER ────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: ipKeyGenerator,
  skip: (req) => req.method === "OPTIONS",
});

// ─── 2. AUTH LIMITER ─────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(res.getHeader("Retry-After") || 900);
    res.status(429).json({
      success: false,
      status: 429,
      message:
        "Too many login/register attempts from this IP. Please wait 15 minutes before trying again.",
      retryAfter: `${retryAfter} seconds`,
    });
  },
  keyGenerator: ipKeyGenerator,
});

// ─── 3. WRITE LIMITER ────────────────────────────────────────────────────────
const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: ipKeyGenerator,
});

// ─── 4. READ LIMITER ─────────────────────────────────────────────────────────
const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: ipKeyGenerator,
});

module.exports = { globalLimiter, authLimiter, writeLimiter, readLimiter };
