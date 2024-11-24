import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Button,
  Input,
} from "@nextui-org/react";
import { NavLink } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaUser, FaSignOutAlt } from "react-icons/fa"; // Import FaSignOutAlt for logout icon
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";

export default function PixaNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems } = useContext(CartContext);
  const { isLoggedIn, logout } = useContext(UserContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const menuItems = ["Home", "Products", "ContactUs"];

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/products")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
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

  return (
    <>
      <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
        <NavbarContent className="sm:hidden" style={{ flexGrow: "0" }} justify="start">
          <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
        </NavbarContent>
        <NavbarContent className="hidden sm:flex pr-3" justify="center">
          <NavbarBrand>
            <p className="font-bold text-inherit hidden">Barvella</p>
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarBrand>
            <p className="font-bold text-inherit">Barvella</p>
          </NavbarBrand>
          {menuItems.map((item, index) => (
            <NavbarItem key={index}>
              <NavLink
                to={`/${item.toLowerCase()}`}
                style={({ isActive }) => ({
                  fontWeight: isActive ? "bold" : "",
                  color: isActive ? "red" : "black",
                })}
              >
                {item}
              </NavLink>
            </NavbarItem>
          ))}
        </NavbarContent>
        <NavbarContent justify="end" className="flex items-center gap-4">
          <NavbarItem className="relative w-full">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              startContent={<FaSearch />}
              aria-label="Search products"
              className="w-full"
            />
            {showDropdown && (
              <div className="absolute bg-white border rounded shadow-lg mt-1 left-0 right-0 w-full max-h-60 overflow-y-auto z-50">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <NavLink
                      to={`/products/${product._id}`}
                      key={product._id}
                      onClick={handleProductClick}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full"
                    >
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span>{product.name}</span>
                    </NavLink>
                  ))
                ) : (
                  <p className="p-2 text-gray-500">No products found</p>
                )}
              </div>
            )}
          </NavbarItem>

          {isLoggedIn ? (
            <NavbarItem className="hidden lg:flex">
              <div className="flex gap-4">
              <NavLink to="/profile">
                <FaUser size={24} />
              </NavLink>
              <button  onClick={logout}><FaSignOutAlt size={24} /></button>
              </div>
            </NavbarItem>
          ) : (
            <>
              <NavbarItem className="hidden lg:flex">
                <NavLink
                  to="/login"
                  style={({ isActive }) => ({
                    fontWeight: isActive ? "bold" : "",
                    color: isActive ? "red" : "black",
                  })}
                >
                  Login
                </NavLink>
              </NavbarItem>
              <NavbarItem className="hidden lg:flex">
                <Button
                  as={NavLink}
                  color="warning"
                  to="/signup"
                  variant="flat"
                  style={({ isActive }) => ({
                    fontWeight: isActive ? "bold" : "",
                    color: isActive ? "red" : "black",
                  })}
                >
                  SignUp
                </Button>
              </NavbarItem>
            </>
          )}

          <NavbarItem className="hidden sm:flex">
            <NavLink to="/cart" style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <FaShoppingCart size={24} />
              {cartItems.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-10px",
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "50%",
                    height: "18px",
                    width: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {cartItems.length}
                </div>
              )}
            </NavLink>
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu>
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <NavLink
                to={`/${item.toLowerCase()}`}
                className="w-full"
                style={({ isActive }) => ({
                  fontWeight: isActive ? "bold" : "",
                  color: isActive ? "red" : "black",
                })}
              >
                {item}
              </NavLink>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
    </>
  );
}
