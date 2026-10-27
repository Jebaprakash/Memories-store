import { useState, useEffect, useRef } from 'react';
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

    // Filter states initialized from URL search params
    const initialSearch = searchParams.get('search') || '';
    const [searchInput, setSearchInput] = useState(initialSearch);
    const debounceTimerRef = useRef(null);

    const [filters, setFilters] = useState({
        search: initialSearch,
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        inStock: searchParams.get('inStock') === 'true',
        sort: searchParams.get('sort') || 'newest',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    // Sync state when URL search params change
    useEffect(() => {
        const urlSearch = searchParams.get('search') || '';
        const urlCategory = searchParams.get('category') || '';
        const urlMinPrice = searchParams.get('minPrice') || '';
        const urlMaxPrice = searchParams.get('maxPrice') || '';
        const urlInStock = searchParams.get('inStock') === 'true';
        const urlSort = searchParams.get('sort') || 'newest';

        setSearchInput(urlSearch);
        const newFilters = {
            search: urlSearch,
            category: urlCategory,
            minPrice: urlMinPrice,
            maxPrice: urlMaxPrice,
            inStock: urlInStock,
            sort: urlSort,
        };
        setFilters(newFilters);
        fetchProducts(newFilters);
    }, [searchParams]);

    const fetchCategories = async () => {
        try {
            const res = await productsAPI.getCategories();
            if (res.data?.data) {
                setCategories(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async (currentFilters) => {
        setLoading(true);
        try {
            const params = {};
            if (currentFilters.search) params.search = currentFilters.search.trim();
            if (currentFilters.category) params.category = currentFilters.category;
            if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice;
            if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice;
            if (currentFilters.inStock) params.inStock = 'true';
            if (currentFilters.sort) params.sort = currentFilters.sort;

            const res = await productsAPI.getAll(params);
            setProducts(res.data?.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const updateFilterParam = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value !== undefined && value !== null && value !== '' && value !== false) {
            newParams.set(key, String(value));
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    const handleSearchChange = (value) => {
        setSearchInput(value);
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            updateFilterParam('search', value.trim());
        }, 350);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        updateFilterParam('search', searchInput.trim());
    };

    const handleFilterChange = (key, value) => {
        updateFilterParam(key, value);
    };

    const clearFilters = () => {
        setSearchInput('');
        setSearchParams({});
    };

    const activeFilterCount = [
        filters.search,
        filters.category,
        filters.minPrice,
        filters.maxPrice,
        filters.inStock,
    ].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-cream-50 pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-4 block">
                            Curated Collections
                        </span>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-cream-900 tracking-tighter">
                            EXPLORE <span className="text-cream-400">ALL.</span>
                        </h1>
                        <p className="text-xs font-bold text-cream-500 uppercase tracking-widest mt-2">
                            {loading ? 'Discovering pieces...' : `${products.length} ${products.length === 1 ? 'item' : 'items'} available`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center space-x-2 px-5 py-3.5 bg-white border border-border-cream rounded-2xl font-black text-xs uppercase tracking-widest text-cream-900 shadow-sm"
                        >
                            <svg className="w-4 h-4 text-cream-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span>Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="ml-1 w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-black flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* Sorting Dropdown */}
                        <div className="relative group">
                            <select
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                aria-label="Sort products"
                                className="appearance-none bg-white border border-border-cream rounded-2xl px-6 py-3.5 pr-11 font-black text-xs uppercase tracking-widest text-cream-900 outline-none focus:border-primary-500 transition-all cursor-pointer shadow-sm hover:border-cream-300"
                            >
                                <option value="newest">Sort by: Newest</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cream-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
                    {/* Filters Sidebar */}
                    <aside className={`lg:col-span-3 space-y-8 bg-white/70 p-6 rounded-3xl border border-border-cream/80 backdrop-blur-sm self-start shadow-sm ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        {/* Header inside sidebar with Clear button */}
                        <div className="flex items-center justify-between pb-4 border-b border-border-cream">
                            <span className="text-xs font-black uppercase tracking-widest text-cream-900">
                                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                            </span>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-[11px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider"
                                >
                                    Reset All
                                </button>
                            )}
                        </div>

                        {/* Search Input */}
                        <div>
                            <h3 className="text-[10px] font-black text-cream-900 uppercase tracking-[0.25em] mb-3">
                                Search Keywords
                            </h3>
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Search gifts, frames..."
                                    className="w-full bg-white border border-border-cream rounded-xl py-3 pl-10 pr-8 text-sm font-semibold text-cream-900 placeholder-cream-400 outline-none focus:border-primary-500 transition-all shadow-sm"
                                />
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={() => handleSearchChange('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-400 hover:text-cream-700"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* In-Stock Filter */}
                        <div>
                            <h3 className="text-[10px] font-black text-cream-900 uppercase tracking-[0.25em] mb-3">
                                Availability
                            </h3>
                            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-white border border-border-cream rounded-xl hover:border-cream-300 transition-all">
                                <input
                                    type="checkbox"
                                    checked={filters.inStock}
                                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                    className="w-4 h-4 text-primary-600 rounded border-cream-300 focus:ring-primary-500 accent-primary-600 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-cream-800">
                                    In Stock Only
                                </span>
                            </label>
                        </div>

                        {/* Categories Filter */}
                        <div>
                            <h3 className="text-[10px] font-black text-cream-900 uppercase tracking-[0.25em] mb-3">
                                Category
                            </h3>
                            <div className="flex flex-wrap lg:flex-col gap-1.5">
                                <button
                                    onClick={() => handleFilterChange('category', '')}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left ${
                                        filters.category === ''
                                            ? 'bg-cream-900 text-white shadow-sm'
                                            : 'bg-white text-cream-600 hover:bg-cream-100/60 border border-border-cream'
                                    }`}
                                >
                                    All Categories
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleFilterChange('category', cat)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left capitalize ${
                                            filters.category === cat
                                                ? 'bg-cream-900 text-white shadow-sm'
                                                : 'bg-white text-cream-600 hover:bg-cream-100/60 border border-border-cream'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div>
                            <h3 className="text-[10px] font-black text-cream-900 uppercase tracking-[0.25em] mb-3">
                                Price Range (₹)
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-cream-400 uppercase tracking-wider">Min (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        className="w-full bg-white border border-border-cream rounded-xl py-2.5 px-3 text-xs font-bold text-cream-900 outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-cream-400 uppercase tracking-wider">Max (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Any"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        className="w-full bg-white border border-border-cream rounded-xl py-2.5 px-3 text-xs font-bold text-cream-900 outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="w-full py-3 text-[11px] font-black text-cream-500 hover:text-red-500 transition-colors uppercase tracking-widest border-t border-border-cream pt-4"
                            >
                                Reset Preferences
                            </button>
                        )}
                    </aside>

                    {/* Products Grid */}
                    <main className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <LoadingSkeleton key={i} type="product" />
                                    ))}
                                </motion.div>
                            ) : products.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-3xl border border-border-cream text-center shadow-sm"
                                >
                                    <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mb-5 text-cream-400">
                                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black text-cream-900 mb-2 tracking-tight">
                                        No products found
                                    </h3>
                                    <p className="text-sm text-cream-500 font-medium max-w-md mb-8">
                                        {filters.search
                                            ? `We couldn't find any items matching "${filters.search}". Try checking for spelling errors or adjusting filters.`
                                            : 'No products match your selected criteria. Try adjusting the price range or filters.'}
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="px-8 py-3.5 bg-cream-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-primary-600 transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                                >
                                    {products.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.02 }}
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
