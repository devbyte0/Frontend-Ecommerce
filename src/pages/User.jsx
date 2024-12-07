import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext"; // Adjust the path to your context file
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

const UserProfile = () => {
  const { user, authRequest, updateProfile } = useContext(UserContext);
  const [formData, setFormData] = useState(user || {});
  const [isEditing, setIsEditing] = useState({});
  const [loading, setLoading] = useState(false);

  // Toggle the editing mode for a field
  const toggleEditing = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    setFormData((prev) => {
      if (keys.length === 1) {
        return { ...prev, [name]: value };
      } else {
        const [outerKey, innerKey] = keys;
        return {
          ...prev,
          [outerKey]: {
            ...prev[outerKey],
            [innerKey]: value,
          },
        };
      }
    });
  };

  // Save changes to a specific field
  const saveChanges = async (field) => {
    setLoading(true);
    try {
      const [outerKey, innerKey] = field.split(".");
      const payload = innerKey
        ? { [outerKey]: formData[outerKey] }
        : { [field]: formData[field] };

      const updatedUser = await authRequest(
        `${import.meta.env.VITE_API_URI}/profile/${user._id}`,
        {
          method: "PUT",
          data: payload,
        }
      );

      updateProfile(updatedUser); // Update user in context
      setIsEditing((prev) => ({ ...prev, [field]: false })); // Disable editing mode
    } catch (error) {
      console.error("Failed to update user profile:", error);
      alert("Could not save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render editable or read-only fields
  const renderField = (field, label, value, nested = false) => (
    <div key={field}>
      <label className="block text-sm font-medium text-gray-600 capitalize">
        {label}
      </label>
      {isEditing[field] ? (
        <div className="flex items-center">
          <input
            type="text"
            name={nested ? field : field}
            value={value || ""}
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
          <span>{value || "N/A"}</span>
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => toggleEditing(field)}
          >
            <FaEdit />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-700">My Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-600">
          Personal Information
        </h2>
        <div className="space-y-4">
          {["firstName", "lastName", "email", "userName"].map((field) =>
            renderField(field, field.replace(/([A-Z])/g, " $1"), formData[field])
          )}
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-600">Address</h2>
        <div className="space-y-4">
          {["street", "city", "state", "zipCode", "country"].map((field) =>
            renderField(
              `address.${field}`,
              field.replace(/([A-Z])/g, " $1"),
              formData.address?.[field],
              true
            )
          )}
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-600">
          Payment Method
        </h2>
        <div className="space-y-4">
          {["cardNumber", "expiryDate", "cardHolderName"].map((field) =>
            renderField(
              `paymentMethod.${field}`,
              field.replace(/([A-Z])/g, " $1"),
              formData.paymentMethod?.[field],
              true
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
