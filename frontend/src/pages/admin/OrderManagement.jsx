import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export const OrderManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const statusFilter = searchParams.get('status') || '';
    const paymentFilter = searchParams.get('paymentStatus') || '';

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, paymentFilter]);

    const fetchOrders = async () => {
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (paymentFilter) params.paymentStatus = paymentFilter;

            const res = await adminAPI.getAllOrders(params);
            setOrders(res.data.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, field, value) => {
        try {
            await adminAPI.updateOrder(orderId, { [field]: value });
            toast.success('Order updated successfully');
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                const res = await adminAPI.getAllOrders();
                const updated = res.data.data.find(o => o.id === orderId);
                setSelectedOrder(updated);
            }
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order');
        }
    };

    const exportOrders = () => {
        if (orders.length === 0) {
            toast.error('No orders to export');
            return;
        }

        const data = orders.map(order => ({
            'Order ID': order.id,
            'Date': new Date(order.createdAt).toLocaleString(),
            'Customer Name': order.customer.name,
            'Customer Email': order.customer.email || 'N/A',
            'Customer Phone': order.customer.phone,
            'Address': order.customer.address,
            'City': order.customer.city,
            'Pincode': order.customer.pincode,
            'Items Count': order.items.length,
            'Items Details': order.items.map(i => `${i.name} (x${i.qty})`).join(', '),
            'Total Amount': order.totalAmount,
            'Payment Method': order.paymentMethod,
            'Payment Status': order.paymentStatus,
            'Order Status': order.orderStatus
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');
        XLSX.writeFile(wb, `Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Orders exported successfully');
    };

    return (
        <AdminLayout>
            <div>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Orders</h1>
                    <button
                        onClick={exportOrders}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Excel
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Order Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams);
                                    if (e.target.value) {
                                        params.set('status', e.target.value);
                                    } else {
                                        params.delete('status');
                                    }
                                    setSearchParams(params);
                                }}
                                className="input-field"
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Payment Status
                            </label>
                            <select
                                value={paymentFilter}
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams);
                                    if (e.target.value) {
                                        params.set('paymentStatus', e.target.value);
                                    } else {
                                        params.delete('paymentStatus');
                                    }
                                    setSearchParams(params);
                                }}
                                className="input-field"
                            >
                                <option value="">All Payment Statuses</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="PendingVerification">Pending Verification</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-24 rounded-xl"></div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <p className="text-gray-600 text-lg">No orders found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-mono text-sm text-gray-900">{order.id.slice(-8)}</p>
                                            <p className="text-xs text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{order.customer.name}</p>
                                            <p className="text-sm text-gray-600">{order.customer.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="badge-info">{order.items.length} items</span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            ₹{order.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="mb-1">
                                                <span className="badge-info text-xs">{order.paymentMethod}</span>
                                            </div>
                                            <select
                                                value={order.paymentStatus}
                                                onChange={(e) => handleStatusUpdate(order.id, 'paymentStatus', e.target.value)}
                                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                            >
                                                <option value="Unpaid">Unpaid</option>
                                                <option value="PendingVerification">Pending</option>
                                                <option value="Paid">Paid</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.orderStatus}
                                                onChange={(e) => handleStatusUpdate(order.id, 'orderStatus', e.target.value)}
                                                className="text-sm border border-gray-300 rounded px-3 py-1 font-medium"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Order Details Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-600">Order ID</p>
                                        <p className="font-mono font-semibold">{selectedOrder.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date</p>
                                        <p className="font-semibold">
                                            {new Date(selectedOrder.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Method</p>
                                        <p className="font-semibold">{selectedOrder.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Amount</p>
                                        <p className="font-bold text-primary-600 text-xl">
                                            ₹{selectedOrder.totalAmount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-gray-900">Customer Details</h3>
                                        <button
                                            onClick={() => {
                                                const message = `Hello ${selectedOrder.customer.name}, your order #${selectedOrder.id.slice(-8)} from ${process.env.BUSINESS_NAME || 'our store'} has been confirmed! We will notify you once it's shipped.`;
                                                window.open(`https://wa.me/${selectedOrder.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                                            }}
                                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-all"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                            </svg>
                                            Message Customer
                                        </button>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="font-semibold">{selectedOrder.customer.name}</p>
                                        <p className="text-gray-700">{selectedOrder.customer.phone}</p>
                                        <p className="text-gray-700 mt-2">
                                            {selectedOrder.customer.address}<br />
                                            {selectedOrder.customer.city} - {selectedOrder.customer.pincode}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
                                    <div className="space-y-2">
                                        {selectedOrder.items.map((item, index) => (
                                            <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.name}</p>
                                                    <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                                                </div>
                                                <p className="font-bold text-primary-600">
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
        </AdminLayout>
    );
};
