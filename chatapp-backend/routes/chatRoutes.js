import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// Send a message
router.post("/sendMessage", async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    const newMessage = new Message({
      sender,
      receiver,
      text,
      timestamp: new Date(),
      seen: false,
    });

    await newMessage.save();

    res.status(201).json({ success: true, message: "Message stored successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all messages between two users
router.get("/messages/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark all messages as seen from sender to receiver
router.post("/markAsSeen", async (req, res) => {
  const { sender, receiver } = req.body;

  if (!sender || !receiver) {
    return res.status(400).json({ message: "Sender and receiver are required" });
  }

  try {
    const result = await Message.updateMany(
      { sender, receiver, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({ message: "Messages marked as seen", result });
  } catch (error) {
    console.error("Error marking messages as seen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
  