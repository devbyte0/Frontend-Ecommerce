import React, { useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';

const customers = [
  {
    id: 1,
    name: 'John Doe',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    isActive: true,
  },
  {
    id: 2,
    name: 'Jane Smith',
    profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    isActive: false,
  },
  // Add more customers as needed
];

// Add love emoji to the emoji list
const emojis = ['😂', '😍', '😢', '👍', '❤️'];

const MessagePage = () => {
  const { id } = useParams();
  const customer = customers.find(c => c.id === parseInt(id));

  const [messages, setMessages] = useState([
    { sender: 'customer', text: 'Hello!', timestamp: new Date().toLocaleTimeString(), reaction: '' },
    { sender: 'me', text: 'Hi there!', timestamp: new Date().toLocaleTimeString(), reaction: '' },
  ]);

  const [input, setInput] = useState('');
  const [editIndex, setEditIndex] = useState(-1);

  const handleSend = () => {
    if (input.trim() === '') return;

    const newMessage = {
      sender: 'me',
      text: input,
      timestamp: new Date().toLocaleTimeString(),
      reaction: '',
    };

    if (editIndex !== -1) {
      const updatedMessages = messages.map((msg, index) =>
        index === editIndex ? { ...msg, text: input } : msg
      );
      setMessages(updatedMessages);
      setEditIndex(-1);
    } else {
      setMessages([...messages, newMessage]);
    }

    setInput('');
  };

  const handleEdit = (index) => {
    setInput(messages[index].text);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedMessages = messages.filter((_, msgIndex) => msgIndex !== index);
    setMessages(updatedMessages);
  };

  // Toggle reactions for a message, only one reaction is allowed
  const toggleReaction = (messageIndex, emoji) => {
    setMessages(prevMessages =>
      prevMessages.map((msg, index) =>
        index === messageIndex
          ? { ...msg, reaction: msg.reaction === emoji ? '' : emoji } // Toggle reaction or remove it
          : msg
      )
    );
  };

  const addEmoji = (emoji) => {
    setInput(prevInput => prevInput + emoji);
  };

  return (
    <div className="flex flex-col p-4 sm:ml-64">
      <div className="p-4 border-2 border-gray-200 border-dashed lg:h-[855px] md:h-[750px] sm:h-[500px] rounded-lg dark:border-gray-700 mt-14">
        <div className="flex items-center border-b pb-4 mb-4">
          <NavLink to="../inbox" className="mr-4 text-blue-500">&larr; Back</NavLink>
          <div className="flex items-center">
            <img
              src={customer.profileImage}
              alt={customer.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-3">
              <h3 className="text-lg font-semibold">{customer.name}</h3>
              <span className={`text-sm ${customer.isActive ? 'text-green-500' : 'text-gray-500'}`}>
                {customer.isActive ? 'Active' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto bg-gray-50 sm:h-[400px] lg:h-[670px] md:h-[550px] p-2 rounded-lg mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="relative group">
                <div
                  className={`max-w-xs  px-4 py-2 rounded-lg relative ${
                    msg.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'
                  }`}
                >
                  <text>{msg.text}</text>
                  <div className="text-xs text-gray-400 mt-1">{msg.timestamp}</div>

                  {/* Reactions display */}
                  {msg.reaction && (
                    <div className={`mt-1 text-sm flex absolute ${
                    msg.sender === 'me' ? '-left-[15px] -bottom-[10px]' : '-right-[15px] -bottom-[10px]'
                  }`}>
                      <span className="mr-1">{msg.reaction}</span>
                    </div>
                  )}
                </div>

                {/* Reaction box (shown on hover) */}
                <div
                  className={`absolute mb-8 hidden group-hover:flex bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-10 ${
                    msg.sender === 'me' ? 'right-0' : 'left-0'
                  }`}
                >
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      className="text-xl mr-1"
                      onClick={() => toggleReaction(index, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit and Delete buttons */}
              {msg.sender === 'me' && (
                <div className="flex space-x-1 ml-2 items-center ">
                  <button onClick={() => handleEdit(index)} className="text-xs text-blue-500 ">Edit</button>
                  <button onClick={() => handleDelete(index)} className="text-xs text-red-500">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>

       

        <div className="flex items-center mt-4">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button
            className="ml-2 bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
