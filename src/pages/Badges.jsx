import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BadgeManagement = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [editingBadge, setEditingBadge] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/badges`);
      setBadges(response.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
    setLoading(false);
  };

  const handleAddBadge = async () => {
    try {
      const newBadge = { name, color };
      const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/badges`, newBadge);
      setBadges([...badges, response.data]);
      setName('');
      setColor('');
    } catch (error) {
      console.error('Error adding badge:', error);
    }
  };

  const handleUpdateBadge = async () => {
    try {
      const updatedBadge = { name, color };
      const response = await axios.put(`${import.meta.env.VITE_API_URI}/api/badges/${editingBadge._id}`, updatedBadge);
      setBadges(badges.map(badge => (badge._id === editingBadge._id ? response.data : badge)));
      setName('');
      setColor('');
      setEditingBadge(null);
    } catch (error) {
      console.error('Error updating badge:', error);
    }
  };

  const handleDeleteBadge = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URI}/api/badges/${id}`);
      setBadges(badges.filter(badge => badge._id !== id));
    } catch (error) {
      console.error('Error deleting badge:', error);
    }
  };

  const startEditing = (badge) => {
    setName(badge.name);
    setColor(badge.color);
    setEditingBadge(badge);
  };

  const filteredBadges = badges.filter((badge) => {
    const query = searchQuery.toLowerCase();
    return (
      badge.name.toLowerCase().includes(query) || badge.color.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-20 sm:ml-64">
      <div className="w-full max-w-5xl mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)} // Navigate back to the previous page
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-2xl font-bold">Badge Management</h1>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search badges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 bg-white rounded px-4 py-2 mr-2"
          />
          <FaSearch />
        </div>
      </div>

      <div className="w-full max-w-5xl bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add / Edit Badge</h2>
        <div className="mb-4 flex items-center">
          <input
            type="text"
            placeholder="Badge Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 bg-white rounded px-4 py-2 mr-2"
            required
          />
          <input
            type="text"
            placeholder="Badge Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="border border-gray-300 bg-white rounded px-4 py-2 mr-2"
            required
          />
          {editingBadge ? (
            <button
              onClick={handleUpdateBadge}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Update Badge
            </button>
          ) : (
            <button
              onClick={handleAddBadge}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Add Badge
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Badges List</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Color</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBadges.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4">No badges found.</td>
                  </tr>
                ) : (
                  filteredBadges.map((badge) => (
                    <tr key={badge._id} className="text-center">
                      <td className="py-2 px-4 border-b">{badge.name}</td>
                      <td className="py-2 px-4 border-b flex items-center justify-center space-x-2">
                        <div
                          className="inline-block w-6 h-6 rounded-full"
                          style={{ backgroundColor: badge.color }}
                        />
                        <span>{badge.color}</span> {/* Displaying the hex color string */}
                      </td>
                      <td className="py-2 px-4 border-b flex justify-center space-x-2">
                        <button
                          onClick={() => startEditing(badge)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteBadge(badge._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeManagement;
