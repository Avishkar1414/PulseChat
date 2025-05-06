import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { dirname as getDirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = getDirname(__filename);

// Import routes and models
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import Chat from "./models/Chat.js";
import User from "./models/User.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

// ✅ Allow both local and deployed frontend
const allowedOrigins = [
  "http://localhost:3000",
  "https://pulse-chat-eta.vercel.app",
];

// Apply CORS globally
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Database connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔗 User connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    try {
      const newMessage = new Chat({
        sender: data.sender,
        receiver: data.receiver,
        text: data.text,
      });
      await newMessage.save();

      io.emit("receiveMessage", {
        sender: data.sender,
        receiver: data.receiver,
        text: data.text,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("❌ Error saving message:", error);
    }
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
