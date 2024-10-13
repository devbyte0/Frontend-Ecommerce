// src/pages/AdminProfile.jsx
import React, { useState } from 'react';
import ProfileCard from '../components/ProfileCard';
import ProfileForm from '../components/ProfileForm';

const AdminProfile = () => {
  const initialAdminData = {
    id: 1,
    username: 'johndoe',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
    Url: 'https://i.pravatar.cc/150?img=3', // Placeholder avatar
  };

  const [adminData, setAdminData] = useState(initialAdminData);
  
  const [isEditing, setIsEditing] = useState(false);

  // Handle form submission to update admin data
  const handleUpdate = (updatedData) => {
    setAdminData(updatedData);
    setIsEditing(false);
  };

  // Handle cancel editing
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="p-4 sm:ml-64 mt-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Profile</h1>
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Profile Display */}
          <div className="lg:w-1/3 mb-8 lg:mb-0">
            <ProfileCard adminData={adminData} onEdit={handleEdit} />
          </div>

          {/* Profile Form */}
          <div className="lg:w-2/3">
            {isEditing ? (
              <ProfileForm
                adminData={adminData}
                onSubmit={handleUpdate}
                onCancel={handleCancel}
              />
            ) : (
              <div className="bg-white shadow-md rounded-lg p-6">
                <p className="text-gray-700">Click "Edit Profile" to update your information.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
