import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext"; // Adjust the path to your context file
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

const UserProfile = () => {
  const { user, authRequest, updateProfile } = useContext(UserContext); // Assumes UserContext provides these
  const [formData, setFormData] = useState(user || {});
  const [isEditing, setIsEditing] = useState({});
  const [loading, setLoading] = useState(false);

  const toggleEditing = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = async (field) => {
    setLoading(true);
    try {
      const updatedUser = await authRequest(`/api/users/${user._id}`, {
        method: "PUT",
        data: { [field]: formData[field] },
      });
      updateProfile(updatedUser);
      setIsEditing((prev) => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error("Failed to update user profile:", error);
      alert("Could not save changes. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-700">My Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-600">Personal Information</h2>
        <div className="space-y-4">
          {["firstName", "lastName", "email", "userName"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-600 capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              {isEditing[field] ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    className="ml-3 text-green-600 hover:text-green-800"
                    onClick={() => saveChanges(field)}
                    disabled={loading}
                  >
                    <FaSave />
                  </button>
                  <button
                    className="ml-2 text-red-600 hover:text-red-800"
                    onClick={() => toggleEditing(field)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span>{formData[field]}</span>
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => toggleEditing(field)}
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Address Section */}
        <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-600">Address</h2>
        <div className="space-y-4">
          {["street", "city", "state", "zipCode", "country"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-600 capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              {isEditing[field] ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    name={`address.${field}`}
                    value={formData.address?.[field] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, [field]: e.target.value },
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    className="ml-3 text-green-600 hover:text-green-800"
                    onClick={() => saveChanges("address")}
                    disabled={loading}
                  >
                    <FaSave />
                  </button>
                  <button
                    className="ml-2 text-red-600 hover:text-red-800"
                    onClick={() => toggleEditing(field)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span>{formData.address?.[field] || "N/A"}</span>
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => toggleEditing(field)}
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Payment Method Section */}
        <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-600">Payment Method</h2>
        <div className="space-y-4">
          {["cardNumber", "expiryDate", "cardHolderName"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-600 capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              {isEditing[field] ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    name={`paymentMethod.${field}`}
                    value={formData.paymentMethod?.[field] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: { ...prev.paymentMethod, [field]: e.target.value },
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    className="ml-3 text-green-600 hover:text-green-800"
                    onClick={() => saveChanges("paymentMethod")}
                    disabled={loading}
                  >
                    <FaSave />
                  </button>
                  <button
                    className="ml-2 text-red-600 hover:text-red-800"
                    onClick={() => toggleEditing(field)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span>{formData.paymentMethod?.[field] || "N/A"}</span>
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => toggleEditing(field)}
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
