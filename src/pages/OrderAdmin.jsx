import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAdmin } from '../context/AdminContext';

const statusColors = {
  orderStatus: {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  },
  paymentStatus: {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800',
  },
};

const paymentMethodIcons = {
  bkash: 'text-[#e2136e]',
  nagad: 'text-[#e21818]',
  cash: 'text-gray-600',
};

const API_BASE_URL = import.meta.env.VITE_API_URI || '';

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const AdminOrdersPage = () => {
  const { isAuthenticated, loading: authLoading, logout } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const socketRef = useRef(null);

  // Initialize Socket.IO connection when authenticated
 // In your AdminOrdersPage component
useEffect(() => {
  if (!isAuthenticated) return;

  const socket = io(API_BASE_URL, {
    withCredentials: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 5000,
  });

  // Join admin room
  socket.emit('joinAdminRoom');

  socket.on('admin:newOrder', (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    showNotification(`New order #${newOrder.orderId}`);
  });

  socket.on('admin:updateOrder', (updatedOrder) => {
    setOrders(prev => prev.map(order => 
      order._id === updatedOrder._id ? updatedOrder : order
    ));
    if (editingOrder?._id === updatedOrder._id) {
      setEditingOrder(updatedOrder);
    }
    showNotification(`Order #${updatedOrder.orderId} updated`);
  });

  socket.on('admin:cancelOrder', (cancelledOrder) => {
    setOrders(prev => prev.map(order => 
      order._id === cancelledOrder._id ? cancelledOrder : order
    ));
    showNotification(`Order #${cancelledOrder.orderId} cancelled`);
  });

  socket.on('admin:orderDeleted', (deletedOrder) => {
    setOrders(prev => prev.filter(order => order._id !== deletedOrder._id));
    showNotification(`Order #${deletedOrder.orderId} deleted`);
  });

  return () => {
    socket.disconnect();
  };
}, [isAuthenticated, editingOrder]);

  const showNotification = (message) => {
    if (Notification.permission === 'granted') {
      new Notification('Order Update', { body: message });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Order Update', { body: message });
        }
      });
    }
    console.log('Notification:', message);
  };

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/allorders?page=${page}&limit=${pagination.limit}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`
        }
      });
      
      if (res.data && Array.isArray(res.data.data)) {
        setOrders(res.data.data);
        setPagination({
          page: res.data.meta.page,
          limit: res.data.meta.limit,
          total: res.data.meta.total,
          pages: res.data.meta.pages
        });
      } else {
        setOrders([]);
        setError('Orders data is invalid');
      }
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      }
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/admin/login';
    } else if (isAuthenticated) {
      fetchOrders(currentPage);
    }
  }, [isAuthenticated, authLoading, currentPage]);

  const filteredOrders = orders.filter(order => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      order.orderId.toString().toLowerCase().includes(searchLower) ||
      order.userId.toLowerCase().includes(searchLower) ||
      (order.shippingAddress?.fullName?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleUpdateStatus = async (orderId, field, value) => {
    try {
      setUpdatingOrderId(orderId);
      await axios.patch(
        `${API_BASE_URL}/api/orders/${orderId}/status`, 
        { [field]: value },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`
          }
        }
      );
      await fetchOrders(currentPage);
      if (editingOrder?._id === orderId) {
        setEditingOrder(prev => ({ ...prev, [field]: value }));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      }
      alert('Failed to update status');
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`
          }
        }
      );
      await fetchOrders(currentPage);
      if (editingOrder?._id === orderId) setEditingOrder(null);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      }
      alert('Failed to cancel order');
      console.error(err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await axios.delete(
        `${API_BASE_URL}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`
          }
        }
      );
      await fetchOrders(currentPage);
      if (editingOrder?._id === orderId) setEditingOrder(null);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      }
      alert('Failed to delete order');
      console.error(err);
    }
  };

  const startEditing = (order) => {
    setEditingOrder(order);
  };

  const cancelEditing = () => {
    setEditingOrder(null);
  };

  const isMobilePayment = (order) => {
    return order.paymentMethod && ['bkash', 'nagad'].includes(order.paymentMethod.toLowerCase());
  };

  const getPaymentMethodIcon = (method) => {
    if (!method) return null;
    const methodLower = method.toLowerCase();
    if (methodLower.includes('bkash')) return 'text-[#e2136e]';
    if (methodLower.includes('nagad')) return 'text-[#e21818]';
    if (methodLower.includes('cash')) return 'text-gray-600';
    return 'text-blue-600';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 md:pt-40 sm:ml-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 md:pt-40 sm:ml-64 flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search by Order ID, User ID or Name..."
              className="px-4 py-2 border rounded w-full bg-white max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={() => fetchOrders(currentPage)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {editingOrder && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold">
                Order Details #{editingOrder.orderId}
                <span className="ml-4 text-sm font-normal text-gray-500">
                  {formatDate(editingOrder.createdAt)}
                </span>
              </h2>
              <button
                onClick={cancelEditing}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{editingOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-medium">{editingOrder.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{formatDate(editingOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span>{formatDate(editingOrder.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active:</span>
                    <span className={editingOrder.isActive ? 'text-green-600' : 'text-red-600'}>
                      {editingOrder.isActive ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method:</span>
                    <div className="flex items-center">
                      <span className={`mr-2 ${getPaymentMethodIcon(editingOrder.paymentMethod)}`}>
                        {editingOrder.paymentMethod === 'bkash' && (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                          </svg>
                        )}
                        {editingOrder.paymentMethod === 'nagad' && (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                          </svg>
                        )}
                        {editingOrder.paymentMethod?.toLowerCase().includes('cash') && (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                          </svg>
                        )}
                      </span>
                      <span className="font-medium">
                        {editingOrder.paymentMethod || 'N/A'}
                        {editingOrder.selectedPaymentMethod?.label && (
                          <span className="text-sm text-gray-500 block">{editingOrder.selectedPaymentMethod.label}</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      statusColors.paymentStatus[editingOrder.paymentStatus] || 'bg-gray-100'
                    }`}>
                      {editingOrder.paymentStatus.charAt(0).toUpperCase() + editingOrder.paymentStatus.slice(1)}
                    </span>
                  </div>
                  
                  {isMobilePayment(editingOrder) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono">
                        {editingOrder.paymentDetails?.trxId || 'Not provided'}
                      </span>
                    </div>
                  )}
                  
                  {isMobilePayment(editingOrder) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wallet Number:</span>
                      <span className="font-mono">
                        {editingOrder.paymentDetails?.walletNumberMasked || 
                         editingOrder.selectedPaymentMethod?.walletNumberMasked || 
                         'Not provided'}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(editingOrder.totalAmount + editingOrder.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-red-600">-{formatCurrency(editingOrder.discountAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2 mt-2">
                    <span className="text-gray-700">Total:</span>
                    <span className="text-lg">{formatCurrency(editingOrder.totalAmount || 0)}</span>
                  </div>
                  {editingOrder.couponCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coupon:</span>
                      <span className="text-blue-600">{editingOrder.couponCode}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Customer Information</h3>
                {editingOrder.shippingAddress ? (
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">{editingOrder.shippingAddress.fullName}</p>
                      <p className="text-blue-600">{editingOrder.shippingAddress.phone}</p>
                    </div>
                    <div className="text-sm">
                      <p>{editingOrder.shippingAddress.address}</p>
                      <p>{editingOrder.shippingAddress.city}, {editingOrder.shippingAddress.state}</p>
                      <p>{editingOrder.shippingAddress.postalCode}, {editingOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No shipping address provided</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-3">Order Status</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusColors.orderStatus).map(([status, colorClass]) => (
                    <button
                      key={status}
                      disabled={updatingOrderId === editingOrder._id}
                      onClick={() => handleUpdateStatus(editingOrder._id, 'orderStatus', status)}
                      className={`px-4 py-2 rounded transition ${
                        editingOrder.orderStatus === status 
                          ? `${colorClass} ring-2 ring-offset-2 ring-gray-400`
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-3">Payment Status</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusColors.paymentStatus).map(([status, colorClass]) => (
                    <button
                      key={status}
                      disabled={updatingOrderId === editingOrder._id}
                      onClick={() => handleUpdateStatus(editingOrder._id, 'paymentStatus', status)}
                      className={`px-4 py-2 rounded transition ${
                        editingOrder.paymentStatus === status 
                          ? `${colorClass} ring-2 ring-offset-2 ring-gray-400`
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Order Items ({editingOrder.items.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editingOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-md object-cover" src={item.mainImage} alt={item.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">SKU: {item.productId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span className="ml-2">Color: {item.color}</span>}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.measureType && <span>{item.measureType}: {item.unitName}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-end border-t pt-6">
              <button
                disabled={updatingOrderId === editingOrder._id}
                onClick={() => handleCancelOrder(editingOrder._id)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                Cancel Order
              </button>
              <button
                disabled={updatingOrderId === editingOrder._id}
                onClick={() => handleDeleteOrder(editingOrder._id)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Delete Order
              </button>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.shippingAddress?.fullName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{order.userId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(order.totalAmount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`mr-1 ${getPaymentMethodIcon(order.paymentMethod)}`}>
                            {order.paymentMethod === 'bkash' && (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                              </svg>
                            )}
                            {order.paymentMethod === 'nagad' && (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                              </svg>
                            )}
                            {order.paymentMethod?.toLowerCase().includes('cash') && (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                              </svg>
                            )}
                          </span>
                          <span className="text-sm">
                            {order.paymentMethod || 'N/A'}
                          </span>
                        </div>
                        {isMobilePayment(order) && order.paymentDetails?.trxId && (
                          <div className="text-xs text-gray-500 mt-1">
                            TRX: {order.paymentDetails.trxId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors.orderStatus[order.orderStatus] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => startEditing(order)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredOrders.length > ordersPerPage && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> of{' '}
                    <span className="font-medium">{filteredOrders.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">First</span>
                      &laquo;
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      &lsaquo;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      &rsaquo;
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Last</span>
                      &raquo;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;