import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]); // Store available products
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [applicableProducts, setApplicableProducts] = useState([]); // Store selected products
  const [editingCoupon, setEditingCoupon] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoupons();
    fetchProducts(); // Fetch available products when the component mounts
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/coupons`);
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/products`); // Assuming this endpoint returns products
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddCoupon = async () => {
    try {
      const newCoupon = { code, discount, expirationDate, applicableProducts };
      const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/coupons`, newCoupon);
      setCoupons([...coupons, response.data]);
      resetForm();
    } catch (error) {
      console.error('Error adding coupon:', error);
    }
  };

  const handleUpdateCoupon = async () => {
    try {
      const updatedCoupon = { code, discount, expirationDate, applicableProducts };
      const response = await axios.put(`${import.meta.env.VITE_API_URI}/api/coupons/${editingCoupon._id}`, updatedCoupon);
      setCoupons(coupons.map(coupon => (coupon._id === editingCoupon._id ? response.data : coupon)));
      resetForm();
    } catch (error) {
      console.error('Error updating coupon:', error);
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URI}/api/coupons/${id}`);
      setCoupons(coupons.filter(coupon => coupon._id !== id));
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const startEditing = (coupon) => {
    setCode(coupon.code);
    setDiscount(coupon.discount);
    setExpirationDate(new Date(coupon.expirationDate).toISOString().split('T')[0]); // Format date to YYYY-MM-DD
    setApplicableProducts(coupon.applicableProducts || []); // Set applicable products
    setEditingCoupon(coupon);
  };

  const resetForm = () => {
    setCode('');
    setDiscount('');
    setExpirationDate('');
    setApplicableProducts([]);
    setEditingCoupon(null);
  };

  const handleProductSelection = (e) => {
    const selectedOptions = [...e.target.selectedOptions].map(option => option.value);
    setApplicableProducts(selectedOptions);
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const query = searchQuery.toLowerCase();
    return (
      coupon.code.toLowerCase().includes(query) || coupon.discount.toString().includes(query)
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
          <h1 className="text-2xl font-bold">Coupon Management</h1>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 bg-white rounded px-4 py-2 mr-2"
          />
          <FaSearch />
        </div>
      </div>
      <div className="w-full max-w-5xl bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add / Edit Coupon</h2>
        <div className="mb-4 flex items-center">
          <input
            type="text"
            placeholder="Coupon Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border border-gray-300 bg-white rounded px-4 py-2 mr-2"
            required
          />
          <input
            type="number"
            placeholder="Discount (%)"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="border border-gray-300 bg-white rounded px-4 py-2 mr-2"
            required
          />
          <input
            type="date"
            placeholder="Expiration Date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="border border-gray-300 bg-white rounded px-4 py-2 mr-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Applicable Products:</label>
          <select
            multiple
            value={applicableProducts}
            onChange={handleProductSelection}
            className="border border-gray-300 bg-white rounded px-4 py-2 w-full"
          >
            {products.map(product => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        {editingCoupon ? (
          <button
            onClick={handleUpdateCoupon}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Update Coupon
          </button>
        ) : (
          <button
            onClick={handleAddCoupon}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Add Coupon
          </button>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Coupons List</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Code</th>
                  <th className="py-2 px-4 border-b">Discount</th>
                  <th className="py-2 px-4 border-b">Expiration Date</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">No coupons found.</td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon._id} className="text-center">
                      <td className="py-2 px-4 border-b">{coupon.code}</td>
                      <td className="py-2 px-4 border-b">{coupon.discount}%</td>
                      <td className="py-2 px-4 border-b">{new Date(coupon.expirationDate).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border-b flex justify-center space-x-2">
                        <button
                          onClick={() => startEditing(coupon)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
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

export default CouponManagement;
