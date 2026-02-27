const express = require("express");
const { addComment, getComments } = require("../controller/comment.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { writeLimiter, readLimiter } = require("../middleware/rateLimiter");
const router = express.Router();

router.post("/:storyId", authMiddleware, writeLimiter, addComment);
router.get("/:storyId", authMiddleware, readLimiter, getComments);

module.exports = router;
