import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { FaMoneyBillAlt, FaMobileAlt, FaTrash, FaCreditCard, FaPlus } from "react-icons/fa";

function CheckoutPage() {
  const {
    cartItems = [],
    discount = 0,
    coupon = null,
    clearCart,
    removeItem,
  } = useContext(CartContext);

  const {
    user,
    address,
    paymentMethods,
    defaultPaymentMethod,
    isLoggedIn,
    updateAddress,
    addPaymentMethod,
  } = useContext(UserContext);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.fullName || "",
    address: address?.street || "",
    city: address?.city || "",
    postalCode: address?.zipCode || "",
    state: address?.state || "",
    country: address?.country || "",
    phone: user?.phoneNumber || "",
  });
  
  const [useSavedAddress, setUseSavedAddress] = useState(!!address);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(defaultPaymentMethod || null);
  const [addingNewPayment, setAddingNewPayment] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "bkash",
    walletNumberMasked: "",
    msisdn: "",
    label: "",
    isDefault: false,
  });
  const [transactionNumber, setTransactionNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (address && useSavedAddress) {
      setShippingInfo({
        fullName: user?.fullName || "",
        address: address.street || "",
        city: address.city || "",
        postalCode: address.zipCode || "",
        state: address.state || "",
        country: address.country || "",
        phone: user?.phoneNumber || "",
      });
    } else {
      setShippingInfo({
        fullName: "",
        address: "",
        city: "",
        postalCode: "",
        state: "",
        country: "",
        phone: "",
      });
    }
  }, [address, useSavedAddress, user]);

  useEffect(() => {
    if (defaultPaymentMethod) {
      setSelectedPaymentMethod(defaultPaymentMethod);
    }
  }, [defaultPaymentMethod]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewPaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPaymentMethod((prev) => ({ ...prev, [name]: value }));
  };

  const validateShippingInfo = () => {
    const requiredFields = ["fullName", "address", "city", "postalCode", "country", "phone"];
    for (const field of requiredFields) {
      if (!shippingInfo[field]?.trim()) {
        toast.error(`Please enter a valid ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
        return false;
      }
    }
    return true;
  };

  const mainTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountPercentage = (discount / mainTotal) * 100;
  const totalAfterDiscount = mainTotal - discount;

const handleCheckout = async () => {
  // Validate shipping info
  if (!validateShippingInfo()) return;

  // Prepare shipping address
  const orderShippingAddress = useSavedAddress ? {
    fullName: user?.fullName || "",
    address: address?.street || "",
    city: address?.city || "",
    postalCode: address?.zipCode || "",
    state: address?.state || "",
    country: address?.country || "",
    phone: user?.phoneNumber || ""
  } : {
    fullName: shippingInfo.fullName,
    address: shippingInfo.address,
    city: shippingInfo.city,
    postalCode: shippingInfo.postalCode,
    state: shippingInfo.state,
    country: shippingInfo.country,
    phone: shippingInfo.phone
  };

  // Validate payment method
  if (!selectedPaymentMethod) {
    toast.error("Please select a payment method.");
    return;
  }

  // Validate mobile payment details
  const isMobilePayment = ['bkash', 'nagad'].includes(selectedPaymentMethod.type.toLowerCase());
  if (isMobilePayment) {
    if (!transactionNumber.trim()) {
      toast.error("Please provide a valid transaction number.");
      return;
    }
    if (!/^[a-zA-Z0-9]{8,}$/.test(transactionNumber.trim())) {
      toast.error("Transaction number must be at least 8 alphanumeric characters");
      return;
    }
  }

  // Validate cart
  if (!cartItems.length) {
    toast.error("Your cart is empty.");
    return;
  }

  setLoading(true);

  try {
    // Prepare payment method
    const paymentMethodToSend = selectedPaymentMethod.type === 'cash' 
      ? 'Cash on Delivery' 
      : selectedPaymentMethod.type;

    // Prepare order data
    const orderData = {
      userId: user._id,
      items: cartItems.map((item) => ({
        variantId: item.variantId,
        productId: item.productId,
        discountApplied: item.discountApplied || 0,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        mainImage: item.mainImage,
        size: item.size,
        color: item.color,
        measureType: item.measureType,
        unitName: item.unitName,
      })),
      totalAmount: totalAfterDiscount,
      discountAmount: discount,
      couponCode: coupon?.code || null,
      shippingAddress: orderShippingAddress,
      paymentMethod: paymentMethodToSend,
      selectedPaymentMethodId: selectedPaymentMethod._id || selectedPaymentMethod.methodId,
      paymentDetails: isMobilePayment ? { 
        trxId: transactionNumber.trim(),
        walletNumberMasked: selectedPaymentMethod.walletNumberMasked,
        paymentMethod: selectedPaymentMethod.type
      } : {},
    };

    // Submit order
    const response = await fetch(`${import.meta.env.VITE_API_URI}/api/order`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(orderData),
    });

    // Handle response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to place order");
    }

    const result = await response.json();
    
    // Clear cart and show success
    clearCart();
    toast.success("Order placed successfully!");
    
    // Redirect to confirmation page
    navigate(`/profile/orders/order-confirmation/${result.orderId}`, {
      state: {
        order: result,
        paymentMethod: paymentMethodToSend,
        transactionNumber: isMobilePayment ? transactionNumber : null
      }
    });

  } catch (error) {
    console.error("Checkout error:", error);
    
    // More specific error messages
    let errorMessage = "Failed to place order. Please try again later.";
    if (error.message.includes("network")) {
      errorMessage = "Network error. Please check your connection and try again.";
    } else if (error.message.includes("validation")) {
      errorMessage = "Invalid order data. Please check your information.";
    }
    
    toast.error(error.message || errorMessage);
    
    // Log error to analytics if available
    if (window.analytics) {
      window.analytics.track('Checkout Error', {
        error: error.message,
        userId: user?._id
      });
    }
  } finally {
    setLoading(false);
  }
};

  const renderPaymentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'card':
        return <FaCreditCard className="mr-2 text-blue-500" />;
      case 'bkash':
        return <FaMobileAlt className="mr-2 text-[#e2136e]" />;
      case 'nagad':
        return <FaMobileAlt className="mr-2 text-[#e21818]" />;
      case 'cash':
        return <FaMoneyBillAlt className="mr-2 text-gray-500" />;
      default:
        return <FaMoneyBillAlt className="mr-2" />;
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.walletNumberMasked) {
      toast.error("Please enter a valid wallet number");
      return;
    }

    try {
      const paymentDetails = {
        type: newPaymentMethod.type,
        walletNumberMasked: newPaymentMethod.walletNumberMasked,
        msisdn: newPaymentMethod.msisdn,
        label: newPaymentMethod.label || `${newPaymentMethod.type} ${newPaymentMethod.walletNumberMasked}`,
        isDefault: newPaymentMethod.isDefault,
      };

      const addedMethod = await addPaymentMethod(paymentDetails);
      setSelectedPaymentMethod(addedMethod);
      setAddingNewPayment(false);
      toast.success("Payment method added successfully!");
    } catch (error) {
      toast.error("Failed to add payment method");
      console.error(error);
    }
  };

  const isMobilePaymentSelected = selectedPaymentMethod && 
    ['bkash', 'nagad'].includes(selectedPaymentMethod.type.toLowerCase());

  return (
    <div className="container mx-auto mb-12 p-0 md:p-6 bg-[#f3f3f3] min-h-screen">
      <ToastContainer />
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left: Shipping & Payment */}
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#232f3e]">Checkout</h2>

          {/* Shipping Info */}
          <div className="p-4 bg-white shadow rounded-xl space-y-4 mb-6">
            <h3 className="text-xl font-bold mb-2 text-[#232f3e]">Shipping Information</h3>
            
            {address && (
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={useSavedAddress}
                    onChange={(e) => {
                      setUseSavedAddress(e.target.checked);
                      if (e.target.checked) {
                        setShippingInfo({
                          fullName: user?.fullName || "",
                          address: address.street || "",
                          city: address.city || "",
                          postalCode: address.zipCode || "",
                          state: address.state || "",
                          country: address.country || "",
                          phone: user?.phoneNumber || "",
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <span>Use my saved address</span>
                </label>
              </div>
            )}

            {useSavedAddress && address ? (
              <div className="space-y-2">
                <p className="font-medium">{user?.fullName}</p>
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.country}</p>
                <p className="text-blue-600">{user?.phoneNumber}</p>
                <button
                  onClick={() => setUseSavedAddress(false)}
                  className="mt-2 text-blue-500 hover:underline"
                >
                  Use a different address
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {["fullName", "address", "city", "postalCode", "state", "country", "phone"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700">
                      {field === 'postalCode' ? 'Postal Code' : 
                       field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type={field === 'phone' ? 'tel' : 'text'}
                      name={field}
                      value={shippingInfo[field] || ""}
                      onChange={handleAddressChange}
                      className="mt-1 p-2 border rounded w-full"
                      required
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!validateShippingInfo()) return;
                      await updateAddress({
                        street: shippingInfo.address,
                        city: shippingInfo.city,
                        zipCode: shippingInfo.postalCode,
                        state: shippingInfo.state,
                        country: shippingInfo.country
                      });
                      setUseSavedAddress(true);
                      toast.success("Address saved successfully!");
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method */}
          <div className="p-4 bg-white shadow rounded-xl space-y-4 mb-6">
            <h3 className="text-xl font-bold mb-2 text-[#232f3e]">Payment Method</h3>

            {!addingNewPayment ? (
              <div className="space-y-4">
                <select
                  value={selectedPaymentMethod?._id || ""}
                  onChange={(e) => {
                    const methodId = e.target.value;
                    const method = paymentMethods.find(m => m._id === methodId) || 
                      { _id: "cash", type: "cash", label: "Cash on Delivery" };
                    setSelectedPaymentMethod(method);
                  }}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select a payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method._id} value={method._id}>
                      {method.label || `${method.type.toUpperCase()} ${method.walletNumberMasked || method.last4 || ''}`}
                    </option>
                  ))}
                  <option value="Cash On Delivery">Cash on Delivery</option>
                </select>

                {selectedPaymentMethod && (
  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
    {renderPaymentIcon(selectedPaymentMethod.type)}
    <div className="flex flex-col">
      <span className="font-medium">
        {selectedPaymentMethod.label ||
          (selectedPaymentMethod.type === 'cash'
            ? 'Cash on Delivery'
            : `${selectedPaymentMethod.type.toUpperCase()} ${selectedPaymentMethod.walletNumberMasked || selectedPaymentMethod.last4 || ''}`)}
      </span>
      {selectedPaymentMethod.type !== 'cash' && selectedPaymentMethod.walletNumberMasked && (
        <span className="text-sm text-gray-500">
          Wallet: {selectedPaymentMethod.walletNumberMasked}
        </span>
      )}
    </div>
  </div>
)}


                <button
                  onClick={() => setAddingNewPayment(true)}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <FaPlus className="mr-1" /> Add new payment method
                </button>

                {/* Mobile payment transaction details */}
                {isMobilePaymentSelected && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                      <input
                        type="text"
                        value={selectedPaymentMethod.msisdn || selectedPaymentMethod.walletNumberMasked}
                        className="mt-1 p-2 border rounded w-full bg-gray-100"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Send Money To This Number</label>
                      <input
                        type="text"
                        value={"+8801873886367"}
                        className="mt-1 p-2 border rounded w-full bg-gray-100"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction Number (TRX ID)*</label>
                      <input
                        type="text"
                        value={transactionNumber}
                        onChange={(e) => setTransactionNumber(e.target.value)}
                        className="mt-1 p-2 border rounded w-full"
                        required
                        placeholder="Enter your bKash/Nagad transaction ID"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Please complete the payment first and then enter the transaction ID here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Add New Payment Method</h4>
                  <button 
                    onClick={() => setAddingNewPayment(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['bkash', 'nagad', 'card'].map(type => (
                    <button
                      key={type}
                      onClick={() => setNewPaymentMethod(prev => ({ ...prev, type }))}
                      className={`p-2 border rounded-lg flex flex-col items-center ${
                        newPaymentMethod.type === type 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      {renderPaymentIcon(type)}
                      <span className="mt-1 text-sm">
                        {type === 'bkash' ? 'bKash' : 
                         type === 'nagad' ? 'Nagad' : 'Card'}
                      </span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newPaymentMethod.type === 'card' ? 'Card Number' : 'Wallet Number'}
                  </label>
                  <input
                    type="text"
                    name="walletNumberMasked"
                    value={newPaymentMethod.walletNumberMasked}
                    onChange={handleNewPaymentChange}
                    className="w-full p-2 border rounded"
                    placeholder={
                      newPaymentMethod.type === 'card' 
                        ? '1234 5678 9012 3456' 
                        : '01XXXXXXXXX'
                    }
                  />
                </div>

                {newPaymentMethod.type !== 'card' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number (optional)
                    </label>
                    <input
                      type="text"
                      name="msisdn"
                      value={newPaymentMethod.msisdn}
                      onChange={handleNewPaymentChange}
                      className="w-full p-2 border rounded"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nickname (optional)
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={newPaymentMethod.label}
                    onChange={handleNewPaymentChange}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., My bKash, Personal Card"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="defaultPayment"
                    name="isDefault"
                    checked={newPaymentMethod.isDefault}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="defaultPayment" className="text-sm text-gray-700">
                    Set as default payment method
                  </label>
                </div>

                <button
                  onClick={handleAddPaymentMethod}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Save Payment Method
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary with Checkout Buttons */}
        <div className="w-full lg:w-96">
          <div className="p-6 bg-white rounded-xl shadow-lg sticky top-24">
            <h3 className="text-2xl font-bold mb-6 text-[#232f3e]">Order Summary</h3>
            
            {/* Cart Items */}
            <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <li key={`${item.productId}-${item.variantId}`} className="flex items-start gap-4 pb-4 border-b border-gray-100">
                    <img 
                      src={item.mainImage} 
                      alt={item.name} 
                      className="w-16 h-16 object-contain rounded-lg border border-gray-200" 
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                      {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      <button 
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-red-500 hover:text-red-700 mt-1"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-500 py-4">Your cart is empty</li>
              )}
            </ul>

            {/* Order Totals */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${mainTotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <>
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span>- ${discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-purple-600">
                    <span>Discount Percentage</span>
                    <span>{discountPercentage.toFixed(2)}%</span>
                  </div>
                </>
              )}
              
              {coupon?.code && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Applied</span>
                  <span>{coupon.code}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold pt-2 mt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${totalAfterDiscount.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Buttons - Moved to Order Summary */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className={`w-full px-6 py-3 rounded-lg text-white font-medium text-lg ${
                  loading ? "bg-gray-400 cursor-not-allowed" : 
                  "bg-blue-600 hover:bg-blue-700 shadow-md"
                } transition-colors`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Place Order"
                )}
              </button>
              
              <button
                onClick={() => navigate("/cart")}
                disabled={loading}
                className="w-full px-6 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;