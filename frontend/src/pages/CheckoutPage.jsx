import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { ordersAPI } from '../services/api';
import { getImageUrl } from '../utils/url';
import toast from 'react-hot-toast';

import { QRCodeSVG } from 'qrcode.react';
import { generateUPIString } from '../utils/qrGenerator';
import { useAuth } from '../contexts/AuthContext';

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [screenshot, setScreenshot] = useState(null);

    const [formData, setFormData] = useState({
        name: user ? `${user.firstName} ${user.lastName}` : '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address?.street || '',
        city: user?.address?.city || '',
        pincode: user?.address?.zipCode || '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: `${user.firstName} ${user.lastName}`,
                email: user.email || '',
                phone: user.phone || '',
                address: user.address?.street || '',
                city: user.address?.city || '',
                pincode: user.address?.zipCode || '',
            });
        }
    }, [user]);

    const [paymentMethod, setPaymentMethod] = useState('COD');

    const deliveryCharge = 50;
    const subtotal = getCartTotal();
    const total = subtotal + deliveryCharge;

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Please enter your name');
            return false;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        if (!formData.phone.trim() || formData.phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return false;
        }
        if (!formData.address.trim()) {
            toast.error('Please enter your address');
            return false;
        }
        if (!formData.city.trim()) {
            toast.error('Please enter your city');
            return false;
        }
        if (!formData.pincode.trim() || formData.pincode.length !== 6) {
            toast.error('Please enter a valid 6-digit pincode');
            return false;
        }
        if (paymentMethod === 'QR' && !screenshot) {
            toast.error('Please upload your payment screenshot');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setLoading(true);

        try {
            const itemsFormatted = cartItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                name: item.name,
                price: typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : item.price,
                image: item.images?.[0]
            }));

            const payloadData = new FormData();
            payloadData.append('items', JSON.stringify(itemsFormatted));
            payloadData.append('customer', JSON.stringify(formData));
            payloadData.append('totalAmount', total);
            payloadData.append('paymentMethod', paymentMethod);

            if (paymentMethod === 'QR' && screenshot) {
                payloadData.append('screenshot', screenshot);
            }

            const res = await ordersAPI.create(payloadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Order placed successfully!');
            clearCart();
            navigate(`/order-success/${res.data.data.id}`);
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100"
                >
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Your Bag is Empty</h2>
                    <p className="text-slate-500 font-medium mb-10 text-lg">Add some amazing products to your bag before checking out.</p>
                    <motion.button
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/products')}
                        className="btn-primary w-full"
                    >
                        Explore Collection
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
                            Final <span className="text-gradient">Step</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Please provide your details to complete the order</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 p-8 lg:p-12 border border-slate-100">
                                <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100/50 text-primary-600 rounded-xl flex items-center justify-center text-lg">1</div>
                                    Shipping Information
                                </h2>

                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary-500 transition-all outline-none text-slate-900 font-bold"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary-500 transition-all outline-none text-slate-900 font-bold"
                                            placeholder="Enter your email address"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary-500 transition-all outline-none text-slate-900 font-bold"
                                            placeholder="10-digit mobile number"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Complete Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                            rows="4"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary-500 transition-all outline-none text-slate-900 font-bold resize-none"
                                            placeholder="House No, Street, Landmark..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary-500 transition-all outline-none text-slate-900 font-bold"
                                                placeholder="City"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleInputChange}
                                                required
                                                maxLength="6"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary-500 transition-all outline-none text-slate-900 font-bold"
                                                placeholder="6-digit"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 p-8 lg:p-12 border border-slate-100">
                                <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100/50 text-primary-600 rounded-xl flex items-center justify-center text-lg">2</div>
                                    Payment Method
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <motion.label
                                        whileHover={{ y: -4 }}
                                        className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${paymentMethod === 'COD' ? 'border-primary-600 bg-primary-50/30' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-primary-200'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="hidden"
                                        />
                                        <div className="flex flex-col items-center text-center gap-4">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                                <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <span className="font-black text-slate-900 text-lg uppercase tracking-tight">CASH ON DELIVERY</span>
                                        </div>
                                        {paymentMethod === 'COD' && (
                                            <div className="absolute top-4 right-4 text-primary-600">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </motion.label>

                                    <motion.label
                                        whileHover={{ y: -4 }}
                                        className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${paymentMethod === 'QR' ? 'border-primary-600 bg-primary-50/30' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-primary-200'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="QR"
                                            checked={paymentMethod === 'QR'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="hidden"
                                        />
                                        <div className="flex flex-col items-center text-center gap-4">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                                <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 11v1m5-10v1m0 8v1m-9-4h1m8 0h1m-7 7h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2" />
                                                </svg>
                                            </div>
                                            <span className="font-black text-slate-900 text-lg uppercase tracking-tight">UPI / QR PAYMENT</span>
                                        </div>
                                        {paymentMethod === 'QR' && (
                                            <div className="absolute top-4 right-4 text-primary-600">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </motion.label>
                                </div>

                                {paymentMethod === 'QR' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-8 p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden"
                                    >
                                        <div className="flex flex-col md:flex-row items-center gap-8">
                                            <div className="w-40 h-40 bg-white p-4 rounded-3xl flex items-center justify-center">
                                                <div className="w-full text-center">
                                                    <QRCodeSVG
                                                        value={generateUPIString(Date.now().toString(), total)}
                                                        size={128}
                                                        level="H"
                                                        includeMargin={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Pay via UPI</h3>
                                                <div className="bg-white/10 px-6 py-3 rounded-2xl mb-4 inline-block">
                                                    <code className="text-primary-400 font-bold text-lg">{import.meta.env.VITE_UPI_ID || 'e17mer053-1@okaxis'}</code>
                                                </div>
                                                <h3 className="text-xl font-black mt-4 mb-2 uppercase tracking-tight">Bank Details</h3>
                                                <div className="bg-white/10 px-6 py-4 rounded-2xl mb-4 text-sm font-medium leading-relaxed">
                                                    <p><span className="text-slate-400">Account Name:</span> KIRUPAKARAN R</p>
                                                    <p><span className="text-slate-400">Account Number:</span> 351100250650060</p>
                                                    <p><span className="text-slate-400">Branch:</span> PUTHAGARAM</p>
                                                    <p><span className="text-slate-400">Account Type:</span> Savings Account</p>
                                                    <p><span className="text-slate-400">IFSC Code:</span> <code className="text-primary-400 font-bold">TMBL0000351</code></p>
                                                </div>
                                                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
                                                    Please transfer the total amount to the UPI ID or Bank Account above. After payment, upload your payment screenshot below.
                                                </p>
                                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
                                                    <label className="block text-sm font-bold text-slate-300 mb-2">Upload Payment Screenshot *</label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setScreenshot(e.target.files[0])}
                                                        required={paymentMethod === 'QR'}
                                                        className="block w-full text-sm text-slate-400
                                                            file:mr-4 file:py-2.5 file:px-6
                                                            file:rounded-xl file:border-0
                                                            file:text-sm file:font-bold
                                                            file:bg-primary-500 file:text-white
                                                            hover:file:bg-primary-600 file:transition-all
                                                            file:cursor-pointer"
                                                    />
                                                    {screenshot && (
                                                        <p className="mt-2 text-primary-400 text-xs font-medium">
                                                            Selected: {screenshot.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <motion.button
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white rounded-[2rem] py-8 text-2xl font-black tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-primary-600 transition-all uppercase flex items-center justify-center gap-4"
                            >
                                {loading ? (
                                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Confirm Your Order
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 p-8 border border-slate-100 sticky top-32">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Order Summary</h2>

                            <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                                            <img
                                                src={getImageUrl(item.images?.[0])}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-widest">Qty: {item.quantity}</p>
                                            <p className="text-lg font-black text-slate-900 tracking-tight">
                                                ₹{(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <div className="flex justify-between text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                    <span>Summary Detail</span>
                                </div>
                                <div className="flex justify-between text-slate-600 font-medium">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 font-medium pb-4 border-b border-slate-100">
                                    <span>Delivery Charge</span>
                                    <span className="text-green-600 font-bold">₹{deliveryCharge}</span>
                                </div>
                                <div className="flex justify-between items-end pt-4">
                                    <span className="text-2xl font-black text-slate-900 italic tracking-tighter">Total Price</span>
                                    <span className="text-3xl font-black text-primary-600">₹{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
