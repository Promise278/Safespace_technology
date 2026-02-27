const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const { writeLimiter, readLimiter } = require("../middleware/rateLimiter");
const {
  sendMessage,
  getConversationMessages,
  startConversation,
  getUserConversations,
  markMessagesAsRead,
  acceptConversation,
  rejectConversation,
} = require("../controller/messsage.controller");

const router = express.Router();

// Conversation routes
router.post("/conversations", authMiddleware, writeLimiter, startConversation);
router.get("/conversations", authMiddleware, readLimiter, getUserConversations);
router.put(
  "/read/:conversationId",
  authMiddleware,
  writeLimiter,
  markMessagesAsRead,
);
router.put(
  "/conversations/:id/accept",
  authMiddleware,
  writeLimiter,
  acceptConversation,
);
router.put(
  "/conversations/:id/reject",
  authMiddleware,
  writeLimiter,
  rejectConversation,
);

// Message routes
router.post("/send", authMiddleware, writeLimiter, sendMessage);
router.get(
  "/:conversationId",
  authMiddleware,
  readLimiter,
  getConversationMessages,
);

module.exports = router;
