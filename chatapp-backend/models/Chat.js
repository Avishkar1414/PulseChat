import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }, // Use single timestamp
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
