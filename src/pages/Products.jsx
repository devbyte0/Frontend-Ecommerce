import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { FaFilter } from "react-icons/fa"; // Import the filter icon

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // State to toggle filters visibility

  // Fetch all products initially
  const getProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URI}/api/products`);
      setProducts(data); // Set all products initially
      setFilteredProducts(data); // Initially show all products
    } catch (error) {
      console.error("Error fetching products", error);
    }
    setLoading(false);
  };

  // Fetch categories
  const getCategories = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URI}/api/categories`);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  // Fetch genders
  const getGenders = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URI}/api/genders`);
      setGenders(data);
    } catch (error) {
      console.error("Error fetching genders", error);
    }
  };

  // Handle category checkbox change
  const handleCategoryChange = (categoryName) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(categoryName)
        ? prevSelected.filter((c) => c !== categoryName)
        : [...prevSelected, categoryName]
    );
  };

  // Handle gender checkbox change
  const handleGenderChange = (genderName) => {
    setSelectedGenders((prevSelected) =>
      prevSelected.includes(genderName)
        ? prevSelected.filter((g) => g !== genderName)
        : [...prevSelected, genderName]
    );
  };

  // Apply filtering logic based on selected categories and genders
  useEffect(() => {
    let filtered = products;
    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => {
        let productCategories = [];
        // Parse each category string if needed
        if (Array.isArray(product.categories)) {
          product.categories.forEach(cat => {
            try {
              const parsed = JSON.parse(cat);
              if (Array.isArray(parsed)) {
                productCategories = productCategories.concat(parsed);
              }
            } catch {
              productCategories.push(cat);
            }
          });
        }
        return productCategories.some((category) =>
          selectedCategories.includes(category)
        );
      });
    }
    // Filter by selected genders
    if (selectedGenders.length > 0) {
      filtered = filtered.filter((product) =>
        selectedGenders.includes(product.gender)
      );
    }
    setFilteredProducts(filtered);
  }, [selectedCategories, selectedGenders, products]);

  // Fetch categories, genders, and products on component mount
  useEffect(() => {
    getCategories();
    getGenders();
    getProducts(); // Fetch all products once
  }, []);

  // Replace your main return block with this Amazon-inspired layout
  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-1/4">
          {/* Mobile Filter Button */}
          <div className="md:hidden flex justify-end mb-4">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow font-semibold"
              onClick={() => setShowFilters(true)}
            >
              <FaFilter />
              Filters
            </button>
          </div>
          {/* Filter Drawer for Mobile */}
          {showFilters && (
            <div className="fixed inset-0 z-50 flex">
              {/* Overlay */}
              <div
                className="flex-1 bg-black bg-opacity-40"
                onClick={() => setShowFilters(false)}
              />
              {/* Drawer */}
              <div className="w-80 max-w-full bg-white rounded-l-xl shadow-lg p-6 border border-gray-200 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
                  <button
                    className="text-gray-500 hover:text-red-500 text-xl font-bold"
                    onClick={() => setShowFilters(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Category</h3>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <label key={category._id} className="flex items-center mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={category.name}
                          checked={selectedCategories.includes(category.name)}
                          onChange={() => handleCategoryChange(category.name)}
                          className="mr-2 accent-yellow-500"
                        />
                        <span className="text-gray-700">{category.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Loading categories...</p>
                  )}
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Gender</h3>
                  {genders.length > 0 ? (
                    genders.map((gender) => (
                      <label key={gender._id} className="flex items-center mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={gender.type}
                          checked={selectedGenders.includes(gender.type)}
                          onChange={() => handleGenderChange(gender.type)}
                          className="mr-2 accent-yellow-500"
                        />
                        <span className="text-gray-700">{gender.type}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Loading genders...</p>
                  )}
                </div>
                {(selectedCategories.length > 0 || selectedGenders.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedGenders([]);
                    }}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 font-semibold"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden md:block bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Filters</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Category</h3>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <label key={category._id} className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={category.name}
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => handleCategoryChange(category.name)}
                      className="mr-2 accent-yellow-500"
                    />
                    <span className="text-gray-700">{category.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-400">Loading categories...</p>
              )}
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Gender</h3>
              {genders.length > 0 ? (
                genders.map((gender) => (
                  <label key={gender._id} className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={gender.type}
                      checked={selectedGenders.includes(gender.type)}
                      onChange={() => handleGenderChange(gender.type)}
                      className="mr-2 accent-yellow-500"
                    />
                    <span className="text-gray-700">{gender.type}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-400">Loading genders...</p>
              )}
            </div>
            {(selectedCategories.length > 0 || selectedGenders.length > 0) && (
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedGenders([]);
                }}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Products List */}
        <main className="w-full md:w-3/4">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Shop Products</h1>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <span className="text-lg text-gray-500 animate-pulse">Loading products...</span>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((info) => (
                <Link to={`/products/${info._id}`} key={info._id}>
                  <ProductCard Data={info} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <span className="text-lg text-gray-500">No products found matching the selected filters.</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Products;
