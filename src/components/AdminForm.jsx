// src/components/AdminForm.jsx
import React, { useState, useEffect } from 'react';

const AdminForm = ({ onSubmit, currentAdmin, onCancel }) => {
  const [admin, setAdmin] = useState({
    name: '',
    email: '',
    role: 'Admin',
  });

  useEffect(() => {
    if (currentAdmin) {
      setAdmin(currentAdmin);
    } else {
      setAdmin({
        name: '',
        email: '',
        role: 'Admin',
      });
    }
  }, [currentAdmin]);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (admin.name && admin.email) {
      onSubmit(admin);
      setAdmin({
        name: '',
        email: '',
        role: 'Admin',
      });
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        {currentAdmin ? 'Edit Admin' : 'Add Admin'}
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={admin.name}
            onChange={handleChange}
            className="block w-full p-2.5 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="John Doe"
            required
          />
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={admin.email}
            onChange={handleChange}
            className="block w-full p-2.5 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="john.doe@example.com"
            required
          />
        </div>

        {/* Role Field */}
        <div className="mb-4">
          <label
            htmlFor="role"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            value={admin.role}
            onChange={handleChange}
            className="block w-full p-2.5 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="Admin">Admin</option>
            {/* Add more roles as needed */}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
          >
            {currentAdmin ? 'Update' : 'Add'}
          </button>
          {currentAdmin && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminForm;
