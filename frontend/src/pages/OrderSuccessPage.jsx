import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ordersAPI } from '../services/api';
import { generateUPIString } from '../utils/qrGenerator';
import { generateWhatsAppMessage } from '../utils/whatsappHelper';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export const OrderSuccessPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const res = await ordersAPI.getById(orderId);
            setOrder(res.data.data);
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentConfirmation = async () => {
        try {
            await ordersAPI.updatePaymentStatus(orderId, 'PendingVerification');
            setPaymentConfirmed(true);
            toast.success('Payment confirmation received! We will verify and update your order.');
        } catch (error) {
            console.error('Error updating payment status:', error);
            toast.error('Failed to confirm payment');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12">
                <div className="max-w-3xl mx-auto px-4">
                    <LoadingSkeleton type="detail" />
                </div>
            </div>
        );
    }

    if (!order) return null;

    const upiString = generateUPIString(order.id, order.totalAmount);
    const whatsappUrl = generateWhatsAppMessage(order);

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl -z-10 animate-blob" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-100/30 rounded-full blur-3xl -z-10 animate-blob animation-delay-2000" />

            <div className="max-w-4xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 p-8 lg:p-12 border border-slate-100 text-center relative"
                >
                    {/* Success Header */}
                    <div className="mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                            className="w-24 h-24 bg-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/40"
                        >
                            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </motion.div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 italic tracking-tight">
                            Wonderful <span className="text-gradient">Choice!</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-lg">Your order #{order.id} has been successfully placed.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 text-left mb-12">
                        {/* Summary Details */}
                        <div className="space-y-8">
                            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Order Details</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-bold">Total Amount</span>
                                        <span className="text-xl font-black text-slate-900 italic">₹{order.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-bold">Status</span>
                                        <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">{order.orderStatus}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-bold">Method</span>
                                        <span className="text-slate-900 font-black uppercase text-xs">{order.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 px-2">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Shipping To</h3>
                                <div className="p-1">
                                    <p className="text-slate-900 font-black text-lg">{order.customer.name}</p>
                                    <p className="text-slate-500 font-medium">{order.customer.phone}</p>
                                    <p className="text-slate-500 font-medium leading-relaxed mt-2 italic">
                                        {order.customer.address}<br />
                                        {order.customer.city} - {order.customer.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-1">Your Selected Items</h3>
                            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                                {order.items.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + (index * 0.1) }}
                                        className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-2xl shadow-sm"
                                    >
                                        <div>
                                            <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-slate-400 font-black uppercase tracking-widest py-1">Qty: {item.quantity || item.qty || 0}</p>
                                        </div>
                                        <p className="font-black text-slate-900 italic">
                                            ₹{((parseFloat(item.price || 0) || 0) * (item.quantity || item.qty || 0)).toLocaleString()}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Sections */}
                    <div className="grid md:grid-cols-2 gap-8 items-stretch pt-12 border-t border-slate-100">
                        {/* QR Payment */}
                        {order.paymentMethod === 'QR' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col items-center justify-center space-y-6 shadow-2xl shadow-slate-900/20"
                            >
                                <div className="text-center">
                                    <h3 className="text-xl font-black italic tracking-tight mb-2 uppercase tracking-widest">Instant Pay</h3>
                                    <p className="text-slate-400 text-xs font-bold px-4">Scan anywhere with your preferred UPI app</p>
                                </div>
                                <div className="bg-white p-4 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                                    <QRCodeSVG value={upiString} size={150} />
                                </div>
                                {!paymentConfirmed ? (
                                    <button
                                        onClick={handlePaymentConfirmation}
                                        className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-primary-500/20"
                                    >
                                        I've Transferred
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 text-green-400 font-black uppercase tracking-widest text-xs py-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Awaiting Confirmation
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* WhatsApp Support */}
                        <div className={`flex flex-col gap-4 ${order.paymentMethod !== 'QR' ? 'md:col-span-2' : ''}`}>
                            <div className="bg-green-50 rounded-[2.5rem] p-8 border border-green-100 flex flex-col items-center justify-center text-center h-full">
                                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-black text-slate-900 mb-1">WhatsApp Support</h4>
                                <p className="text-slate-500 font-medium mb-6 text-sm">Need help or want quick updates?<br />Send us a message!</p>
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full max-w-[200px] bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-green-500/20 transition-all text-center"
                                >
                                    Message Us
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <Link to="/products">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group inline-flex items-center gap-2 text-slate-400 hover:text-primary-600 font-black uppercase tracking-widest text-xs transition-all"
                            >
                                Continue Shopping
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
