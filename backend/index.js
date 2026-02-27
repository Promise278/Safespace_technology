// const express = require('express')
// const app = express();
// const cors = require('cors')
// const authRoutes = require("./routes/auth.routes")
// const storyRoutes =require("./routes/story.routes");
// const connection = require('./config/connection');

// app.use(express.json())
// app.use(cors());
// const PORT = process.env.PORT;

// app.get('/',(req, res) => {
//     console.log("Welcome to the page")
//     res.send("Welcome to our homepage")
// })

// app.use('/auth', authRoutes)
// app.use('/stories', storyRoutes)

// connection.sync({ alter: true }).then(async() => {
//     app.listen(PORT, () => {
//         console.log(`Database Connected Successfully and Server running on port ${PORT}`)
//     })
// }).catch((e) => {
//     console.log(`Database connection failed ${e}`)
// });
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
    origin: "*", // Change this to your frontend domain in production
    methods: ["GET", "POST"],
  },
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
      const { conversationId, senderId, content, senderUsername } = data;

      // Persist to database
      const message = await db.Message.create({
        conversationId,
        senderId,
        content,
      });

      // Broadcast to the conversation room
      io.to(conversationId).emit("receiveMessage", {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
        senderUsername: senderUsername || "Unknown",
      });
    } catch (error) {
      console.error("Socket sendMessage error:", error);
      socket.emit("messageError", { error: "Failed to send message" });
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
