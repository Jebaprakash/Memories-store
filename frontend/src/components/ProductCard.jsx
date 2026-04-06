import { memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getProductCardImage, getCloudinarySrcSet } from '../utils/cloudinary';

/**
 * ProductCard – memoized to avoid re-renders when the parent re-renders
 * without changing the product data.
 */
export const ProductCard = memo(({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (product.stockQty > 0) {
            addToCart(product, 1);
        }
    };

    const handleCardClick = () => {
        navigate(`/products/${product.id}`);
    };

    // Optimized Cloudinary thumbnail (400px, WebP/AVIF via f_auto)
    const imageUrl = getProductCardImage(product.images?.[0]);
    const srcSet = getCloudinarySrcSet(product.images?.[0], [200, 400, 600]);

    return (
        <motion.div
            layout
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            viewport={{ once: true, margin: '0px 0px -50px 0px' }}
            transition={{ duration: 0.3 }}
            className="group relative flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-slate-100 h-full cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-slate-50">
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
                        e.currentTarget.src = 'https://placehold.co/400x400/f1f5f9/94a3b8?text=No+Image';
                    }}
                />

                {/* Stock Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
                    {product.stockQty === 0 ? (
                        <span className="px-2 py-1 bg-red-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-sm shadow-sm ring-1 ring-red-700/20">
                            Out of Stock
                        </span>
                    ) : product.stockQty <= 5 && (
                        <span className="px-2 py-1 bg-amber-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-sm shadow-sm">
                            Only {product.stockQty} Left!
                        </span>
                    )}
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 right-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-2 py-1 bg-white/80 backdrop-blur-sm text-slate-600 text-[8px] font-bold uppercase tracking-widest rounded-sm border border-slate-200">
                        {product.category}
                    </span>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-3 sm:p-4 flex flex-col flex-grow">
                {/* Product Name */}
                <h3 className="text-sm font-semibold text-slate-800 leading-snug mb-1.5 h-[2.5rem] line-clamp-2 transition-colors duration-300 group-hover:text-primary-600">
                    {product.name}
                </h3>

                {/* Ratings & Category */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center bg-green-600 px-1.5 py-0.5 rounded text-white text-[10px] font-bold">
                        <span>4.2</span>
                        <svg className="w-2.5 h-2.5 ml-0.5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-tighter">
                        {product.category}
                    </span>
                </div>

                {/* Price Section */}
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        ₹{parseFloat(product.price).toLocaleString()}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                        ₹{(parseFloat(product.price) * 1.4).toFixed(0)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-green-600 font-bold">40% off</span>
                </div>

                {/* Add to Cart */}
                <div className="mt-auto">
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stockQty === 0}
                        aria-label={product.stockQty === 0 ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
                        className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2
                            ${product.stockQty === 0
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {product.stockQty === 0 ? (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <span>Out of Stock</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>Add to Cart</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
});

ProductCard.displayName = 'ProductCard';
