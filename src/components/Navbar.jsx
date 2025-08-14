import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaUser, FaSignOutAlt, FaBars } from "react-icons/fa";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";

export default function AmazonNavbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { cartItems } = useContext(CartContext);
  const { isLoggedIn, logout } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URI}/api/products`)
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      (product.sku && product.sku.toLowerCase().includes(query)) ||
      (product.category && product.category.toLowerCase().includes(query))
    );
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(e.target.value.length > 0);
  };

  const handleProductClick = () => {
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
    }
  };

  return (
    <nav className="bg-[#232f3e] text-white shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto">
        {/* Logo - hidden on mobile/tablet */}
        <NavLink
          to="/"
          className="hidden lg:flex items-center gap-2"
        >
          <img src="/amazon-logo.png" alt="Logo" className="h-8 w-auto" />
          <span className="font-bold text-xl text-yellow-400 tracking-wide">
            Barvella
          </span>
        </NavLink>

        {/* Search Bar - always visible */}
        <form
          className="flex-1 mx-6 max-w-2xl relative flex"
          onSubmit={handleSearchSubmit}
        >
          <div className="w-full relative">
            <input
              type="text"
              placeholder="Search products, brands and more"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 rounded-l bg-white text-gray-900 outline-none"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-4 bg-yellow-400 hover:bg-yellow-500 rounded-r text-gray-900 font-bold"
            >
              <FaSearch />
            </button>
            {showDropdown && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <NavLink
                      to={`/products/${product._id}`}
                      key={product._id}
                      onClick={handleProductClick}
                      className="flex items-center gap-2 p-2 hover:bg-yellow-100 w-full"
                    >
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="text-gray-800">{product.name}</span>
                    </NavLink>
                  ))
                ) : (
                  <p className="p-2 text-gray-500">No products found</p>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Navigation Links - hidden on mobile/tablet */}
        <div className="hidden lg:flex items-center gap-6">
          <NavLink
            to="/products"
            className="font-semibold text-white hover:text-yellow-400 transition"
          >
            Products
          </NavLink>
          <NavLink
            to="/contactus"
            className="font-semibold text-white hover:text-yellow-400 transition"
          >
            Contact Us
          </NavLink>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <NavLink
                to="/profile"
                className="text-white hover:text-yellow-400"
              >
                <FaUser size={22} />
              </NavLink>
              <button
                onClick={logout}
                className="text-white hover:text-red-400"
              >
                <FaSignOutAlt size={22} />
              </button>
            </div>
          ) : (
            <>
              <NavLink
                to="/login"
                className="font-semibold text-white hover:text-yellow-400 transition"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-1 rounded font-semibold transition"
              >
                Sign Up
              </NavLink>
            </>
          )}
          <NavLink
            to="/cart"
            className="relative flex items-center"
          >
            <FaShoppingCart size={24} className="text-yellow-400" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                {cartItems.length}
              </span>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
