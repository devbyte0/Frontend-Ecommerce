"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatItem from "../components/ChatItem";
import { BiSearch } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const ChatList = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminRefreshToken");
        const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch chats");
        if (err.response?.status === 401) navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [navigate]);

  // Setup Socket.IO
  useEffect(() => {
    const token = localStorage.getItem("adminRefreshToken");
    if (!token) return;

    const socketClient = io(import.meta.env.VITE_API_URI, {
      auth: { token },
    });

    socketClient.on("connect", () => {
      console.log("Connected to socket server as admin");
      socketClient.emit("joinAdminRoom");
    });

    // Listen for new chat rooms
    socketClient.on("newChatRoom", (room) => {
      setRooms((prevRooms) => [room, ...prevRooms]);
    });

    // Listen for updates to messages in rooms
    socketClient.on("messageReceived", ({ roomId, message }) => {
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r._id === roomId
            ? { ...r, messages: [...r.messages, message] }
            : r
        )
      );
    });

    setSocket(socketClient);

    return () => {
      socketClient.disconnect();
    };
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoomClick = (roomId) => navigate(`/admin/chat/${roomId}`);

  return (
    <div className="flex flex-col p-4 sm:ml-64 min-h-screen">
      <div className="flex-1 p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-2xl font-bold mb-2 sm:mb-0">Customer Chats</h2>
          <div className="relative w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Search customers..."
              className="border border-gray-300 rounded-full pl-10 pr-4 py-2 bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && <p className="text-gray-500 text-center mt-4">Loading chats...</p>}
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          {!loading && !error && filteredRooms.length === 0 && (
            <p className="text-gray-500 text-center mt-4">No chats found</p>
          )}
          {!loading &&
            !error &&
            filteredRooms.map((room) => (
              <ChatItem
                key={room._id}
                customer={room.customerId}
                lastMessage={room.messages?.[room.messages.length - 1]}
                isActive={!!room.assignedAdmin?._id}
                onClick={() => handleRoomClick(room._id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
