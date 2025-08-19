"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const AdminMessagePage = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!roomId || !token) {
      navigate("/admin/login");
      return;
    }

    // Fetch chat room data
    const fetchRoom = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URI}/api/admin/chat/rooms/${roomId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setActiveRoom(res.data);
        setMessages(res.data.messages || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load chat room");
      }
    };
    fetchRoom();

    // Initialize Socket.IO
    const socket = io(import.meta.env.VITE_API_URI, {
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("joinRoom", { roomId });
    });

    socket.on("messageReceived", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("roomTransferred", (room) => {
      setActiveRoom(room);
    });

    socket.on("roomClosed", () => {
      setActiveRoom((prev) => ({ ...prev, isClosed: true }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [roomId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || activeRoom?.isClosed) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URI}/api/chat/rooms/${roomId}/message`,
        { text: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data]);
      socketRef.current?.emit("sendMessage", { roomId, message: res.data });
      setInput("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    }
  };

  const transferRoom = async () => {
    const newAdminId = prompt("Enter new admin ID:");
    if (!newAdminId) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URI}/api/chat/rooms/${roomId}/transfer`,
        { newAdminId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveRoom(res.data);
      socketRef.current?.emit("roomTransferred", res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to transfer room");
    }
  };

  const closeRoom = async () => {
    if (!confirm("Are you sure you want to close this chat?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${import.meta.env.VITE_API_URI}/api/chat/rooms/${roomId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveRoom((prev) => ({ ...prev, isClosed: true }));
      socketRef.current?.emit("roomClosed", { roomId });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to close room");
    }
  };

  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!activeRoom) return <p className="p-4">Loading chat...</p>;

  return (
    <div className="container mx-auto p-4 flex flex-col">
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
        <div className="p-4 flex justify-between items-center bg-gray-800 text-white">
          <h2>{activeRoom.customerId?.name || "Customer"}</h2>
          <div className="flex space-x-2">
            <button
              onClick={transferRoom}
              disabled={activeRoom.isClosed}
              className="px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-600"
            >
              Transfer
            </button>
            <button
              onClick={closeRoom}
              disabled={activeRoom.isClosed}
              className="px-3 py-1 bg-red-500 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 h-96 overflow-y-auto p-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 ${msg.senderType === "admin" ? "text-right" : "text-left"}`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg max-w-xs ${
                  msg.senderType === "admin" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
                <div className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={activeRoom.isClosed}
            placeholder="Type a message..."
            className={`flex-1 border rounded-l-lg px-4 py-2 focus:outline-none ${
              !activeRoom.isClosed ? "focus:ring-1 focus:ring-blue-500" : "cursor-not-allowed"
            }`}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || activeRoom.isClosed}
            className={`px-4 py-2 rounded-r-lg ${
              !activeRoom.isClosed && input.trim()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminMessagePage;
