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

   // Local quantity state management
  const [localQuantities, setLocalQuantities] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [localLoading, setLocalLoading] = useState(false);


  // Initialize local quantities
  useEffect(() => {
    const quantities = {};
    cartItems.forEach(item => {
      const identifier = isLoggedIn ? item._id : item.guestItemId;
      quantities[identifier] = item.quantity.toString();
    });
    setLocalQuantities(quantities);
  }, [cartItems, isLoggedIn]);

  const handleQuantityChange = (itemIdentifier, value) => {
    // Sanitize and validate input
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    const numericValue = Math.max(1, parseInt(sanitizedValue, 10) || 1);
    
    // Update local state immediately
    setLocalQuantities(prev => ({
      ...prev,
      [itemIdentifier]: sanitizedValue
    }));

    // Update cart quantity
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

  const total = subtotal - discount;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);

  const getItemIdentifier = (item) => {
    return isLoggedIn ? item._id : item.guestItemId;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code", toastConfig);
      return;
    }
    setLocalLoading(true);
    try {
      await applyCoupon(couponCode);
      setCouponCode("");
      toast.success("Coupon applied successfully!", toastConfig);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon code", toastConfig);
    } finally {
      setLocalLoading(false);
    }
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
    <div className="container mx-auto mb-12 p-4 md:p-6">
      <ToastContainer />
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
          <button 
            onClick={() => navigate('/products')}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
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
                className="flex flex-col md:flex-row items-center p-4 bg-white shadow rounded-md"
              >
                <img
                  src={item.mainImage}
                  alt={item.name}
                  className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-md mb-2 md:mb-0 md:mr-4"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
                <div className="flex-grow text-center md:text-left">
                  <h3 className="text-md md:text-lg font-medium">{item.name}</h3>
                  <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                    <p className="text-gray-600 text-sm md:text-base">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                    {item.discountApplied > 0 && (
                      <p className="text-green-500 text-sm md:text-base">
                        -${item.discountApplied.toFixed(2)} ({discountPercentage}%)
                      </p>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 justify-center md:justify-start">
                    {item.size && (
                      <span className="text-gray-500 text-xs md:text-sm bg-gray-100 px-2 py-1 rounded">
                        Size: {item.size}
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
    className="px-3 py-1 text-base md:text-lg font-medium bg-gray-200 rounded-l hover:bg-gray-300"
    disabled={isLoading || localLoading}
    aria-label="Decrease quantity"
  >
    -
  </button>
  <input
    type="text"
    value={localQuantities[itemIdentifier] || ''}
    onChange={(e) => handleQuantityChange(itemIdentifier, e.target.value)}
    className="px-4 py-1 bg-gray-50 border-y border-gray-200 text-base md:text-lg w-16 text-center"
    disabled={isLoading || localLoading}
    aria-label="Product quantity"
  />
  <button
    onClick={() => increaseQuantity(itemIdentifier)}
    className="px-3 py-1 text-base md:text-lg font-medium bg-gray-200 rounded-r hover:bg-gray-300"
    disabled={isLoading || localLoading}
    aria-label="Increase quantity"
  >
    +
  </button>
</div>
                  <button
                    onClick={() => removeItem(itemIdentifier)}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm md:text-base flex items-center justify-center md:justify-start"
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
      )}

      {cartItems.length > 0 && (
        <>
          <div className="flex flex-col md:flex-row justify-between mt-8 gap-4">
            <div className="w-full md:w-1/2 space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Coupon Code</h3>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-md"
                    disabled={!!coupon || isLoading || localLoading}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                      disabled={!!coupon || isLoading || localLoading}
                    >
                      {localLoading ? "Applying..." : "Apply"}
                    </button>
                    {!!coupon && (
                      <button
                        onClick={handleRemoveCoupon}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        disabled={isLoading || localLoading}
                      >
                        {localLoading ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 bg-gray-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${formattedSubtotal}</span>
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
        </>
      )}
    </div>
  );
}

export default CartPage;