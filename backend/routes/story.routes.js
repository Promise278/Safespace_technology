const express = require("express");
const {
  share_story,
  seeAllStories,
  updateStories,
  deleteStories,
  getUserStories,
} = require("../controller/story.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { writeLimiter, readLimiter } = require("../middleware/rateLimiter");
const { Storys, Supports } = require("../models");
const router = express.Router();

// Reads — generous limit (100/min)
router.get("/seeAllstories", authMiddleware, readLimiter, seeAllStories);
router.get("/user/:userId", authMiddleware, readLimiter, getUserStories);

// Writes — stricter limit (20/min) to prevent spam
router.post("/createstories", authMiddleware, writeLimiter, share_story);
router.put("/updatestory/:id", authMiddleware, writeLimiter, updateStories);
router.delete(
  "/deletestories/:id",
  authMiddleware,
  writeLimiter,
  deleteStories,
);

module.exports = router;
