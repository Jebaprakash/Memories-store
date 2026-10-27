import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { getProductCardImage, getCloudinarySrcSet } from '../utils/cloudinary';

/**
 * ProductCard – memoized to avoid re-renders when parent re-renders
 * Features genuine pricing, responsive layout, stock status, wishlist toggle, and add-to-cart feedback.
 */
export const ProductCard = memo(({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [isAdded, setIsAdded] = useState(false);

    const isFav = isInWishlist(product?.id);
    const isOutOfStock = product?.stockQty === 0;
    const isLowStock = product?.stockQty > 0 && product?.stockQty <= 5;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!isOutOfStock) {
            addToCart(product, 1);
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 1400);
        }
    };

    const handleWishlistToggle = (e) => {
        e.stopPropagation();
        toggleWishlist(product);
    };

    const handleCardClick = () => {
        navigate(`/products/${product.id}`);
    };

    // Genuine price handling
    const rawPrice = product?.price;
    const priceNum = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/,/g, '')) : Number(rawPrice || 0);

    // Only display comparison price if genuine field exists on product entity
    const comparePrice = product?.compareAtPrice || product?.originalPrice;
    const hasGenuineDiscount = comparePrice && Number(comparePrice) > priceNum;
    const discountPercent = hasGenuineDiscount ? Math.round(((Number(comparePrice) - priceNum) / Number(comparePrice)) * 100) : null;

    // Optimized Cloudinary thumbnail (400px, WebP/AVIF via f_auto)
    const imageUrl = getProductCardImage(product.images?.[0] || product.image_url);
    const srcSet = getCloudinarySrcSet(product.images?.[0] || product.image_url, [200, 400, 600]);

    return (
        <motion.div
            layout
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            viewport={{ once: true, margin: '0px 0px -50px 0px' }}
            transition={{ duration: 0.3 }}
            className="group relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-cream-200/80 h-full cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-cream-100/60">
                <img
                    src={imageUrl}
                    srcSet={srcSet || undefined}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    alt={product.name}
                    width={400}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x400/f5f0e8/8d8a82?text=Product';
                    }}
                />

                {/* Stock Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none z-10">
                    {isOutOfStock ? (
                        <span className="px-2 py-1 bg-red-600/95 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm">
                            Out of Stock
                        </span>
                    ) : isLowStock ? (
                        <span className="px-2 py-1 bg-amber-500/95 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm">
                            Only {product.stockQty} Left
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-cream-700 text-[8px] font-bold uppercase tracking-wider rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            In Stock
                        </span>
                    )}
                </div>

                {/* Wishlist Heart Button */}
                <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={handleWishlistToggle}
                    aria-label={isFav ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                    className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 shadow-sm ${
                        isFav
                            ? 'bg-primary-600 text-white'
                            : 'bg-white/90 text-cream-600 hover:text-primary-600 hover:bg-white'
                    }`}
                >
                    <svg
                        className="w-4 h-4"
                        fill={isFav ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </motion.button>
            </div>

            {/* Content Container */}
            <div className="p-3.5 sm:p-4 flex flex-col flex-grow">
                {/* Category & Mood */}
                <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] text-cream-500 font-bold uppercase tracking-wider truncate">
                        {product.category}
                    </span>
                    <span className="text-[10px] text-primary-600 font-bold tracking-tight">
                        Authentic
                    </span>
                </div>

                {/* Product Name */}
                <h3 className="text-sm font-bold text-cream-900 leading-snug mb-2 h-[2.5rem] line-clamp-2 transition-colors duration-300 group-hover:text-primary-600">
                    {product.name}
                </h3>

                {/* Price Section – Genuine authoritative prices only */}
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-base sm:text-lg font-black text-cream-900 tracking-tight">
                        ₹{priceNum.toLocaleString()}
                    </span>
                    {hasGenuineDiscount && (
                        <>
                            <span className="text-[10px] sm:text-xs text-cream-400 line-through">
                                ₹{Number(comparePrice).toLocaleString()}
                            </span>
                            <span className="text-[10px] sm:text-xs text-primary-600 font-bold">
                                {discountPercent}% off
                            </span>
                        </>
                    )}
                </div>

                {/* Add to Cart Button with Instant Feedback */}
                <div className="mt-auto">
                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                            isOutOfStock
                                ? 'bg-cream-100 text-cream-400 cursor-not-allowed'
                                : isAdded
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-cream-900 text-white hover:bg-primary-600 active:scale-95 shadow-sm hover:shadow-md'
                        }`}
                    >
                        {isOutOfStock ? (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <span>Out of Stock</span>
                            </>
                        ) : isAdded ? (
                            <>
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Added to Bag!</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>Add to Bag</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
});

ProductCard.displayName = 'ProductCard';
