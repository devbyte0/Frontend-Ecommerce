import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { UserContext } from '../context/UserContext'; 
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

import { FaMoneyBillAlt } from 'react-icons/fa';
import { FaMobileAlt } from 'react-icons/fa';

function CheckoutPage() {
    const { cartItems, totalPrice, clearCart } = useContext(CartContext);
    const { user, savedAddress, savedPaymentMethod, isLoggedIn } = useContext(UserContext);
    const [shippingInfo, setShippingInfo] = useState(savedAddress || {});
    const [paymentMethod, setPaymentMethod] = useState(savedPaymentMethod || null);
    const [paymentType, setPaymentType] = useState(null);
    const [transactionNumber, setTransactionNumber] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
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

        if (!paymentType) {
            toast.error('Please select a payment method.');
            return;
        }

        if (['bKash', 'Nagad'].includes(paymentType)) {
            if (!mobileNumber) {
                toast.error('Please provide a valid mobile number.');
                return;
            }

            if (transactionNumber.length < 8 || transactionNumber.length > 12) {
                toast.error('Please provide a valid transaction number.');
                return;
            }
        }

        toast.success('Order placed successfully!');
        clearCart();
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
                            onClick={() => setShippingInfo({})}
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
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="paymentType"
                            value="Cash on Delivery"
                            checked={paymentType === 'Cash on Delivery'}
                            onChange={(e) => setPaymentType(e.target.value)}
                            className="mr-2"
                        />
                        <FaMoneyBillAlt className="mr-2 text-green-500" />
                        Cash on Delivery
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="paymentType"
                            value="bKash"
                            checked={paymentType === 'bKash'}
                            onChange={(e) => setPaymentType(e.target.value)}
                            className="mr-2"
                        />
                        <FaMobileAlt className="mr-2 text-pink-500" />
                        bKash
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="paymentType"
                            value="Nagad"
                            checked={paymentType === 'Nagad'}
                            onChange={(e) => setPaymentType(e.target.value)}
                            className="mr-2"
                        />
                        <FaMobileAlt className="mr-2 text-orange-500" />
                        Nagad
                    </label>
                </div>

                {/* Show Mobile Number and Transaction Number Inputs */}
                {['bKash', 'Nagad'].includes(paymentType) && (
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input
                                type="text"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                className="mt-1 p-2 border rounded w-full"
                                placeholder="Enter your bKash/Nagad number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Transaction Number</label>
                            <input
                                type="text"
                                value={transactionNumber}
                                onChange={(e) => setTransactionNumber(e.target.value)}
                                className="mt-1 p-2 border rounded w-full"
                                placeholder="Enter the transaction number"
                            />
                        </div>
                    </div>
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
