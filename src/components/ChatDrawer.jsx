"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../context/UserContext";

const ChatDrawer = () => {
  const { user, authRequest, isLoggedIn, refreshToken } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // --- Helper: Safe request with auto-refresh ---
  const safeRequest = async (url, options = {}) => {
    try {
      return await authRequest(url, options);
    } catch (err) {
      if (err.response?.status === 401) {
        const newToken = await refreshToken();
        if (!newToken) throw err;
        const headers = options.headers || {};
        return await authRequest(url, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        });
      } else {
        throw err;
      }
    }
  };

  // --- WebSocket connection ---
  useEffect(() => {
    if (!isOpen || !user?._id || !isLoggedIn) return;

    const ws = new WebSocket(`${import.meta.env.VITE_API_URI.replace("http", "ws")}`);

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: "user_join", userId: user._id, token: localStorage.getItem("accessToken") }));
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message") setMessages((prev) => [...prev, data.message]);
        if (data.type === "error") setError(data.message);
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setError("Connection closed");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setIsConnected(false);
      setError("Connection error");
    };

    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [isOpen, user?._id, isLoggedIn]);

  // --- Fetch or create chat room ---
  useEffect(() => {
    if (!isOpen || !user?._id || !isLoggedIn) return;

    const fetchRoom = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const room = await safeRequest(`/api/user/rooms/${user._id}`);
        setActiveRoom(room);
        setMessages(room.messages || []);
      } catch (err) {
        console.error("Error fetching/creating chat room:", err);
        setError(err.response?.data?.message || "Failed to load chat");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [isOpen, user?._id, isLoggedIn]);

  // --- Scroll to bottom ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Send message ---
  const handleSend = async () => {
    if (!inputMessage.trim() || !activeRoom?._id || !socket) return;
    try {
      setError(null);
      const response = await safeRequest(`/api/user/rooms/${activeRoom._id}/message`, {
        method: "POST",
        data: { text: inputMessage },
      });

      setMessages((prev) => [...prev, response]);
      socket.send(JSON.stringify({ type: "new_message", message: response, roomId: activeRoom._id }));
      setInputMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || "Failed to send message");
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition"
          aria-label="Open chat"
        >
          {/* Chat Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      ) : (
        <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
          <div className={`p-3 rounded-t-lg flex justify-between items-center ${isConnected ? "bg-blue-600" : "bg-gray-500"} text-white`}>
            <h3 className="font-semibold">{isConnected ? "Customer Support" : error || "Connecting..."}</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200" aria-label="Close chat">✕</button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 mt-10 p-4">
                {error}
                <button onClick={() => window.location.reload()} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Retry</button>
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">Start a conversation with our support team</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={`${msg._id || idx}`} className={`mb-3 ${msg.senderType === "user" ? "text-right" : "text-left"}`}>
                  <div className={`inline-block px-4 py-2 rounded-lg ${msg.senderType === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}>
                    {msg.text}
                    <div className="text-xs mt-1 opacity-70">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t">
            <div className="flex">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className={`flex-1 border rounded-l-lg px-3 py-2 focus:outline-none ${isConnected ? "focus:ring-1 focus:ring-blue-500" : "cursor-not-allowed"}`}
                disabled={!isConnected}
              />
              <button
                onClick={handleSend}
                className={`px-4 py-2 rounded-r-lg transition ${isConnected && inputMessage.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-400 text-white cursor-not-allowed"}`}
                disabled={!inputMessage.trim() || !isConnected}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDrawer;
