const express = require("express");
const {
  register,
  login,
  getSupporters,
} = require("../controller/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimiter");
const router = express.Router();

// Strict brute-force protection on auth endpoints
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/seesupporters", authMiddleware, getSupporters);

module.exports = router;
