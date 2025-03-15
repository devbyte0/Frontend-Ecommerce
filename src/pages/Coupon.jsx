import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [editingCoupon, setEditingCoupon] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/coupons`);
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleAddOrUpdateCoupon = async () => {
    const applicableProducts = selectedProducts.map((productId) => ({
      product: productId,
      variants: selectedVariants[productId] || [],
    }));

    const newCoupon = {
      code,
      discount,
      expirationDate,
      applicableProducts,
    };

    try {
      if (editingCoupon) {
        await axios.put(`${import.meta.env.VITE_API_URI}/api/coupons/${editingCoupon._id}`, newCoupon);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URI}/api/coupons`, newCoupon);
      }
      fetchCoupons();
      resetForm();
    } catch (error) {
      console.error("Error adding or updating coupon:", error);
    }
  };

  const resetForm = () => {
    setCode("");
    setDiscount("");
    setExpirationDate("");
    setSelectedProducts([]);
    setSelectedVariants({});
    setEditingCoupon(null);
  };

  const handleProductSelection = (e) => {
    const selectedOptions = [...e.target.selectedOptions].map((option) => option.value);
    setSelectedProducts(selectedOptions);
  };

  const handleVariantSelection = (productId, e) => {
    const selectedOptions = [...e.target.selectedOptions].map((option) => JSON.parse(option.value));
    setSelectedVariants({ ...selectedVariants, [productId]: selectedOptions });
  };

  const getProductById = (productId) => {
    return products.find((product) => product._id === productId);
  };

  const renderCouponDetails = (coupon) => {
    return (
      <div key={coupon._id} className="mb-4 border p-4 rounded-lg">
        <h3 className="font-bold">{coupon.code} - {coupon.discount}% off</h3>
        <p>Expires on: {new Date(coupon.expirationDate).toLocaleDateString()}</p>
        <div>
          <h4 className="text-lg font-semibold">Applicable Products:</h4>
          {coupon.applicableProducts.map((item, index) => {
            const product = getProductById(item.product);
            return (
              <div key={index} className="mb-2">
                <h5 className="text-md font-medium">{product?.name}</h5>
                {item.variants.map((variant, idx) => (
                  <div key={idx} className="ml-4">
                    <p>Color: {variant.color}, Size: {variant.size}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setEditingCoupon(coupon)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          <FaEdit /> Edit
        </button>
        <button
          onClick={() => handleDeleteCoupon(coupon._id)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          <FaTrash /> Delete
        </button>
      </div>
    );
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URI}/api/coupons/${couponId}`);
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-20 sm:ml-64">
      <div className="w-full max-w-5xl mb-8 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition">
          <FaArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <input
          type="text"
          placeholder="Search coupons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 bg-white rounded px-4 py-2"
        />
        <FaSearch />
      </div>

      {/* Coupon Add/Edit Form */}
      <div className="w-full max-w-5xl bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingCoupon ? "Edit Coupon" : "Add Coupon"}</h2>
        <input
          type="text"
          placeholder="Coupon Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border border-gray-300 bg-white rounded px-4 py-2 mb-2 w-full"
          required
        />
        <input
          type="number"
          placeholder="Discount (%)"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="border border-gray-300 bg-white rounded px-4 py-2 mb-2 w-full"
          required
        />
        <input
          type="date"
          placeholder="Expiration Date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          className="border border-gray-300 bg-white rounded px-4 py-2 mb-2 w-full"
          required
        />

        {/* Multi-select Products */}
        <select multiple onChange={handleProductSelection} className="border border-gray-300 bg-white rounded px-4 py-2 mb-2 w-full">
          <option value="">Select Products</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>

        {selectedProducts.map((productId) => {
          const product = products.find((p) => p._id === productId);
          return (
            <div key={productId} className="mb-4">
              <h3 className="font-semibold">{product.name}</h3>

              {/* Multi-select Variants */}
              <select
                multiple
                onChange={(e) => handleVariantSelection(productId, e)}
                className="border border-gray-300 bg-white rounded px-4 py-2 mb-2 w-full"
              >
                <option value="">Select Variants</option>
                {product.variants.map((variant) => (
                  <option
                    key={variant._id}
                    value={JSON.stringify({
                      variantId: variant._id,
                      color: variant.colorName,
                      size: variant.sizes[0], // Default to the first size
                    })}
                  >
                    {variant.colorName} - {variant.sizes.join(", ")}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        <button onClick={handleAddOrUpdateCoupon} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
          {editingCoupon ? "Update Coupon" : "Add Coupon"}
        </button>
      </div>

      {/* Coupons List */}
      <div className="w-full max-w-5xl">
        {loading ? (
          <p>Loading coupons...</p>
        ) : (
          coupons
            .filter((coupon) =>
              coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(renderCouponDetails)
        )}
      </div>
    </div>
  );
};

export default CouponManagement;