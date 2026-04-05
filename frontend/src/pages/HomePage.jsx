import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { productsAPI } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { getImageUrl } from '../utils/url';
import toast from 'react-hot-toast';

export const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);
    const y2 = useTransform(scrollY, [0, 500], [0, -100]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                productsAPI.getAll({ sort: 'newest' }),
                productsAPI.getCategories(),
            ]);

            const allProducts = productsRes.data.data;
            setFeaturedProducts(allProducts.slice(0, 8));
            
            // Map categories to their first found product image
            const categoryItems = categoriesRes.data.data.map(cat => {
                const product = allProducts.find(p => p.category === cat);
                return {
                    name: cat,
                    image: product?.images?.[0] || product?.image_url
                };
            });
            
            setCategories(categoryItems);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Curated Items', value: '2,500+' },
        { label: 'Happy Clients', value: '45k' },
        { label: 'Store Locations', value: '12' },
        { label: 'Global Awards', value: '08' },
    ];

    const brands = [
        'Photography', 'Gifts', 'Memories', 'Events', 'Portraits', 'Ceremonies'
    ];

    return (
        <div className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-900">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#fafafa]">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 z-0">
                    <motion.div
                        style={{ y: y1 }}
                        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-100/40 rounded-full blur-[120px]"
                    />
                    <motion.div
                        style={{ y: y2 }}
                        className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary-100/40 rounded-full blur-[120px]"
                    />
                </div>

                <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-12 gap-16 items-center">
                    <div className="lg:col-span-7 text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
                                <span className="flex h-2 w-2 rounded-full bg-primary-600 animate-ping" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">New Collection Just Dropped</span>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8 italic uppercase">
                                PRESERVE <br />
                                YOUR <span className="text-primary-600">MEMORIES.</span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl mb-12 leading-relaxed">
                                From premium personalized gifts to professional photography services. We help you capture and cherish life's most beautiful moments.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-16">
                                <Link to="/products">
                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/20 flex items-center justify-center space-x-3"
                                    >
                                        <span>Shop Collection</span>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </motion.button>
                                </Link>
                                <Link to="/products">
                                    <motion.button
                                        whileHover={{ scale: 1.02, bg: '#fff' }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-slate-900 transition-colors"
                                    >
                                        View Lookbook
                                    </motion.button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {stats.map((stat, i) => (
                                    <div key={i}>
                                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-5 relative hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10"
                        >
                            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_64px_128px_-32px_rgba(0,0,0,0.2)] border-[12px] border-white">
                                <img
                                    src="/hero-image.png"
                                    alt="Memories Store - Gifts & Photography"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Floating Element */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 max-w-[240px]"
                            >
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality</p>
                                        <p className="font-black text-slate-900">Certified</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    Each piece is meticulously inspected for premium standards.
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* Background Ornament */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-slate-200 rounded-full -z-10 opacity-50" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-slate-100 rounded-full -z-10 opacity-30" />
                    </div>
                </div>

                <motion.div
                    style={{ opacity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
                >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Scroll to explore</p>
                    <div className="w-px h-12 bg-gradient-to-b from-slate-200 to-transparent" />
                </motion.div>
            </section>

            {/* Brands Marquee */}
            <div className="py-20 border-y border-slate-100 overflow-hidden bg-white">
                <div className="flex items-center space-x-20 whitespace-nowrap animate-marquee px-4">
                    {[...brands, ...brands, ...brands].map((brand, i) => (
                        <span key={i} className="text-4xl md:text-5xl font-black text-slate-200 uppercase tracking-tighter hover:text-primary-600 transition-colors cursor-default">
                            {brand}
                        </span>
                    ))}
                </div>
            </div>

            {/* Featured Selection */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <div>
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-4 block">Our Picks</span>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                                FEATURED <span className="text-slate-300">DROPS.</span>
                            </h2>
                        </div>
                        <Link to="/products">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                            >
                                View All Products
                            </motion.button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-10">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <LoadingSkeleton key={i} type="product" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-10">
                            {featuredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-32 bg-[#fafafa]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-4 block">Categories</span>
                        <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                            SHOP BY <span className="text-slate-300">MOOD.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.name}
                                whileHover={{ y: -10 }}
                                className="group relative aspect-square rounded-[3rem] overflow-hidden bg-white shadow-xl border border-slate-100"
                            >
                                <img
                                    src={getImageUrl(category.image) || `https://images.unsplash.com/photo-${index === 0 ? '1523275335684-37898b6baf30' : index === 1 ? '1491553895911-0055eca6402d' : '1505740420928-5e560c06d30e'}?q=80&w=800&auto=format&fit=crop`}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                                <div className="absolute bottom-10 left-10">
                                    <h3 className="text-3xl font-black text-white capitalize mb-4 tracking-tighter">{category.name}</h3>
                                    <Link to={`/products?category=${encodeURIComponent(category.name)}`}>
                                        <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            Explore More
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative bg-slate-900 rounded-[4rem] p-12 md:p-24 overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] -mr-64 -mt-64" />

                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter mb-8">
                                JOIN THE <span className="text-primary-500"> INNER </span> CIRCLE.
                            </h2>
                            <p className="text-xl text-slate-400 font-medium mb-12">
                                Get early access to limited edition drops, exclusive events, and the story behind every piece.
                            </p>
                            <form className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-grow bg-slate-800 border-none rounded-2xl py-5 px-8 text-white text-lg font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-12 py-5 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary-600/30"
                                >
                                    Subscribe
                                </motion.button>
                            </form>
                            <p className="mt-6 text-slate-500 text-xs font-medium">
                                By subscribing, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

