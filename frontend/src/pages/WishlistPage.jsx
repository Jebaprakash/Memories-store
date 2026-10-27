import { motion } from 'framer-motion';
import { useWishlist } from '../contexts/WishlistContext';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/url';

export const WishlistPage = () => {
    const { wishlistItems, removeFromWishlist, moveToCart, clearWishlist } = useWishlist();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-cream-50 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                    <div>
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-2 block">
                            Saved Pieces
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-cream-900 tracking-tighter">
                            MY <span className="text-cream-400">WISHLIST.</span>
                        </h1>
                        <p className="text-xs font-bold text-cream-500 uppercase tracking-widest mt-2">
                            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                        </p>
                    </div>

                    {wishlistItems.length > 0 && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={clearWishlist}
                                className="px-5 py-3 rounded-xl border border-cream-200 text-cream-600 hover:text-red-600 hover:border-red-200 text-xs font-bold uppercase tracking-wider transition-colors bg-white shadow-sm"
                            >
                                Clear Wishlist
                            </button>
                            <Link
                                to="/products"
                                className="px-6 py-3 rounded-xl bg-cream-900 text-white hover:bg-primary-600 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    )}
                </div>

                {/* Items Grid or Empty State */}
                {wishlistItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-12 sm:p-20 text-center border border-border-subtle shadow-sm max-w-xl mx-auto"
                    >
                        <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-cream-900 mb-2 tracking-tight">Your wishlist is empty</h2>
                        <p className="text-cream-500 font-medium mb-8 text-sm">
                            Save your favourite personalized gifts and keepsakes here to revisit or purchase later.
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center px-8 py-4 bg-cream-900 hover:bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg"
                        >
                            Explore Collection
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => {
                            const isOutOfStock = item.stockQty === 0;
                            const isLowStock = item.stockQty > 0 && item.stockQty <= 5;
                            const priceNum = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : Number(item.price);

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group relative bg-white rounded-2xl overflow-hidden border border-border-cream shadow-sm hover:shadow-md transition-all flex flex-col"
                                >
                                    {/* Image & Badges */}
                                    <div
                                        className="relative aspect-square overflow-hidden bg-cream-100 cursor-pointer"
                                        onClick={() => navigate(`/products/${item.id}`)}
                                    >
                                        <img
                                            src={getImageUrl(item.images?.[0] || item.image_url)}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://placehold.co/400x400/f5f0e8/8d8a82?text=Item';
                                            }}
                                        />

                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromWishlist(item.id);
                                            }}
                                            aria-label={`Remove ${item.name} from wishlist`}
                                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-cream-500 hover:text-red-500 hover:bg-white transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        {/* Stock Badge */}
                                        <div className="absolute top-3 left-3">
                                            {isOutOfStock ? (
                                                <span className="px-2.5 py-1 bg-red-600/90 text-white text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm">
                                                    Out of Stock
                                                </span>
                                            ) : isLowStock ? (
                                                <span className="px-2.5 py-1 bg-amber-500/90 text-white text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm">
                                                    Only {item.stockQty} Left
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-cream-900/80 backdrop-blur-sm text-cream-50 text-[9px] font-black uppercase tracking-wider rounded-md">
                                                    In Stock
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-grow">
                                        <span className="text-[10px] font-bold text-cream-400 uppercase tracking-widest mb-1">
                                            {item.category}
                                        </span>
                                        <h3
                                            onClick={() => navigate(`/products/${item.id}`)}
                                            className="text-base font-bold text-cream-900 hover:text-primary-600 transition-colors cursor-pointer line-clamp-1 mb-2"
                                        >
                                            {item.name}
                                        </h3>

                                        <div className="text-lg font-black text-cream-900 tracking-tight mb-4">
                                            ₹{priceNum.toLocaleString()}
                                        </div>

                                        <div className="mt-auto flex items-center gap-2 pt-2">
                                            <button
                                                onClick={() => moveToCart(item)}
                                                disabled={isOutOfStock}
                                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                                                    isOutOfStock
                                                        ? 'bg-cream-100 text-cream-400 cursor-not-allowed'
                                                        : 'bg-cream-900 hover:bg-primary-600 text-white shadow-sm hover:shadow-md'
                                                }`}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                <span>Move to Bag</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
