import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const emojis = ['❤️', '😊', '👍', '😂', '😢'];

const ChatDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        text: inputMessage,
        sender: 'customer',
        timestamp: new Date().toLocaleTimeString(),
        reaction: '',
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage('');

      // Simulate a response from the support team
      setTimeout(() => {
        const supportMessage = {
          text: 'Thank you for your message!',
          sender: 'support',
          timestamp: new Date().toLocaleTimeString(),
          reaction: '',
          account: 'Barvella',
        };
        setMessages((prevMessages) => [...prevMessages, supportMessage]);
      }, 1000);
    } else {
      toast.error('Please enter a message', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const toggleReaction = (index, emoji) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg, idx) =>
        idx === index ? { ...msg, reaction: msg.reaction === emoji ? '' : emoji } : msg
      )
    );
  };

  return (
    <div>
      <ToastContainer />
      <button
        onClick={toggleChat}
        className="fixed bottom-20 right-5 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition"
      >
        Chat
      </button>
      {isOpen && (
        <div className="fixed bottom-20 right-0 bg-white border-l shadow-lg w-full  sm:w-80 h-[60%] sm:h-96 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-bold text-lg">Customer Support - Barvella</h3>
            <button onClick={closeChat} className="text-gray-500 hover:text-gray-800">
              ✖
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 && <p>No messages yet.</p>}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`my-2 p-2 rounded ${msg.sender === 'customer' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}
              >
                {msg.text}
                <div className="text-xs text-gray-500">{msg.timestamp}</div>
                {msg.reaction && <div className="mt-1 text-sm">{msg.reaction}</div>}
                {msg.sender !== 'customer' && <div className="text-xs text-gray-500">From: {msg.account}</div>}
              </div>
            ))}
          </div>
          <div className="flex p-2 border-t">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-blue-500 text-white rounded px-4 hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDrawer;
