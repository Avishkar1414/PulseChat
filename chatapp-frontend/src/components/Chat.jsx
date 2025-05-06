import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";
import axios from "axios";
import "./Chat.css";
const API_URL = process.env.REACT_APP_API_URL;
const Chat = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const sidebarRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      navigate("/login");
      return;
    }
    setCurrentUserId(storedUserId);
  }, [navigate]);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/users/all/${currentUserId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [currentUserId]);

  const selectUser = (user) => {
    setSelectedUser(user);
    setMessages([]);
    if (window.innerWidth <= 768) {
      sidebarRef.current?.classList.remove("show-sidebar");
    }
  };

  useEffect(() => {
    if (!selectedUser || !currentUserId) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/chat/messages/${currentUserId}/${selectedUser._id}`
        );
        const sortedMessages = response.data.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sortedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedUser, currentUserId]);

  const handleReceiveMessage = useCallback(
    (data) => {
      const isRelevant =
        (data.sender === currentUserId && data.receiver === selectedUser?._id) ||
        (data.sender === selectedUser?._id && data.receiver === currentUserId);

      if (isRelevant) {
        setMessages((prevMessages) => {
          const alreadyExists = prevMessages.some(
            (msg) => msg.timestamp === data.timestamp
          );
          return alreadyExists ? prevMessages : [...prevMessages, data];
        });
      }
    },
    [currentUserId, selectedUser]
  );

  const handleTyping = useCallback(
    ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) {
        setPartnerTyping(true);
        setTimeout(() => setPartnerTyping(false), 2000);
      }
    },
    [selectedUser]
  );

  useEffect(() => {
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("typing", handleTyping);
    };
  }, [handleReceiveMessage, handleTyping]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (message.trim() === "" || !selectedUser) return;

    const messageData = {
      sender: currentUserId,
      receiver: selectedUser._id,
      text: message,
      timestamp: new Date().toISOString(),
    };

    socket.emit("sendMessage", messageData);
    setMessage("");

    try {
      await axios.post("${API_URL}/api/chat/sendMessage", messageData);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleTypingChange = (e) => {
    setMessage(e.target.value);
    if (selectedUser) {
      socket.emit("typing", {
        senderId: currentUserId,
        receiverId: selectedUser._id,
      });
    }
  };

  const toggleSidebar = () => {
    sidebarRef.current.classList.toggle("show-sidebar");
  };

  return (
    <div className="chat-container">
      <div className="hamburger" onClick={toggleSidebar}>
        ☰
      </div>

      <div className="chat-sidebar" ref={sidebarRef}>
        <h3>Chats</h3>
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user._id} className="user-item" onClick={() => selectUser(user)}>
              <strong>{user.name}</strong>
            </div>
          ))
        ) : (
          <p>No users available</p>
        )}
      </div>

      <div className="chat-box">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h3>{selectedUser.name}</h3>
              {partnerTyping && <span className="typing-status">typing...</span>}
            </div>

            <div
              className="chat-messages"
              onClick={() => {
                if (window.innerWidth <= 768) {
                  sidebarRef.current?.classList.remove("show-sidebar");
                }
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender === currentUserId ? "sent" : "received"}`}
                >
                  <p>{msg.text}</p>
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={handleTypingChange}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <h3 className="select-user">Select a user to start chatting</h3>
        )}
      </div>
    </div>
  );
};

export default Chat;
