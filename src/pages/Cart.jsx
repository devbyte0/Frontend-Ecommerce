import React, { useEffect, useMemo, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function CartPage() {
    const navigate = useNavigate();
    const { cartItems, increaseQuantity, decreaseQuantity, removeItem, clearCart, totalPrice } = useContext(CartContext);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        console.log(cartItems); // Debug log to trace items in cart page
    }, [cartItems]);

    const handleApplyCoupon = () => {
        if (couponCode.toLowerCase() === 'save10') {
            setDiscount(10);
        } else {
            toast.error('Invalid coupon code', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const discountedPrice = useMemo(() => 
        totalPrice - (totalPrice * discount) / 100, 
        [totalPrice, discount]
    );

    return (
        <div className="container mx-auto mb-[50px] p-4 md:p-6">
            <ToastContainer />
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">Shopping Cart</h2>

            <div className="space-y-4">
                {cartItems.map((item) => (
                    <div
                        key={item.productId}
                        className="flex flex-col md:flex-row items-center p-4 bg-white shadow rounded-md"
                    >
                        <img
                            src={item.mainImage}
                            alt={item.name}
                            className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-md mb-2 md:mb-0 md:mr-4"
                        />
                        <div className="flex-grow text-center md:text-left">
                            <h3 className="text-md md:text-lg font-medium">{item.name}</h3>
                            <p className="text-gray-600 text-sm md:text-base">Price: ${item.price.toFixed(2)}</p>
                            <p className="text-gray-500 text-xs md:text-sm">Size: {item.size || 'N/A'}</p>
                            <p className="text-gray-500 text-xs md:text-sm">Color: {item.colorName || 'N/A'}</p>
                            <div className="flex items-center justify-center md:justify-start mt-2">
                                <button
                                    onClick={() => decreaseQuantity(item.productId)}
                                    className="px-3 py-1 text-base md:text-lg font-medium bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    -
                                </button>
                                <span className="mx-3 text-base md:text-lg">{item.quantity}</span>
                                <button
                                    onClick={() => increaseQuantity(item.productId)}
                                    className="px-2 py-1 text-base md:text-lg font-medium bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                onClick={() => removeItem(item.productId)}
                                className="text-red-600 mt-2 hover:underline text-sm md:text-base"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between mt-6 space-y-4 md:space-y-0">
                <button
                    onClick={() => clearCart()}
                    className="text-red-600 bg-red-100 px-4 py-2 rounded hover:bg-red-200 w-full md:w-auto"
                >
                    Delete All
                </button>

                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="px-4 py-2 border rounded-md w-full md:w-auto"
                    />
                    <button
                        onClick={handleApplyCoupon}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full md:w-auto"
                    >
                        Apply Coupon
                    </button>
                </div>
            </div>

            <div className="mt-6 p-4 flex justify-between bg-gray-100 rounded-md text-center md:text-left">
                <div>
                <h3 className="text-xl md:text-2xl font-semibold">Cart Summary</h3>
                <p className="text-md md:text-lg font-medium mt-2">Total Price: ${totalPrice.toFixed(2)}</p>
                {discount > 0 && (
                    <p className="text-md md:text-lg font-medium mt-1 text-green-600">
                        Discounted Price: ${discountedPrice.toFixed(2)}
                    </p>
                )}
                </div>
                 <button
        onClick={() => navigate('../checkout')}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
        Proceed to Checkout
    </button>
            </div>
        </div>
    );
}

export default CartPage;
