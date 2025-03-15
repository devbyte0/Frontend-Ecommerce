import React, { createContext, useState, useMemo, useEffect, useContext, useCallback } from 'react';
import { UserContext } from './UserContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isLoggedIn } = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // Move formatCartItem to the top before any hooks that use it
  const formatCartItem = useCallback((item) => ({
    ...item,
    productId: item.productId?._id || item.productId,
    price: item.price || 0,
    discountApplied: item.discountApplied || 0,
    guestItemId: item.guestItemId || 
      `${item.productId}-${item.variantId || ''}-${item.size || ''}-${item.color || ''}`
  }), []); // Empty dependency array since it doesn't depend on external values


  // Now define fetchCart after formatCartItem
  const fetchCart = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URI}/api/cart/${user._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Remove the syncCart call here
      const formattedItems = res.data.items.map(formatCartItem);
      setCartItems(formattedItems);
      setCoupon(res.data.couponId);
      setDiscount(res.data.discountAmount || 0);
    } catch (error) {
      handleCartError(error, 'Failed to fetch cart');
    }
  }, [user?._id, formatCartItem]);

  // Update syncCart to handle guest items properly
 const syncCart = useCallback(async (localCartItems) => {
  if (!user?._id) return;

  try {
    // Convert guest items to server-compatible format
    const formattedItems = localCartItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId || null,
      size: item.size || 'N/A',
      color: item.color || 'N/A',
      quantity: item.quantity,
      price: item.price,
      mainImage: item.mainImage,
      name: item.name
    }));

    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URI}/api/cart/items/sync`,
      {
        userId: user._id,
        items: formattedItems
      }
    );

    const formattedResponse = {
      ...data,
      items: data.items.map(formatCartItem)
    };

    setCartItems(formattedResponse.items);
    setCoupon(formattedResponse.couponId);
    setDiscount(formattedResponse.discountAmount || 0);

    toast.success("Cart synced successfully!");
  } catch (error) {
    console.error('Sync error:', error);
    toast.error(error.response?.data?.message );
  }
}, [user?._id, formatCartItem]);



const updateQuantity = useCallback(async (itemIdentifier, newQuantity) => {

  
  try {
    const numericQuantity = Math.max(1, Number(newQuantity) || 1);

    if (!isLoggedIn) {
      setCartItems(prev => {
        const updatedItems = prev.map(item => 
          item.guestItemId === itemIdentifier
            ? { ...item, quantity: numericQuantity }
            : item
        );
        setCartItems(updatedItems)
        // Log updated items
        console.log("Updated Guest Cart:", updatedItems);
        return updatedItems;
      });
      return;
    }

    const response = await axios.patch(
      `${import.meta.env.VITE_API_URI}/api/cart/items/${itemIdentifier}/update`,
      { 
        userId: user._id, 
        quantity: numericQuantity,
        couponId: coupon // Send current coupon ID
      }
    );

    // Update context state with all necessary fields
    setCartItems(response.data.Upcart.items.map(formatCartItem));
    setDiscount(response.data.Upcart.discountAmount);
    
    // Preserve coupon ID unless explicitly removed
    if (response.data.Upcart.couponId !== null) {
      setCoupon(response.data.Upcart.couponId);
    }

  } catch (error) {
    console.error('Update error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update quantity');
  }
}, [isLoggedIn, user?._id, coupon, formatCartItem]);

// Update useEffect to handle guest cart sync on login
useEffect(() => {
  const handleCartSync = async () => {
    if (isLoggedIn && user?._id) {
      try {
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        
        if (guestCart.length > 0) {
          // Sync guest cart with server
          await syncCart(guestCart);
          localStorage.removeItem('guestCart');
        }
        
        // Always fetch the latest cart after sync
        await fetchCart();
      } catch (error) {
        console.error('Cart sync error:', error);
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
      setCartItems(guestCart.map(formatCartItem));
    }
  };

  handleCartSync();
}, [isLoggedIn, user?._id, fetchCart, formatCartItem, syncCart]);

 



useEffect(() => {
  if (!isLoggedIn) {
    const simplifiedCart = cartItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      size: item.size,
      color: item.color,
      price: item.price,
      quantity: item.quantity,
      guestItemId: item.guestItemId,
      mainImage: item.mainImage,
      name: item.name
    }));
    localStorage.setItem('guestCart', JSON.stringify(simplifiedCart));
  }
}, [cartItems, isLoggedIn]);

 

    // Coupon handling
    const applyCoupon = useCallback(async (couponCode) => {
      if (!user?._id) {
        toast.error("Please login to apply coupons");
        return;
      }
      
      setIsLoading(true);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URI}/api/cart/${user._id}/coupon`,
          { couponCode }
        );
  console.log(res)
        setCartItems(res.data.UpCart.items);
        setDiscount(res.data.UpCart.discountAmount);
        setCoupon(res.data.UpCart.couponId);
        toast.success("Coupon applied successfully!");
      } catch (error) {
        handleCartError(error, error.response?.data?.message || "Failed to apply coupon");
        throw error;
      } finally {
        setIsLoading(false);
      }
    }, [user?._id]);
  
    const removeCoupon = useCallback(async () => {
      if (!user?._id) return;
      
      setIsLoading(true);
      try {
        const res = await axios.delete(
          `${import.meta.env.VITE_API_URI}/api/cart/${user._id}/coupon`
        );
  
        setCartItems(res.data.cart.items);
        setDiscount(0);
        setCoupon(null);
        toast.success("Coupon removed successfully!");
      } catch (error) {
        handleCartError(error, "Failed to remove coupon");
        throw error;
      } finally {
        setIsLoading(false);
      }
    }, [user?._id]);

    
  


  const addToCart = useCallback(
    async (product) => {
      if (!isLoggedIn) {
        // Create unique ID using all variant properties
        const guestItemId = `${product.productId}-${product.variantId || ''}-${
          product.size || ''
        }-${product.colorName || ''}`;
  
        setCartItems((prevItems) => {
          const existingProduct = prevItems.find(
            (item) => item.guestItemId === guestItemId
          );
          
          if (existingProduct) {
            return prevItems.map((item) =>
              item.guestItemId === guestItemId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          }
          return [...prevItems, { 
            ...product,
            quantity: 1,
            guestItemId,
            color: product.colorName // Ensure consistent color property
          }];
        });
      } else {
        if (!user?._id) return;
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/cart/items`, {
            variantId: product.variantId,
            userId: user._id,
            productId: product.productId,
            mainImage: product.mainImage,
            size: product.size,
            name: product.name,
            color: product.colorName,
            price: product.price,
            quantity: 1,
          });
          setCartItems(response.data.items || []);
          
          setDiscount(response.data.discountAmount)
          toast.success('Item added to cart');
        } catch (error) {
          console.error('Error adding item to cart:', error);
          toast.error('Failed to add item to cart');
        }
      }
    },
    [isLoggedIn, user?._id, ]
  );




  const handleCartError = (error, defaultMessage) => {
    console.error('Cart Error:', error);
    toast.error(error.response?.data?.message || defaultMessage);
  };

  // Quantity operations
  const increaseQuantity = useCallback(
    async (itemIdentifier) => {
      if (!isLoggedIn) {
        setCartItems(prev => prev.map(item => 
          item.guestItemId === itemIdentifier
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        try {
          const response = await axios.patch(
            `${import.meta.env.VITE_API_URI}/api/cart/items/${itemIdentifier}/increase`,
            { quantity: 1, userId: user._id, couponId: coupon }
          );
          setCartItems(response.data.Upcart.items);
          setDiscount(response.data.Upcart.discountAmount);
        } catch (error) {
          handleCartError(error, 'Failed to increase quantity');
        }
      }
    },
    [isLoggedIn, user?._id, coupon]
  );

  const decreaseQuantity = useCallback(
    async (itemIdentifier) => {
      if (!isLoggedIn) {
        setCartItems(prev => prev.map(item => 
          item.guestItemId === itemIdentifier
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        ));
      } else {
        try {
          const response = await axios.patch(
            `${import.meta.env.VITE_API_URI}/api/cart/items/${itemIdentifier}/decrease`,
            { quantity: -1, userId: user._id, couponId: coupon }
          );
          setCartItems(response.data.Upcart.items);
          setDiscount(response.data.Upcart.discountAmount);
        } catch (error) {
          handleCartError(error, 'Failed to decrease quantity');
        }
      }
    },
    [isLoggedIn, user?._id, coupon]
  );

  const removeItem = useCallback(
    async (itemIdentifier) => {
      if (!isLoggedIn) {
        // For guest users, remove the item locally
        setCartItems((prev) => prev.filter((item) => item.guestItemId !== itemIdentifier));
        toast.success("Item removed from cart");
      } else {
        try {
          // Call the backend API to remove the item
          const response = await axios.delete(
            `${import.meta.env.VITE_API_URI}/api/cart/items/delete/${user._id}/${itemIdentifier}`
          );
  
          // Update the cart items state with the updated cart from the response
          setCartItems(response.data.updatedCart.items);
          toast.success("Item removed from cart");
        } catch (error) {
          // Handle errors gracefully
          if (error.response) {
            // Backend returned an error response
            toast.error(error.response.data.message || "Failed to remove item from cart");
          } else if (error.request) {
            // No response received from the server
            toast.error("Network error. Please check your connection.");
          } else {
            // Something went wrong in the request setup
            toast.error("An unexpected error occurred. Please try again.");
          }
          console.error("Error removing item from cart:", error);
        }
      }
    },
    [isLoggedIn, user?._id]
  );

  const clearCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
    } else {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URI}/api/cart/${user._id}`);
        setCartItems([]);
        toast.success('Cart cleared');
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Failed to clear cart');
      }
    }
  }, [isLoggedIn, user?._id]);
  // Calculate totals
  const totalPrice = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => 
      total + (item.price * item.quantity) - (item.discountApplied || 0), 0);
    return subtotal - discount;
  }, [cartItems, discount]);

  return (
    <CartContext.Provider
    value={{
      cartItems,
      totalPrice,
      isLoading,
      coupon,
      discount,
      totalPrice: useMemo(() => cartItems.reduce((t, i) => t + (i.price * i.quantity) - (i.discountApplied || 0), 0) - discount, [cartItems, discount]),
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      syncCart,
      updateQuantity
    }}
    >
      {children}
    </CartContext.Provider>
  );
};