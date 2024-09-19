// src/components/AdminCrudPage.jsx
import React, { useState } from 'react';
import AdminList from '../components/AdminList';
import AdminForm from '../components/AdminForm';

const AdminCrudPage = () => {
  const [admins, setAdmins] = useState([
    // Initial dummy data
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Super Admin',
    },
  ]);

  const [currentAdmin, setCurrentAdmin] = useState(null);

  // Add new admin
  const addAdmin = (admin) => {
    const newAdmin = {
      ...admin,
      id: Date.now(), // Simple unique ID
    };
    setAdmins([...admins, newAdmin]);
  };

  // Update existing admin
  const updateAdmin = (updatedAdmin) => {
    setAdmins(
      admins.map((admin) =>
        admin.id === updatedAdmin.id ? updatedAdmin : admin
      )
    );
    setCurrentAdmin(null);
  };

  // Delete admin
  const deleteAdmin = (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      setAdmins(admins.filter((admin) => admin.id !== id));
    }
  };

  // Handle edit action
  const editAdmin = (admin) => {
    setCurrentAdmin(admin);
  };

  // Handle cancel edit
  const cancelEdit = () => {
    setCurrentAdmin(null);
  };

  return (
    <div className="p-4 sm:ml-64 mt-16">
<div className="p-4">
      <div className="flex flex-col lg:flex-row lg:space-x-4">
        {/* Admin List */}
        <div className="flex-1 mb-4 lg:mb-0">
          <AdminList admins={admins} onEdit={editAdmin} onDelete={deleteAdmin} />
        </div>

        {/* Admin Form */}
        <div className="w-full max-w-md">
          <AdminForm
            onSubmit={currentAdmin ? updateAdmin : addAdmin}
            currentAdmin={currentAdmin}
            onCancel={cancelEdit}
          />
        </div>
      </div>
    </div>
    </div>
    
  );
};

export default AdminCrudPage;
