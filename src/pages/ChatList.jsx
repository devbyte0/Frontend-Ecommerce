import React, { useState } from 'react';
import ChatItem from '../components/ChatItem';
import { BiSearch } from 'react-icons/bi';

const customers = [
  {
    id: 1,
    name: 'John Doe',
    lastMessage: 'Hey, how are you?',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    isActive: true,
  },
  {
    id: 2,
    name: 'Jane Smith',
    lastMessage: "Let's catch up tomorrow.",
    profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    isActive: false,
  },
  // Add more customers as needed
];

const ChatList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter customers based on the search term
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col p-4 sm:ml-64 min-h-screen">
      <div className="flex-1 p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-2xl font-bold mb-2 sm:mb-0">Chats</h2>
          <div className="relative w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-full pl-10 pr-4 py-2 bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Scrollable chat list */}
        <div className="flex-1 overflow-y-auto">
          {filteredCustomers.map(customer => (
            <ChatItem key={customer.id} customer={customer} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
