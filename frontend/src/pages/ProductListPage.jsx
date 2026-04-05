import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productsAPI } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export const ProductListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'newest',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        // Sync filters with search params
        const newFilters = {
            search: searchParams.get('search') || '',
            category: searchParams.get('category') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            sort: searchParams.get('sort') || 'newest',
        };
        setFilters(newFilters);
        fetchProducts(newFilters);
    }, [searchParams]);

    const fetchCategories = async () => {
        try {
            const res = await productsAPI.getCategories();
            setCategories(res.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async (currentFilters) => {
        setLoading(true);
        try {
            const params = {};
            if (currentFilters.search) params.search = currentFilters.search;
            if (currentFilters.category) params.category = currentFilters.category;
            if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice;
            if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice;
            if (currentFilters.sort) params.sort = currentFilters.sort;

            const res = await productsAPI.getAll(params);
            setProducts(res.data.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    return (
        <div className="min-h-screen bg-[#fafafa] pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-4 block">Collections</span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
                            EXPLORE <span className="text-slate-300">ALL.</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center space-x-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span>Filters</span>
                        </button>

                        <div className="relative group">
                            <select
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="appearance-none bg-white border border-slate-200 rounded-2xl px-8 py-4 pr-12 font-black text-xs uppercase tracking-widest outline-none focus:border-primary-500 transition-all cursor-pointer shadow-sm"
                            >
                                <option value="newest">Sort by Newest</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
                    {/* Filters Sidebar */}
                    <aside className={`lg:col-span-3 space-y-10 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        {/* Search */}
                        <div>
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-6">Search</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Keywords..."
                                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-primary-500 transition-all shadow-sm"
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-6">Mood</h3>
                            <div className="flex flex-wrap lg:flex-col gap-2">
                                <button
                                    onClick={() => handleFilterChange('category', '')}
                                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left ${filters.category === '' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                                        }`}
                                >
                                    All Collective
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleFilterChange('category', cat)}
                                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left capitalize ${filters.category === cat ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-6">Price Point</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min</label>
                                    <input
                                        type="number"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max</label>
                                    <input
                                        type="number"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={clearFilters}
                            className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.3em] border-t border-slate-100 pt-8"
                        >
                            Reset Preferences
                        </button>
                    </aside>

                    {/* Main Grid */}
                    <main className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <LoadingSkeleton key={i} type="product" />
                                    ))}
                                </motion.div>
                            ) : products.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm mx-2"
                                >
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tighter text-center">No items found</h3>
                                    <p className="text-sm text-slate-500 font-medium mb-8 text-center px-4">Adjust your filters to see more results</p>
                                    <button
                                        onClick={clearFilters}
                                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                                    >
                                        Clear Filters
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
                                >
                                    {products.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

