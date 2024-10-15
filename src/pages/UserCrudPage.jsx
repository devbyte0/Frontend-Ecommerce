import React, { useState } from 'react';
import UserList from '../components/UserList';

const UserCrudPage = () => {
  const [users, setUsers] = useState([
    // Initial dummy data
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      role: 'User',
    },
    {
      id: 2,
      name: 'Bob Brown',
      email: 'bob.brown@example.com',
      role: 'Moderator',
    },
  ]);

  const [currentUser, setCurrentUser] = useState(null); // For editing users
  const [userToDelete, setUserToDelete] = useState(null); // For deleting users

  // Add new user
  const addUser = (user) => {
    const newUser = {
      ...user,
      id: Date.now(), // Generate a unique ID
    };
    setUsers([...users, newUser]);
  };

  // Update existing user
  const updateUser = (updatedUser) => {
    setUsers(
      users.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    setCurrentUser(null);
  };

  // Delete user
  const confirmDeleteUser = () => {
    setUsers(users.filter((user) => user.id !== userToDelete.id));
    setUserToDelete(null);
  };

  // Handle edit action
  const editUser = (user) => {
    setCurrentUser(user);
  };

  // Handle delete action (opens the delete confirmation)
  const deleteUser = (user) => {
    setUserToDelete(user);
  };

  // Handle cancel delete
  const cancelDelete = () => {
    setUserToDelete(null);
  };

  // Handle cancel edit
  const cancelEdit = () => {
    setCurrentUser(null);
  };

  return (
    <div className="p-4 sm:ml-64 mt-16">
      <div className="p-4 max-w-3xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:space-x-4">
          {/* User List */}
          <div className="flex-1 mb-4 lg:mb-0">
            <UserList users={users} onEdit={editUser} onDelete={deleteUser} />
          </div>
        </div>

        {/* Delete Confirmation */}
        {userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4">Delete User</h2>
              <p>Are you sure you want to delete the user <strong>{userToDelete.name}</strong>?</p>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCrudPage;
