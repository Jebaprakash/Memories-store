import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { getImageUrl } from '../utils/url';
import toast from 'react-hot-toast';

export const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
    const navigate = useNavigate();

    const deliveryCharge = 50;
    const subtotal = getCartTotal();
    const total = subtotal + deliveryCharge;

    const hasStockIssue = cartItems.some(
        (item) => item.stockQty === 0 || item.quantity > item.stockQty
    );

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Your bag is empty');
            return;
        }
        if (hasStockIssue) {
            toast.error('Please adjust out-of-stock items before checking out');
            return;
        }
        navigate('/checkout');
    };

    return (
        <div className="min-h-screen bg-cream-50 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Cart Items List */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-2 block">
                                    Review Selection
                                </span>
                                <h1 className="text-3xl sm:text-5xl font-black text-cream-900 tracking-tight">
                                    Shopping Bag
                                </h1>
                                <p className="text-cream-500 font-bold uppercase text-xs tracking-widest mt-1">
                                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your bag
                                </p>
                            </div>
                            <Link
                                to="/products"
                                className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center space-x-2 text-xs uppercase tracking-wider"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Continue Shopping</span>
                            </Link>
                        </div>

                        {hasStockIssue && (
                            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>Some items in your bag exceed available stock. Please adjust quantities before checkout.</span>
                            </div>
                        )}

                        {cartItems.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[2.5rem] p-12 sm:p-20 text-center border border-border-cream shadow-sm"
                            >
                                <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6 text-cream-400">
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-cream-900 mb-2">Your bag is empty</h2>
                                <p className="text-cream-500 font-medium mb-8 text-sm">Looks like you haven't added any personalized keepsakes yet.</p>
                                <Link
                                    to="/products"
                                    className="px-8 py-4 bg-cream-900 hover:bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest inline-block transition-colors shadow-md"
                                >
                                    Browse Collection
                                </Link>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item) => {
                                    const itemPrice = typeof item.price === 'string'
                                        ? parseFloat(item.price.replace(/,/g, ''))
                                        : Number(item.price || 0);
                                    const isItemOutOfStock = item.stockQty === 0;
                                    const isExceedingStock = item.quantity > item.stockQty;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`bg-white p-5 sm:p-6 rounded-2xl border transition-all flex flex-col sm:flex-row gap-5 items-center shadow-sm ${
                                                isItemOutOfStock || isExceedingStock
                                                    ? 'border-red-200 bg-red-50/20'
                                                    : 'border-border-cream hover:shadow-md'
                                            }`}
                                        >
                                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-cream-100 flex-shrink-0 border border-border-subtle">
                                                <img
                                                    src={getImageUrl(item.images?.[0] || item.image_url)}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://placehold.co/400x400/f5f0e8/8d8a82?text=Item';
                                                    }}
                                                />
                                            </div>

                                            <div className="flex-1 text-center sm:text-left">
                                                <span className="text-[10px] font-bold text-cream-400 uppercase tracking-widest mb-1 block">
                                                    {item.category}
                                                </span>
                                                <h3 className="text-lg font-bold text-cream-900 hover:text-primary-600 transition-colors mb-1 line-clamp-1">
                                                    {item.name}
                                                </h3>
                                                <p className="text-base font-black text-cream-900 mb-2">
                                                    ₹{itemPrice.toLocaleString()}
                                                </p>

                                                {isItemOutOfStock ? (
                                                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider">
                                                        Out of Stock
                                                    </span>
                                                ) : isExceedingStock ? (
                                                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                                                        Only {item.stockQty} in stock
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-cream-500 font-medium">
                                                        {item.stockQty} available
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center bg-cream-100/70 rounded-xl border border-border-cream p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        aria-label="Decrease quantity"
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-cream-600 hover:text-cream-900 shadow-sm transition-all"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                                        </svg>
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-black text-cream-900">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={item.quantity >= item.stockQty}
                                                        aria-label="Increase quantity"
                                                        className={`w-8 h-8 flex items-center justify-center rounded-lg bg-white text-cream-600 shadow-sm transition-all ${
                                                            item.quantity >= item.stockQty
                                                                ? 'opacity-40 cursor-not-allowed'
                                                                : 'hover:text-cream-900'
                                                        }`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <div className="text-right min-w-[90px]">
                                                    <p className="text-[10px] font-bold text-cream-400 uppercase tracking-widest mb-0.5">Subtotal</p>
                                                    <p className="text-base font-black text-primary-600">₹{(itemPrice * item.quantity).toLocaleString()}</p>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    aria-label={`Remove ${item.name}`}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    {cartItems.length > 0 && (
                        <div className="w-full lg:w-[380px]">
                            <div className="bg-cream-900 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-xl sticky top-32">
                                <h2 className="text-2xl font-black mb-6 tracking-tight">Summary</h2>

                                <div className="space-y-5 text-sm">
                                    <div className="flex justify-between font-bold text-cream-300">
                                        <span>Subtotal</span>
                                        <span className="text-white font-black">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-cream-300 pb-5 border-b border-white/10">
                                        <span>Delivery</span>
                                        <span className="text-emerald-400 font-black">₹{deliveryCharge}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <div>
                                            <p className="text-[10px] font-black text-cream-400 uppercase tracking-widest mb-1">Total</p>
                                            <p className="text-3xl font-black text-white">₹{total.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <motion.button
                                            whileHover={{ y: hasStockIssue ? 0 : -2, scale: hasStockIssue ? 1 : 1.01 }}
                                            whileTap={{ scale: hasStockIssue ? 1 : 0.98 }}
                                            disabled={hasStockIssue}
                                            onClick={handleCheckout}
                                            className={`w-full py-5 rounded-2xl font-black text-base tracking-widest uppercase transition-all shadow-lg ${
                                                hasStockIssue
                                                    ? 'bg-cream-700 text-cream-400 cursor-not-allowed opacity-60'
                                                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-900/40'
                                            }`}
                                        >
                                            Proceed to Checkout
                                        </motion.button>
                                        <p className="text-center text-cream-400 text-xs font-medium mt-4 flex items-center justify-center space-x-1.5">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                            <span>Secure encrypted checkout</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
