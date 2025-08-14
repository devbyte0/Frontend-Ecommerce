import React, { useEffect, useContext, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartContext } from '../context/CartContext';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

function CartPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(UserContext);
  const {
    cartItems = [],
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    coupon,
    discount,
    totalPrice,
    isLoading,
    updateQuantity
  } = useContext(CartContext);

  const [localQuantities, setLocalQuantities] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Debug logs for discount and coupon updates
  useEffect(() => {
    console.log("Discount value:", discount);
    console.log("Coupon object:", coupon);
  }, [discount, coupon]);

  useEffect(() => {
    const quantities = {};
    cartItems.forEach(item => {
      const identifier = isLoggedIn ? item._id : item.guestItemId;
      quantities[identifier] = item.quantity.toString();
    });
    setLocalQuantities(quantities);
  }, [cartItems, isLoggedIn]);

  const handleQuantityChange = (itemIdentifier, value) => {
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    const numericValue = Math.max(1, parseInt(sanitizedValue, 10) || 1);
    setLocalQuantities(prev => ({
      ...prev,
      [itemIdentifier]: sanitizedValue
    }));
    updateQuantity(itemIdentifier, numericValue);
  };

  const toastConfig = {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Ensure discount is number and default to 0 if falsy
  const total = subtotal - (discount || 0);
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);

  const getItemIdentifier = (item) => {
    return isLoggedIn ? item._id : item.guestItemId;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setLocalLoading(true);
    setCouponError(null);

    const result = await applyCoupon(couponCode);

    if (result.success) {
      toast.success(result.message, toastConfig);
      setCouponCode("");
    } else {
      setCouponError(result.message);
      if (result.details) {
        console.log("Coupon validation details:", result.details);
      }
    }

    setLocalLoading(false);
  };

  const handleRemoveCoupon = async () => {
    setLocalLoading(true);
    try {
      await removeCoupon();
      toast.info("Coupon removed!", toastConfig);
    } catch (error) {
      toast.error("Error removing coupon", toastConfig);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="container mx-auto mb-12 p-2 md:p-6 bg-[#f3f3f3] min-h-screen">
      <ToastContainer />
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#232f3e]">Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="border-b pb-4 mb-4">
                <span className="text-lg font-semibold text-[#232f3e]">Items ({cartItems.length})</span>
              </div>
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const originalPrice = item.price * item.quantity;
                  const discountPercentage = item.discountApplied > 0
                    ? Math.round((item.discountApplied / originalPrice) * 100)
                    : 0;
                  const itemIdentifier = getItemIdentifier(item);

                  return (
                    <div
                      key={itemIdentifier}
                      className="flex flex-col md:flex-row items-center p-4 border-b last:border-b-0"
                    >
                      <img
                        src={item.mainImage}
                        alt={item.name}
                        className="w-20 h-20 object-contain rounded-md mb-2 md:mb-0 md:mr-4 bg-gray-50 border"
                        onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
                      />
                      <div className="flex-grow text-center md:text-left">
                        <h3 className="text-md md:text-lg font-bold text-[#232f3e]">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                          <span className="text-yellow-700 text-base font-bold">
                            ${item.price.toFixed(2)}
                          </span>
                          <span className="text-gray-600 text-sm">× {item.quantity}</span>
                          {item.discountApplied > 0 && (
                            <span className="text-green-600 text-sm">
                              -${item.discountApplied.toFixed(2)} ({discountPercentage}%)
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 justify-center md:justify-start">
                          {item.size && (
                            <span className="text-gray-500 text-xs md:text-sm bg-gray-100 px-2 py-1 rounded">
                              {item.measureType}: {item.size} {item.unitName || ''}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-gray-500 text-xs md:text-sm bg-gray-100 px-2 py-1 rounded">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-center md:justify-start mt-3">
                          <button
                            onClick={() => decreaseQuantity(itemIdentifier)}
                            className="px-3 py-1 text-base font-medium bg-gray-200 rounded-l hover:bg-gray-300"
                            disabled={isLoading || localLoading}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={localQuantities[itemIdentifier] || ''}
                            onChange={(e) => handleQuantityChange(itemIdentifier, e.target.value)}
                            className="px-4 py-1 bg-gray-50 border-y border-gray-200 text-base w-16 text-center"
                            disabled={isLoading || localLoading}
                            aria-label="Product quantity"
                          />
                          <button
                            onClick={() => increaseQuantity(itemIdentifier)}
                            className="px-3 py-1 text-base font-medium bg-gray-200 rounded-r hover:bg-gray-300"
                            disabled={isLoading || localLoading}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(itemIdentifier)}
                          className="mt-2 text-red-600 hover:text-red-700 text-sm flex items-center justify-center md:justify-start"
                          disabled={isLoading || localLoading}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4 text-[#232f3e]">Order Summary</h3>

              {/* Coupon Section */}
              <div className="mb-4">
                {coupon ? (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-md mb-2">
                    <div>
                      <p className="text-green-700 font-medium">{coupon.code}</p>
                      <p className="text-xs text-green-600">
                        {coupon.discount > 0 && `-$${coupon.discount.toFixed(2)} discount applied`}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-700 text-sm"
                      disabled={isLoading || localLoading}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex mb-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError(null);
                        }}
                        placeholder="Enter coupon code"
                        className={`flex-grow px-3 py-2 border ${
                          couponError ? 'border-red-500' : 'border-gray-300'
                        } rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500`}
                        disabled={isLoading || localLoading}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={isLoading || localLoading || !couponCode.trim()}
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-sm mt-1">{couponError}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Have a coupon code? Enter it above to apply your discount.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${formattedSubtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${formattedTotal}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => navigate("../checkout")}
                  className="bg-green-500 text-white py-3 rounded hover:bg-green-600 disabled:bg-green-300 transition-colors"
                  disabled={isLoading || localLoading}
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="text-red-600 bg-red-100 py-2 rounded hover:bg-red-200 disabled:opacity-50"
                  disabled={isLoading || localLoading}
                >
                  Clear Entire Cart
                </button>
                <button
                  onClick={() => navigate("/products")}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
