import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { usersAPI, ordersAPI } from '../services/api';

export const ProfilePage = () => {
    const { user, userLogout, isAuthenticated, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        }
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                address: user.address || {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: ''
                }
            });
        }
    }, [user, isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (activeTab === 'orders' && user?.email) {
            fetchOrders();
        }
    }, [activeTab, user]);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await ordersAPI.getUserOrders({ email: user.email });
            setOrders(res.data.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: { ...formData[parent], [child]: value }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await usersAPI.updateProfile(formData);

            if (res.data.success) {
                toast.success('Profile updated successfully!');
            } else {
                toast.error(res.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error(error.response?.data?.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Confirmed': 'bg-blue-100 text-blue-800',
            'Shipped': 'bg-purple-100 text-purple-800',
            'Delivered': 'bg-green-100 text-green-800',
            'Cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            'Unpaid': 'bg-red-100 text-red-800',
            'PendingVerification': 'bg-yellow-100 text-yellow-800',
            'Paid': 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full md:w-80"
                    >
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
                            <div className="text-center mb-8">
                                <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                                    <span className="text-3xl font-black text-primary-600">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </span>
                                </div>
                                <h2 className="text-xl font-black text-slate-900">{user?.firstName} {user?.lastName}</h2>
                                <p className="text-slate-400 font-bold text-sm tracking-tight">{user?.email}</p>
                            </div>

                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'profile'
                                            ? 'bg-primary-50 text-primary-600'
                                            : 'text-slate-400 hover:bg-slate-50'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Personal Info</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'orders'
                                            ? 'bg-primary-50 text-primary-600'
                                            : 'text-slate-400 hover:bg-slate-50'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <span>Order History</span>
                                </button>
                                <button
                                    onClick={userLogout}
                                    className="w-full flex items-center space-x-3 px-6 py-4 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 font-black transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Logout</span>
                                </button>
                            </nav>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1"
                    >
                        {activeTab === 'profile' ? (
                            <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200/50">
                                <h1 className="text-3xl font-black text-slate-900 mb-8">Account Settings</h1>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-slate-100">
                                        <h3 className="text-lg font-black text-slate-900 mb-6">Shipping Address</h3>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Street Address</label>
                                                <input
                                                    type="text"
                                                    name="address.street"
                                                    value={formData.address.street}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                                    <input
                                                        type="text"
                                                        name="address.city"
                                                        value={formData.address.city}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                                                    <input
                                                        type="text"
                                                        name="address.state"
                                                        value={formData.address.state}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Zip Code</label>
                                                    <input
                                                        type="text"
                                                        name="address.zipCode"
                                                        value={formData.address.zipCode}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary-600 hover:shadow-primary-500/40 transition-all uppercase mt-8 flex items-center justify-center space-x-2"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <span>Save Changes</span>
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200/50">
                                <h1 className="text-3xl font-black text-slate-900 mb-8">Order History</h1>

                                {ordersLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="w-24 h-24 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <p className="text-slate-500 font-bold text-lg">No orders yet</p>
                                        <p className="text-slate-400 text-sm mt-2">Your order history will appear here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="font-mono text-sm text-slate-600">Order #{order.id.slice(-8)}</p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-slate-900">₹{order.totalAmount.toLocaleString()}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{order.items.length} item(s)</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.orderStatus)}`}>
                                                        {order.orderStatus}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                        {order.paymentStatus === 'PendingVerification' ? 'Payment Pending' : order.paymentStatus}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                                        {order.paymentMethod}
                                                    </span>
                                                </div>

                                                <div className="border-t border-slate-100 pt-4">
                                                    <p className="text-sm font-bold text-slate-700 mb-2">Items:</p>
                                                    <div className="space-y-1">
                                                        {order.items.slice(0, 2).map((item, idx) => (
                                                            <p key={idx} className="text-sm text-slate-600">
                                                                • {item.name} <span className="text-slate-400">(x{item.qty})</span>
                                                            </p>
                                                        ))}
                                                        {order.items.length > 2 && (
                                                            <p className="text-sm text-slate-400">+ {order.items.length - 2} more item(s)</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <button className="mt-4 text-primary-600 hover:text-primary-700 font-bold text-sm flex items-center gap-1">
                                                    View Details
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-black text-slate-900">Order Details</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                                    <p className="font-mono font-bold text-slate-900">{selectedOrder.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                    <p className="font-bold text-slate-900">
                                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
                                    <p className="font-bold text-slate-900">{selectedOrder.paymentMethod}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                                    <p className="font-black text-primary-600 text-2xl">
                                        ₹{selectedOrder.totalAmount.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-black text-slate-900 mb-3">Status</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedOrder.orderStatus)}`}>
                                        Order: {selectedOrder.orderStatus}
                                    </span>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                                        Payment: {selectedOrder.paymentStatus === 'PendingVerification' ? 'Pending' : selectedOrder.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-black text-slate-900 mb-3">Delivery Address</h3>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="font-bold text-slate-900">{selectedOrder.customer.name}</p>
                                    <p className="text-slate-700 mt-2">
                                        {selectedOrder.customer.address}<br />
                                        {selectedOrder.customer.city} - {selectedOrder.customer.pincode}
                                    </p>
                                    <p className="text-slate-600 mt-2">{selectedOrder.customer.phone}</p>
                                    {selectedOrder.customer.email && (
                                        <p className="text-slate-600">{selectedOrder.customer.email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-black text-slate-900 mb-3">Order Items</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                                            <div>
                                                <p className="font-bold text-slate-900">{item.name}</p>
                                                <p className="text-sm text-slate-600">Quantity: {item.qty}</p>
                                                <p className="text-sm text-slate-600">Price: ₹{item.price.toLocaleString()}</p>
                                            </div>
                                            <p className="font-black text-primary-600 text-lg">
                                                ₹{(item.price * item.qty).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
