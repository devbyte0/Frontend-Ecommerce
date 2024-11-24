import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RelatedProductsManagement = () => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [relatedName, setRelatedName] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRelatedProducts();
    fetchProducts();
  }, []);

  const fetchRelatedProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/relatedproduct`);
      setRelatedProducts(response.data);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddRelatedProduct = async () => {
    const selectedProductData = selectedProductIds.map(id => products.find(product => product._id === id));
    if (!selectedProductData.length || !relatedName) return;

    const relatedProductData = {
      name: relatedName,
      relatedProducts: selectedProductData.map(product => ({
        productId: product._id,
        name: product.name,
        mainPrice: product.mainPrice,
        discountPrice: product.discountPrice,
        mainBadgeName: product.mainBadgeName,
        mainBadgeColor: product.mainBadgeColor,
        mainImage: product.mainImage,
      })),
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/createrelatedproduct`, relatedProductData);
      setRelatedProducts([...relatedProducts, response.data]);
      setRelatedName('');
      setSelectedProductIds([]);
    } catch (error) {
      console.error('Error adding related product:', error);
    }
  };

  const handleUpdateRelatedProduct = async () => {
    const selectedProductData = selectedProductIds.map(id => products.find(product => product._id === id));
    if (!selectedProductData.length || !relatedName) return;

    const updatedRelatedProductData = {
      name: relatedName,
      relatedProducts: selectedProductData.map(product => ({
        productId: product._id,
        name: product.name,
        mainPrice: product.mainPrice,
        discountPrice: product.discountPrice,
        mainBadgeName: product.mainBadgeName,
        mainBadgeColor: product.mainBadgeColor,
        mainImage: product.mainImage,
      })),
    };

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URI}/api/updaterelatedproduct/${editingProduct._id}`, updatedRelatedProductData);
      setRelatedProducts(relatedProducts.map(item => (item._id === editingProduct._id ? response.data : item)));
      setRelatedName('');
      setSelectedProductIds([]);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating related product:', error);
    }
  };

  const handleDeleteRelatedProduct = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URI}/api/deleterelatedproduct/${id}`);
      setRelatedProducts(relatedProducts.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting related product:', error);
    }
  };

  const startEditing = (relatedProduct) => {
    setRelatedName(relatedProduct.name);
    setSelectedProductIds(relatedProduct.relatedProducts.map(product => product.productId));
    setEditingProduct(relatedProduct);
  };

  const filteredRelatedProducts = relatedProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedProductIds(selectedOptions);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-20">
      <div className="w-full max-w-5xl">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-gray-900">
              <FaArrowLeft className="text-2xl" />
            </button>
            <h1 className="text-2xl font-bold">Related Products Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white rounded-md shadow-sm w-full sm:w-auto">
              <FaSearch className="text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Search related products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 w-full sm:w-64 bg-white rounded-r-md focus:outline-none"
              />
            </div>
            <button
              onClick={() => (editingProduct ? handleUpdateRelatedProduct() : handleAddRelatedProduct())}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <FaPlus className="mr-2" /> {editingProduct ? 'Update Related Product' : 'Add Related Product'}
            </button>
          </div>
        </div>

        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter related product name..."
              value={relatedName}
              onChange={(e) => setRelatedName(e.target.value)}
              className="px-4 py-2 border border-gray-300 bg-white rounded w-full mb-4"
            />
            <label>Select Products:</label>
            <select
              multiple
              value={selectedProductIds}
              onChange={handleProductSelect}
              className="w-full p-2 border bg-white border-gray-300 rounded mb-4"
            >
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <table className="w-full flex flex-col sm:table">
            <thead className="text-white">
              <tr className="bg-teal-400 flex flex-col sm:table-row">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="flex-1 sm:flex-none">
              {loading ? (
                <tr>
                  <td colSpan="2" className="text-center py-4">Loading related products...</td>
                </tr>
              ) : filteredRelatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-4">No related products found.</td>
                </tr>
              ) : (
                filteredRelatedProducts.map(product => (
                  <tr key={product._id} className="flex flex-col sm:table-row">
                    <td className="border hover:bg-gray-100 p-3">{product.name}</td>
                    <td className="border hover:bg-gray-100 p-3 flex space-x-2">
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        onClick={() => startEditing(product)}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDeleteRelatedProduct(product._id)}
                      >
                        <FaTrash /> Delete
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

export default RelatedProductsManagement;
