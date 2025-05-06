import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

// Get the userId from localStorage
const userId = localStorage.getItem("userId");

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  query: {
    userId: userId || "anonymous",
  },
});

// ✅ Call this once after socket connects
export const connectSocket = () => {
  socket.on("connect", () => {
    console.log("✅ Connected to socket server:", socket.id);
    
    // Register user on the server with join
    if (userId) {
      socket.emit("join", userId);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from socket server");
  });

  // Typing status
  socket.on("userTyping", ({ sender }) => {
    console.log(`${sender} is typing...`);
  });

  socket.on("userStoppedTyping", ({ sender }) => {
    console.log(`${sender} stopped typing.`);
  });

  // Unread message notification
  socket.on("unreadMessages", ({ count, sender }) => {
    console.log(`You have ${count} unread messages from ${sender}`);
  });

  // Incoming call
  socket.on("incomingCall", ({ from, type }) => {
    console.log(`📞 Incoming ${type} call from ${from}`);
  });

  // ✅ New: Listen for received messages
  socket.on("receiveMessage", (message) => {
    console.log("📩 New message received:", message);
    // You can forward this to your UI state or handler
  });
};

// ✅ Emit a message
export const sendMessage = (data) => {
  socket.emit("sendMessage", {
    sender: data.senderId,
    receiver: data.receiverId,
    text: data.text,
  });
};

// ✅ Emit typing status
export const sendTypingStatus = (receiverId) => {
  socket.emit("typing", { senderId: userId, receiverId });
};

// ✅ Emit stop typing
export const stopTypingStatus = (receiverId) => {
  socket.emit("stopTyping", { senderId: userId, receiverId });
};

// ✅ Emit unread message count
export const notifyUnreadMessages = (receiverId, count) => {
  socket.emit("unreadMessages", { senderId: userId, receiverId, count });
};

// ✅ Emit call request
export const startCall = (receiverId, callType) => {
  socket.emit("startCall", { senderId: userId, receiverId, type: callType });
};
