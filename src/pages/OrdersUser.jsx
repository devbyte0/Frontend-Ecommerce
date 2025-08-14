import React, { useEffect, useState, useContext, useMemo } from 'react';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

function OrdersListPage() {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [cancelError, setCancelError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const API_BASE = import.meta.env.VITE_API_URI;
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URI || API_BASE;

  // Format currency utility
  const formatCurrency = (amount, currency = 'BDT', locale = 'en-BD') => {
    if (typeof amount !== 'number') return '0.00';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${currency}`;
    }
  };

  // Mask phone number utility
  const maskPhone = (num) => {
    if (!num) return '';
    const digits = num.replace(/\D/g, '');
    if (digits.length < 7) return num.replace(/\d/g, '*');
    const masked = `${digits.slice(0, 4)}${'*'.repeat(Math.max(0, digits.length - 7))}${digits.slice(-3)}`;
    return num.startsWith('+') ? `+${masked}` : masked;
  };

  // Build payment details utility
  const buildPaymentDetails = (order) => {
    if (!order?.paymentDetails) return [];
    const method = (order.paymentMethod || '').toLowerCase();
    const pd = order.paymentDetails;

    const walletMasked = pd.walletNumberMasked || 
      (pd.mobileNumber ? maskPhone(pd.mobileNumber) : null);

    const details = [];
    if (walletMasked) {
      details.push({ label: 'Wallet', value: walletMasked });
    }

    if (['bkash', 'nagad', 'rocket', 'upay'].includes(method)) {
      if (pd.transactionNumber) {
        details.push({ label: 'TRX ID', value: pd.transactionNumber });
      }
    }

    const shownKeys = new Set(['walletNumberMasked', 'mobileNumber', 'transactionNumber']);
    Object.entries(pd).forEach(([k, v]) => {
      if (v == null || v === '' || shownKeys.has(k)) return;
      const label = k
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase());
      details.push({ label, value: String(v) });
    });

    return details;
  };

 // Initialize socket connection
useEffect(() => {
  if (!user) return;

  const newSocket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Join user-specific room
  newSocket.emit('joinUserRoom', user._id);

  newSocket.on('connect', () => {
    setConnectionStatus('connected');
    console.log('Socket connected');
  });

  newSocket.on('disconnect', () => {
    setConnectionStatus('disconnected');
    console.log('Socket disconnected');
  });

  newSocket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
    setConnectionStatus('error');
  });

  setSocket(newSocket);

  return () => {
    newSocket.disconnect();
  };
}, [user, SOCKET_URL]);

// Socket event listeners
useEffect(() => {
  if (!socket) return;

  const handleOrderUpdate = ({ eventType, order }) => {
    switch (eventType) {
      case 'create':
        setOrders(prevOrders => [order, ...prevOrders]);
        showNotification(`New order received: #${order.orderId}`);
        break;
      case 'update':
        setOrders(prevOrders => 
          prevOrders.map(o => o._id === order._id ? order : o)
        );
        showNotification(`Order #${order.orderId} was updated`);
        break;
      case 'cancel':
        setOrders(prevOrders => 
          prevOrders.map(o => o._id === order._id ? order : o)
        );
        showNotification(`Order #${order.orderId} was cancelled`);
        break;
      default:
        console.warn('Unknown order update type:', eventType);
    }
  };

  // Listen to user-specific order updates
  socket.on(`user:orderUpdate:${user._id}`, handleOrderUpdate);

  return () => {
    socket.off(`user:orderUpdate:${user._id}`, handleOrderUpdate);
  };
}, [socket, user?._id]);

  // Fetch orders effect
  useEffect(() => {
    if (!user) {
      setError('You must be logged in to view your orders.');
      setLoading(false);
      return;
    }
    if (!API_BASE) {
      setError('Missing API base URL configuration.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/orders`, {
          params: { userId: user._id },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (isMounted) {
          const list = Array.isArray(res.data) ? res.data : [];
          list.sort((a, b) => {
            const ta = new Date(a?.createdAt || 0).getTime();
            const tb = new Date(b?.createdAt || 0).getTime();
            return tb - ta;
          });
          setOrders(list);
          setFilteredOrders(list);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load orders');
          if (socket) {
            socket.emit('error', {
              userId: user._id,
              error: err.message,
              component: 'OrdersListPage'
            });
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [user, API_BASE, socket]);

  // Filter orders effect
  useEffect(() => {
    let result = [...orders];

    // Apply search term filter (order ID)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.orderId?.toString().toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => 
        order.orderStatus?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(now.getDate() - 7);
            return orderDate >= oneWeekAgo;
          case 'month':
            const oneMonthAgo = new Date(now);
            oneMonthAgo.setMonth(now.getMonth() - 1);
            return orderDate >= oneMonthAgo;
          case 'year':
            const oneYearAgo = new Date(now);
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            return orderDate >= oneYearAgo;
          case 'custom':
            if (!startDate || !endDate) return true;
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include entire end day
            return orderDate >= start && orderDate <= end;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, dateFilter, startDate, endDate]);

const handleCancelOrder = async (orderId) => {
  if (!window.confirm('Are you sure you want to cancel this order?')) {
    return;
  }

  try {
    setCancelLoadingId(orderId);
    setCancelError('');

    const res = await axios.patch(
      `${API_BASE}/api/orders/${orderId}/cancel`,
      {}, // Empty body since we don't need cancellation reason
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
        },
      }
    );

    // Success notification with custom styling
    toast.success(res.data.message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
    
    // Optimistically update the order status
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === orderId 
          ? { ...order, orderStatus: 'canceled' } 
          : order
      )
    );
    
  } catch (err) {
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        'Failed to cancel order';
    setCancelError(errorMessage);
    
    // Error notification with custom styling
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  } finally {
    setCancelLoadingId(null);
  }
};
// Socket.IO listener remains the same
useEffect(() => {
  if (!socket || !user?._id) return;

  const handleOrderCancelled = (updatedOrder) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    toast.info(`Order #${updatedOrder.orderId} was cancelled`);
  };

  socket.on(`user:orderUpdate:${user._id}`, (data) => {
    if (data.eventType === 'cancel') {
      handleOrderCancelled(data.order);
    }
  });

  return () => {
    socket.off(`user:orderUpdate:${user._id}`);
  };
}, [socket, user?._id]);

// Socket.IO listener in your component
useEffect(() => {
  if (!socket || !user?._id) return;

  const handleOrderCancelled = (updatedOrder) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    toast.info(`Order #${updatedOrder.orderId} was cancelled`);
  };

  socket.on(`user:orderUpdate:${user._id}`, (data) => {
    if (data.eventType === 'cancel') {
      handleOrderCancelled(data.order);
    }
  });

  return () => {
    socket.off(`user:orderUpdate:${user._id}`);
  };
}, [socket, user?._id]);

  // Status color utility
  const getStatusColor = (status, colorMap) => {
    if (!status) return colorMap.default;
    return colorMap[status.toLowerCase()] || colorMap.default;
  };

  const statusColors = {
    pending: 'text-yellow-600 font-semibold',
    processing: 'text-blue-600 font-semibold',
    shipped: 'text-indigo-600 font-semibold',
    delivered: 'text-green-600 font-semibold',
    canceled: 'text-red-600 font-semibold',
    cancelled: 'text-red-600 font-semibold',
    default: 'text-gray-700 font-semibold',
  };

  const paymentColors = {
    pending: 'text-yellow-600 font-semibold',
    completed: 'text-green-600 font-semibold',
    failed: 'text-red-600 font-semibold',
    refunded: 'text-purple-600 font-semibold',
    default: 'text-gray-700 font-semibold',
  };

  const connectionStatusColors = {
    connected: 'text-green-600',
    disconnected: 'text-gray-600',
    error: 'text-red-600',
    connecting: 'text-yellow-600'
  };

  const currency = useMemo(() => 'BDT', []);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'canceled', label: 'Canceled' },
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="animate-pulse text-lg">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center mt-20">
        <p className="text-lg">You have no orders yet.</p>
        <Link
          to="/"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Your Orders
          </h1>
          <div className={`text-sm ${connectionStatusColors[connectionStatus]}`}>
            {connectionStatus === 'connected' ? (
              <span>Live updates connected</span>
            ) : connectionStatus === 'connecting' ? (
              <span>Connecting to live updates...</span>
            ) : (
              <span>Live updates disconnected</span>
            )}
          </div>
        </div>

        {cancelError && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{cancelError}</p>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-4">
          <div className="md:col-span-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Order ID
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by order ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Date
            </label>
            <select
              id="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              {dateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
                setStartDate('');
                setEndDate('');
              }}
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>

          {dateFilter === 'custom' && (
            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No orders match your search criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
                setStartDate('');
                setEndDate('');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const paymentDetails = buildPaymentDetails(order);
              const createdAt = order?.createdAt 
                ? new Date(order.createdAt).toLocaleString() 
                : 'N/A';
              const total = order?.totalAmount || 0;
              const discount = order?.discountAmount || 0;

              return (
                <div
                  key={order.orderId}
                  className="border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <Link
                      to={`/orders/${order.orderId}`}
                      className="text-blue-600 hover:underline font-semibold text-lg"
                    >
                      Order #{order.orderId}
                    </Link>
                    <span className="text-sm text-gray-500">
                      {createdAt}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700">
                        <span className="font-semibold">Status:</span>{' '}
                        <span className={getStatusColor(order.orderStatus, statusColors)}>
                          {order.orderStatus || 'N/A'}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Payment Status:</span>{' '}
                        <span className={getStatusColor(order.paymentStatus, paymentColors)}>
                          {order.paymentStatus || 'N/A'}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Payment Method:</span>{' '}
                        {(order.paymentMethod || 'N/A').toUpperCase()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-700">
                        <span className="font-semibold">Total Amount:</span>{' '}
                        {formatCurrency(total, currency)}
                      </p>
                      {discount > 0 && (
                        <p className="text-green-700">
                          <span className="font-semibold">Discount:</span>{' '}
                          {formatCurrency(discount, currency)}
                        </p>
                      )}
                    </div>
                  </div>

                  {paymentDetails.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Payment Details
                      </h4>
                      <ul className="space-y-1">
                        {paymentDetails.map((detail, idx) => (
                          <li key={idx} className="flex">
                            <span className="font-medium min-w-[120px]">
                              {detail.label}:
                            </span>
                            <span>{detail.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {order.shippingAddress && (
                    <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Shipping Address
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <p>{order.shippingAddress.fullName}</p>
                        <p>Phone: {order.shippingAddress.phone}</p>
                        <p className="md:col-span-2">
                          {order.shippingAddress.address}
                        </p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  )}

                  {order.items?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div
                            key={item._id || index}
                            className="flex items-start gap-4 p-3 border border-gray-200 rounded"
                          >
                            <img
                              src={item.mainImage}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                              loading="lazy"
                            />
                            <div className="flex-1">
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.color && `Color: ${item.color}`}
                                {item.size && `, ${item.measureType}: ${item.size} ${item.unitName || ''}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} | Price: {formatCurrency(item.price || 0, currency)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.orderStatus?.toLowerCase() === 'pending' && (
                    <div className="mt-6 flex justify-end">
                      <button
                        disabled={cancelLoadingId === order.orderId}
                        onClick={() => handleCancelOrder(order.orderId)}
                        className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {cancelLoadingId === order.orderId ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersListPage;