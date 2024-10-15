import React from 'react';
import { Link } from 'react-router-dom';

const ChatItem = ({ customer }) => {
  return (
    <Link to={`./${customer.id}`}>
      <div className="flex items-center p-4 hover:bg-gray-100 transition duration-300">
        <div className="relative">
          <img
            src={customer.profileImage}
            alt={customer.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {customer.isActive && (
            <span className="absolute bottom-0 right-0 block h-3 w-3 bg-green-400 rounded-full ring-2 ring-white"></span>
          )}
        </div>
        <div className="ml-4 flex-1 border-b border-gray-200 pb-2">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">{customer.name}</h3>
            <span className="text-sm text-gray-500">2 min ago</span>
          </div>
          <p className="text-sm text-gray-600">{customer.lastMessage}</p>
        </div>
      </div>
    </Link>
  );
};

export default ChatItem;
