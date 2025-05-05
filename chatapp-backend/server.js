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
// Import routes and models (Make sure they also use `export default`)
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import Chat from "./models/Chat.js";
import User from "./models/User.js";
const onlineUsers = new Map();
dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:3000", // Update if needed
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Database connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// API Routes

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("🔗 User connected:", socket.id);

  // Handle message sending
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
        timestamp: new Date(), // Ensuring single timestamp format
      });
    } catch (error) {
      console.error("❌ Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data); // Send to other clients
  });
});


app.use(
  cors({
    origin: "http://localhost:3000", // Allow frontend to access backend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies & authentication headers
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
// app.use("/uploads", express.static("uploads"));
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
