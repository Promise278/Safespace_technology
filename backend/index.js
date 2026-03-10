const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connection = require("./config/connection");
const authRoutes = require("./routes/auth.routes");
const storyRoutes = require("./routes/story.routes");
const messageRoutes = require("./routes/message.routes");
const supportRoutes = require("./routes/support.routes");
const { globalLimiter } = require("./middleware/rateLimiter");

const app = express();
const server = http.createServer(app);

// Import models for socket handlers
const db = require("./models");

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket Auth Middleware
const jwt = require("jsonwebtoken");
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error: No token provided"));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error: Invalid token"));
    socket.user = decoded; // { id, username, roles, ... }
    next();
  });
});

// Make io available globally in controllers
app.set("io", io);

// ─── Middleware ───────────────────────────────────────────────────────────────
// Global rate limiter must be FIRST — baseline defence for every route
app.use(globalLimiter);
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  console.log("Welcome to the homepage");
  res.send("Welcome to our homepage");
});

app.use("/auth", authRoutes);
app.use("/stories", storyRoutes);
app.use("/messages", messageRoutes);
app.use("/supports", supportRoutes);
app.use("/comments", require("./routes/comment.routes"));

// Keep track of connected users: userId -> socket.id
const connectedUsers = new Map();

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User comes online
  socket.on("join", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} is online (${socket.id})`);

    // Broadcast to everyone that this user is online
    io.emit("userOnline", userId);
  });

  // Get initial online status
  socket.on("getOnlineUsers", (userIds) => {
    const onlineStatus = userIds.filter((id) => connectedUsers.has(id));
    socket.emit("onlineUsersList", onlineStatus);
  });

  // Join a conversation room
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave a conversation room
  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.id} left conversation ${conversationId}`);
  });

  // Send message in real-time (persist to DB + broadcast)
  socket.on("sendMessage", async (data) => {
    try {
      const { content, senderUsername } = data;
      // Ensure IDs are strings and not objects
      const conversationId = String(data.conversationId || "");
      const senderId = socket.user?.id ? String(socket.user.id) : null;

      console.log("Socket sendMessage attempt:", {
        conversationId,
        senderId,
        hasContent: !!content,
      });

      if (!conversationId || !senderId || !content) {
        return socket.emit("messageError", {
          error: "Missing required fields",
          details: `Conv: ${!!conversationId}, Sender: ${!!senderId}, Content: ${!!content}`,
        });
      }

      // Check for valid UUID format to prevent Postgres crash
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(conversationId)) {
        return socket.emit("messageError", {
          error: "Invalid ID format",
          details: "The conversation ID is not a valid UUID.",
        });
      }

      // 1. Fetch conversation to verify participants and status
      const conversation = await db.Conversation.findByPk(conversationId);
      if (!conversation) {
        console.error(`Socket: Conversation ${conversationId} not found`);
        return socket.emit("messageError", {
          error: "Conversation not found on server",
        });
      }

      // 2. Authorization Check (Sender must be part of the conversation)
      if (
        String(conversation.senderId) !== String(senderId) &&
        String(conversation.receiverId) !== String(senderId)
      ) {
        return socket.emit("messageError", {
          error: "Unauthorized",
          details: "You are not a participant in this conversation",
        });
      }

      // 3. Status Check (Locked/Rejected conversations)
      if (conversation.status === "rejected") {
        return socket.emit("messageError", {
          error: "Conversation closed",
        });
      }

      // 4. Pending Check (Receiver must accept before replying)
      if (
        conversation.status === "pending" &&
        String(senderId) === String(conversation.receiverId)
      ) {
        return socket.emit("messageError", {
          error: "Accept request",
          details: "You must accept the request before replying",
        });
      }

      // 5. Determine ReceiverId
      const receiverId =
        String(conversation.senderId) === String(senderId)
          ? conversation.receiverId
          : conversation.senderId;

      // 6. DB Persistence
      const message = await db.Message.create({
        conversationId,
        senderId,
        receiverId,
        content: content.trim(),
      });

      // 7. Broadcast to everyone in the room (including sender)
      io.to(conversationId).emit("receiveMessage", {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
        senderUsername: senderUsername || "User",
      });
    } catch (error) {
      console.error("Socket sendMessage CRITICAL error:", error);
      socket.emit("messageError", {
        error: "Failed to send message",
        details: error.message || "Database or connection error",
      });
    }
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.to(data.conversationId).emit("userTyping", {
      userId: data.userId,
      username: data.username,
    });
  });

  socket.on("stopTyping", (data) => {
    socket.to(data.conversationId).emit("userStopTyping", {
      userId: data.userId,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Find the user ID that disconnected
    let disconnectedUserId = null;
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (disconnectedUserId) {
      connectedUsers.delete(disconnectedUserId);
      console.log(`User ${disconnectedUserId} went offline`);
      // Broadcast to everyone that this user is offline
      io.emit("userOffline", disconnectedUserId);
    }
  });
});

// Sync database and start server
const PORT = process.env.PORT || 5000;
connection
  .sync({ force: false, alter: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Database connected and server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
