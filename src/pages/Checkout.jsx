import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { UserContext } from '../context/UserContext'; // Assuming this context provides login info
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

function CheckoutPage() {
    const { cartItems, totalPrice, clearCart } = useContext(CartContext);
    const { user, savedAddress, savedPaymentMethod, isLoggedIn } = useContext(UserContext); // Sample fields from UserContext
    const [shippingInfo, setShippingInfo] = useState(savedAddress || {});
    const [paymentMethod, setPaymentMethod] = useState(savedPaymentMethod || null);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to login if not logged in
        if (!isLoggedIn) {
            toast.info('Please log in to proceed to checkout.');
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
    };

    const handleCheckout = () => {
        if (!Object.values(shippingInfo).every((field) => field)) {
            toast.error('Please fill out all address fields.');
            return;
        }

        if (!paymentMethod) {
            toast.error('Please select a payment method.');
            return;
        }

        // Handle order processing logic here (e.g., payment gateway integration)

        toast.success('Order placed successfully!');
        clearCart(); // Clear the cart after successful checkout
    };

    return (
        <div className="container mx-auto mb-[50px] p-4 md:p-6">
            <ToastContainer />
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Checkout</h2>

            {/* Address Section */}
            <div className="p-4 bg-white shadow rounded-md space-y-4">
                <h3 className="text-xl font-semibold mb-2">Shipping Information</h3>
                {savedAddress ? (
                    <div>
                        <p>{savedAddress.name}</p>
                        <p>{savedAddress.address}</p>
                        <p>{savedAddress.city}, {savedAddress.state} {savedAddress.zipCode}</p>
                        <p>{savedAddress.phone}</p>
                        <button
                            onClick={() => setShippingInfo({})} // Allow changing the address
                            className="mt-2 text-blue-500 hover:underline"
                        >
                            Use a different address
                        </button>
                    </div>
                ) : (
                    <form className="space-y-4">
                        {['name', 'address', 'city', 'state', 'zipCode', 'phone'].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700">
                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                </label>
                                <input
                                    type="text"
                                    name={field}
                                    value={shippingInfo[field] || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 border rounded w-full"
                                    required
                                />
                            </div>
                        ))}
                    </form>
                )}
            </div>

            {/* Payment Method Section */}
            <div className="mt-6 p-4 bg-white shadow rounded-md space-y-4">
                <h3 className="text-xl font-semibold mb-2">Payment Method</h3>
                {paymentMethod ? (
                    <div>
                        <p>Card ending in {paymentMethod.last4}</p>
                        <p>Expires {paymentMethod.expiry}</p>
                        <button
                            onClick={() => setPaymentMethod(null)} // Allow changing the payment method
                            className="mt-2 text-blue-500 hover:underline"
                        >
                            Use a different payment method
                        </button>
                    </div>
                ) : (
                    <form className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Credit Card Number</label>
                        <input
                            type="text"
                            name="cardNumber"
                            onChange={(e) => setPaymentMethod({ ...paymentMethod, cardNumber: e.target.value })}
                            className="mt-1 p-2 border rounded w-full"
                            required
                        />
                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                        <input
                            type="text"
                            name="expiry"
                            placeholder="MM/YY"
                            onChange={(e) => setPaymentMethod({ ...paymentMethod, expiry: e.target.value })}
                            className="mt-1 p-2 border rounded w-full"
                            required
                        />
                        <label className="block text-sm font-medium text-gray-700">CVV</label>
                        <input
                            type="text"
                            name="cvv"
                            onChange={(e) => setPaymentMethod({ ...paymentMethod, cvv: e.target.value })}
                            className="mt-1 p-2 border rounded w-full"
                            required
                        />
                    </form>
                )}
            </div>

            {/* Order Summary */}
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
                <h3 className="text-xl font-semibold">Order Summary</h3>
                <ul className="mt-2 space-y-2">
                    {cartItems.map((item) => (
                        <li key={item.productId} className="flex justify-between text-gray-700">
                            <span>{item.name} x {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-4 text-lg font-semibold">Total: ${totalPrice.toFixed(2)}</p>
            </div>

            {/* Place Order Button */}
            <button
                onClick={handleCheckout}
                className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Place Order
            </button>
        </div>
    );
}

export default CheckoutPage;
