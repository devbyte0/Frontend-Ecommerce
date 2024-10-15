// src/pages/ProductCRUDPage.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSearch } from 'react-icons/fa'; // Added FaSearch
import { useNavigate } from 'react-router-dom';

const ProductCRUDPage = () => {
  // State variables
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Added search state

  const navigate = useNavigate(); // Initialize useNavigate

  // Function to fetch products from the API
  async function getProducts() {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Optionally, you can set an error state here to display an error message to the user
    }
    setLoading(false);
  }

  // Fetch products on component mount
  useEffect(() => {
    getProducts();
  }, []);

  // Handler for the back button
  const handleBack = () => {
    navigate(-1); // Navigates to the previous page in history
    // Alternatively, navigate('/admin') to go to a specific route
  };

  // Handler for the create button (currently non-functional)
  const handleCreate = () => {
    alert('Create functionality is disabled.');
    // Future implementation: Open a modal or navigate to a create page
  };

  // Filtered products based on search query
  const filteredProducts = products.filter((product) => {
    const query = searchQuery;
    return (
      product.name.includes(query) ||
      (product.sku && product.sku.includes(query)) ||
      (product.category && product.category.includes(query))
    );
  });

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-20 sm:ml-64">
      {/* Top Bar */}
      <div className="w-full max-w-5xl mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center text-gray-700 hover:text-gray-900 transition"
            aria-label="Go Back"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold">Product Management</h1>
        </div>
        {/* Search Bar */}
        <div className="flex items-center bg-white rounded-md shadow-sm">
          <FaSearch className="text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 w-64 rounded-r-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ml-4"
        >
          <FaPlus className="mr-2" /> Create
        </button>
      </div>

      {/* Container for CRUD operations */}
      <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 w-full max-w-5xl">
        {/* Add Product Form (Disabled) */}
        {/* You can uncomment and implement the form if needed in the future */}
        {/*
        <form onSubmit={handleAddProduct} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded"
              required
              disabled
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={newProduct.category}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded"
              required
              disabled
            />
            <input
              type="text"
              name="sku"
              placeholder="SKU"
              value={newProduct.sku}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded"
              required
              disabled
            />
            <input
              type="number"
              name="price"
              placeholder="Price ($)"
              value={newProduct.price}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded"
              required
              min="0"
              step="0.01"
              disabled
            />
            <input
              type="text"
              name="image"
              placeholder="Image URL"
              value={newProduct.image}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded"
              required
              disabled
            />
            <div className="flex items-center">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                disabled
              >
                Add Product
              </button>
            </div>
          </div>
          <p className="text-red-500 mt-2">Form submission is disabled.</p>
        </form>
        */}

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Image</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Price ($)</th>
                <th className="py-2 px-4 border-b">SKU</th>
                <th className="py-2 px-4 border-b">Category</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="text-center">
                    <td className="py-2 px-4 border-b">
                      <img
                        src={product.imageUrl || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">{product.name}</td>
                    <td className="py-2 px-4 border-b">
                      {parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b">{product.sku || "N/A"}</td>
                    <td className="py-2 px-4 border-b">{product.category || "N/A"}</td>
                    <td className="py-2 px-4 border-b flex justify-center space-x-2">
                      <button
                        className="flex items-center bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                        disabled
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        className="flex items-center bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                        disabled
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductCRUDPage;
