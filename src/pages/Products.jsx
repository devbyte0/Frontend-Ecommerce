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
        // Parse the categories string into an array
        let productCategories;
        try {
          productCategories = JSON.parse(product.categories);
        } catch (error) {
          productCategories = [];
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

  return (
    <div className="flex mb-[50px] flex-col md:flex-row">
      {/* Filter Icon for Mobile */}
      <button
        className="md:hidden mb-4 p-2 bg-blue-500 text-white rounded-md self-end"
        onClick={() => setShowFilters(!showFilters)}
      >
        <FaFilter />
      </button>

      {/* Sidebar for Filters */}
      <div
        className={`w-full md:w-1/4 p-4 border-r mb-4 md:mb-0 ${
          showFilters ? "block" : "hidden"
        } md:block`}
      >
        {/* Categories Filter */}
        <h2 className="text-xl font-bold mb-4">Filter by Category</h2>
        {categories.length > 0 ? (
          categories.map((category) => (
            <label key={category._id} className="block mb-2">
              <input
                type="checkbox"
                value={category.name}
                checked={selectedCategories.includes(category.name)}
                onChange={() => handleCategoryChange(category.name)}
                className="mr-2"
              />
              {category.name}
            </label>
          ))
        ) : (
          <p>Loading categories...</p>
        )}
        {/* Genders Filter */}
        <h2 className="text-xl font-bold mt-6 mb-4">Filter by Gender</h2>
        {genders.length > 0 ? (
          genders.map((gender) => (
            <label key={gender._id} className="block mb-2">
              <input
                type="checkbox"
                value={gender.type}
                checked={selectedGenders.includes(gender.type)}
                onChange={() => handleGenderChange(gender.type)}
                className="mr-2"
              />
              {gender.type}
            </label>
          ))
        ) : (
          <p>Loading genders...</p>
        )}
        {/* Clear Filters Button */}
        {(selectedCategories.length > 0 || selectedGenders.length > 0) && (
          <button
            onClick={() => {
              setSelectedCategories([]);
              setSelectedGenders([]);
            }}
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
          >
            Clear Filters
          </button>
        )}
      </div>
      {/* Products List */}
      <div className="w-full md:w-3/4 p-4">
        {loading ? (
          <p>Loading products...</p>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((info) => (
              <Link to={`/products/${info._id}`} key={info._id}>
                <ProductCard Data={info} />
              </Link>
            ))}
          </div>
        ) : (
          <p>No products found matching the selected filters.</p>
        )}
      </div>
    </div>
  );
}

export default Products;
