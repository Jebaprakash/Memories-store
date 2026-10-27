import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/url';
import toast from 'react-hot-toast';

export const CartDrawer = () => {
    const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getCartTotal } = useCart();
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
        setIsCartOpen(false);
        navigate('/checkout');
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-cream-900/50 backdrop-blur-sm z-50 px-4"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-[60] flex flex-col sm:rounded-l-[2.5rem] overflow-hidden border-l border-border-cream"
                    >
                        {/* Header */}
                        <div className="p-6 sm:p-8 border-b border-border-cream flex items-center justify-between bg-cream-50/50">
                            <div>
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] block mb-1">
                                    Shopping Bag
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-cream-900 tracking-tight">Your Bag</h2>
                                <p className="text-cream-500 font-bold uppercase text-[10px] tracking-widest mt-0.5">
                                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in total
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ rotate: 90, scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsCartOpen(false)}
                                aria-label="Close bag drawer"
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-cream-400 hover:text-cream-900 border border-border-cream shadow-sm transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mb-5 text-cream-400">
                                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-cream-900 mb-2">Your bag is empty</h3>
                                    <p className="text-cream-500 font-medium text-sm mb-6 max-w-xs">Ready to discover something extraordinary?</p>
                                    <motion.button
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setIsCartOpen(false);
                                            navigate('/products');
                                        }}
                                        className="px-6 py-3.5 bg-cream-900 text-white hover:bg-primary-600 rounded-xl font-black text-xs uppercase tracking-widest transition-colors shadow-sm"
                                    >
                                        Start Shopping
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => {
                                        const itemPrice = typeof item.price === 'string'
                                            ? parseFloat(item.price.replace(/,/g, ''))
                                            : Number(item.price || 0);
                                        const isOutOfStock = item.stockQty === 0;
                                        const isExceeding = item.quantity > item.stockQty;

                                        return (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                                                className={`group flex gap-4 p-4 rounded-2xl border transition-all ${
                                                    isOutOfStock || isExceeding
                                                        ? 'bg-red-50/40 border-red-200'
                                                        : 'bg-cream-50/50 hover:bg-white border-border-cream hover:shadow-sm'
                                                }`}
                                            >
                                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-border-subtle flex-shrink-0">
                                                    <img
                                                        src={getImageUrl(item.images?.[0] || item.image_url)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://placehold.co/400x400/f5f0e8/8d8a82?text=Item';
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-0.5">
                                                            <h3 className="font-bold text-sm text-cream-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                                                                {item.name}
                                                            </h3>
                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                aria-label={`Remove ${item.name}`}
                                                                className="text-cream-400 hover:text-red-500 transition-colors ml-2"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <p className="text-sm font-black text-cream-900">
                                                            ₹{itemPrice.toLocaleString()}
                                                        </p>
                                                        {isOutOfStock ? (
                                                            <span className="text-[10px] font-bold text-red-600 uppercase">
                                                                Out of Stock
                                                            </span>
                                                        ) : isExceeding ? (
                                                            <span className="text-[10px] font-bold text-amber-600 uppercase">
                                                                Only {item.stockQty} in stock
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    <div className="flex items-center justify-between mt-3">
                                                        <div className="flex items-center bg-white rounded-lg border border-border-cream shadow-xs p-0.5">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                aria-label="Decrease quantity"
                                                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-cream-100 text-cream-600"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                                                </svg>
                                                            </button>
                                                            <span className="w-7 text-center text-xs font-black text-cream-900">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                disabled={item.quantity >= item.stockQty}
                                                                aria-label="Increase quantity"
                                                                className={`w-7 h-7 flex items-center justify-center rounded-md text-cream-600 ${
                                                                    item.quantity >= item.stockQty
                                                                        ? 'opacity-40 cursor-not-allowed'
                                                                        : 'hover:bg-cream-100'
                                                                }`}
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <p className="text-xs font-black text-primary-600">
                                                            ₹{(itemPrice * item.quantity).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-6 bg-cream-50 border-t border-border-cream space-y-5">
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-cream-600 font-medium">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-cream-900">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-cream-600 font-medium pb-2 border-b border-border-cream">
                                        <span>Delivery</span>
                                        <span className="text-emerald-600 font-bold">₹{deliveryCharge}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-1">
                                        <span className="text-lg font-black text-cream-900">Total</span>
                                        <span className="text-2xl font-black text-primary-600">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ y: hasStockIssue ? 0 : -2, scale: hasStockIssue ? 1 : 1.01 }}
                                    whileTap={{ scale: hasStockIssue ? 1 : 0.98 }}
                                    disabled={hasStockIssue}
                                    onClick={handleCheckout}
                                    className={`w-full py-4 rounded-xl font-black text-sm tracking-widest shadow-md transition-all uppercase ${
                                        hasStockIssue
                                            ? 'bg-cream-400 text-white cursor-not-allowed opacity-60'
                                            : 'bg-cream-900 hover:bg-primary-600 text-white'
                                    }`}
                                >
                                    Proceed to Checkout
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
