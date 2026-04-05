import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { getImageUrl } from '../utils/url';
import toast from 'react-hot-toast';

export const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await productsAPI.getById(id);
            setProduct(res.data.data);
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            toast.success(`Added ${quantity} ${product.name} to cart!`);
            setQuantity(1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <LoadingSkeleton type="detail" />
                </div>
            </div>
        );
    }

    if (!product) return null;

    const specs = [
        { label: 'Category', value: product.category },
        { label: 'Shipping', value: 'Free Global Delivery' },
        { label: 'Returns', value: '30-Day Policy' },
        { label: 'Warranty', value: '1 Year Limited' },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-12">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                        <span>Back to Collective</span>
                    </motion.button>

                    <div className="hidden md:flex items-center gap-4">
                        <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                        <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Visual Section */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-white shadow-2xl border border-slate-100">
                            <AnimatePresence mode='wait'>
                                <motion.img
                                    key={selectedImage}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.6 }}
                                    src={getImageUrl(product.images[selectedImage])}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>

                            {/* Zoom/Expand Button Proxy */}
                            <div className="absolute bottom-8 right-8">
                                <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-all text-slate-900">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none justify-center">
                                {product.images.map((image, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedImage(index)}
                                        className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === index
                                            ? 'border-slate-900 shadow-xl scale-110'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={getImageUrl(image)}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-5 flex flex-col pt-4">
                        <div className="mb-10">
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-4 block">
                                Collection / {product.category}
                            </span>
                            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">4.9 (124 Reviews)</span>
                            </div>
                            <div className="text-4xl font-black text-slate-900 tracking-tighter mb-10">
                                ₹{product.price.toLocaleString()}
                            </div>

                            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 border-l-4 border-slate-100 pl-6 italic">
                                "{product.description}"
                            </p>
                        </div>

                        {product.stockQty > 0 ? (
                            <div className="space-y-10">
                                <div className="flex items-center gap-8">
                                    <div className="flex items-center bg-white rounded-2xl border border-slate-100 shadow-sm p-1">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-900"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                            </svg>
                                        </motion.button>
                                        <span className="text-2xl font-black text-slate-900 w-14 text-center">
                                            {quantity}
                                        </span>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                                            className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-900"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </motion.button>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Stock Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full animate-pulse ${product.stockQty <= 5 ? 'bg-amber-500' : 'bg-green-500'}`} />
                                            <span className={`text-sm font-black uppercase tracking-widest leading-none ${product.stockQty <= 5 ? 'text-amber-600' : 'text-slate-900'}`}>
                                                {product.stockQty <= 5 ? `Only ${product.stockQty} left!` : 'In Stock / Ready to ship'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    onClick={handleAddToCart}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-slate-900 text-white rounded-3xl py-7 font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-4 transition-all"
                                >
                                    Add to Private Bag
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </motion.button>

                                <div className="grid grid-cols-2 gap-y-6 pt-10 border-t border-slate-100">
                                    {specs.map((spec) => (
                                        <div key={spec.label}>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{spec.label}</p>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{spec.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 bg-slate-100 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                                <p className="text-slate-900 font-black text-xl mb-4 tracking-tighter italic">Sold Out.</p>
                                <p className="text-sm text-slate-500 font-medium">This piece is currently unavailable. Register interest to be notified on restock.</p>
                                <button className="mt-8 px-8 py-4 bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">Notify Me</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

