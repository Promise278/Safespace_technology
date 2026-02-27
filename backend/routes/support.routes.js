const express = require("express");
const {
  toggleSupport,
  getSupportCount,
  checkUserSupport,
  toggleCommentLike,
} = require("../controller/support.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { writeLimiter, readLimiter } = require("../middleware/rateLimiter");
const router = express.Router();

router.post("/:storyId", authMiddleware, writeLimiter, toggleSupport);
router.post(
  "/comment/:commentId",
  authMiddleware,
  writeLimiter,
  toggleCommentLike,
);
router.get("/count/:storyId", authMiddleware, readLimiter, getSupportCount);
router.get("/check/:storyId", authMiddleware, readLimiter, checkUserSupport);

module.exports = router;
