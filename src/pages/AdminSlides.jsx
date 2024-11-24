import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SliderManagement = () => {
  const [slides, setSlides] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [editingSlide, setEditingSlide] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSlides();
    fetchProducts();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/slides`);
      setSlides(response.data);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddOrUpdateSlide = async () => {
    const selectedProduct = products.find(product => product._id === selectedProductId);
    if (!selectedProduct) return;

    const slideData = {
      productId: selectedProduct._id,
      name: selectedProduct.name,
      price: selectedProduct.mainPrice,
      discountPrice: selectedProduct.discountPrice,
      imageUrl: selectedProduct.mainImage,
      mainBadgeName: selectedProduct.mainBadgeName,
      mainBadgeColor: selectedProduct.mainBadgeColor
    };

    try {
      if (editingSlide) {
        const response = await axios.put(`${import.meta.env.VITE_API_URI}/api/updateslides/${editingSlide._id}`, slideData);
        setSlides(slides.map(slide => (slide._id === editingSlide._id ? response.data : slide)));
      } else {
        const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/createslides`, slideData);
        setSlides([...slides, response.data]);
      }
      setSelectedProductId('');
      setEditingSlide(null);
    } catch (error) {
      console.error(editingSlide ? 'Error updating slide:' : 'Error adding slide:', error);
    }
  };

  const handleDeleteSlide = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URI}/api/deleteslides/${id}`);
      setSlides(slides.filter(slide => slide._id !== id));
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  const startEditing = (slide) => {
    setSelectedProductId(slide.productId);
    setEditingSlide(slide);
  };

  const filteredSlides = slides.filter(slide =>
    slide.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-20">
      <div className="w-full max-w-5xl">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-gray-900">
              <FaArrowLeft className="text-2xl" />
            </button>
            <h1 className="text-2xl font-bold">Slider Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white rounded-md shadow-sm w-full sm:w-auto">
              <FaSearch className="text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Search slides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 w-full sm:w-64 bg-white rounded-r-md focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddOrUpdateSlide}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              <FaPlus className="mr-2" /> {editingSlide ? 'Update Slide' : 'Add Slide'}
            </button>
          </div>
        </div>

        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
          <div className="mb-8">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="px-4 py-2 border border-gray-300 bg-white rounded w-full mb-4"
            >
              <option value="">Select Product</option>
              {products.map((product) => (
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
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Discount Price</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="flex-1 sm:flex-none">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Loading slides...
                  </td>
                </tr>
              ) : filteredSlides.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No slides found.
                  </td>
                </tr>
              ) : (
                filteredSlides.map((slide) => (
                  <tr key={slide._id} className="flex flex-col sm:table-row">
                    <td className="border hover:bg-gray-100 p-3">{slide.name}</td>
                    <td className="border hover:bg-gray-100 p-3">{slide.price}</td>
                    <td className="border hover:bg-gray-100 p-3">{slide.discountPrice || 'N/A'}</td>
                    <td className="border hover:bg-gray-100 p-3 flex space-x-2">
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 flex items-center"
                        onClick={() => startEditing(slide)}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center"
                        onClick={() => handleDeleteSlide(slide._id)}
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

export default SliderManagement;
