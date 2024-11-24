// src/pages/ProductAdminPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const ProductAdminPage = () => {
  const menuItems = [
    { name: 'Products', icon: '🛍️' },
    { name: 'Categories', icon: '📦' },
    { name: 'Colors', icon: '🎨' },
    { name: 'Sizes', icon: '📏' },
    { name: 'Gender', icon: '👤' },
    { name: 'Badges', icon: '🏷️' },
    { name: 'Coupons', icon: '💸' },
    { name: 'Slides', icon: '🖼️' },       // New Menu Item
    { name: 'Related', icon: '🔗' },      // New Menu Item
    { name: 'Top Rated', icon: '⭐' },     // New Menu Item
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 sm:ml-64">
      <h1 className="text-3xl sm:text-4xl font-bold my-8 text-center">Choose one</h1>

      {/* Square-shaped menu styled as a box */}
      <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mb-8 w-full max-w-5xl">
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-2">
          {menuItems.map((item) => (
            <div
              key={item.name}
              className="flex flex-col justify-center items-center bg-white border-2 border-gray-200 rounded-lg p-6 shadow-md hover:bg-gray-50 cursor-pointer transition-all duration-200"
            >
              <Link to={`./${item.name.toLowerCase().replace(' ', '-')}`}>
                <span className="text-3xl mb-2">{item.icon}</span>
                <span className="text-lg sm:text-xl text-center">{item.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductAdminPage;
