import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
    const { getCartCount, toggleCart } = useCart();
    const { getWishlistCount } = useWishlist();
    const { isAuthenticated, user } = useAuth();
    const cartCount = getCartCount();
    const wishlistCount = getWishlistCount();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const searchRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
    }, [location]);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? 'py-3 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)]'
                : 'py-6 bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative w-11 h-11 bg-slate-900 rounded-[14px] flex items-center justify-center shadow-2xl overflow-hidden"
                        >
                            <img src="/logo.png" alt="Memories Store" className="w-full h-full object-cover" />
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-primary-600 transition-colors uppercase">
                                MEMORIES<span className="text-primary-600"> STORE</span>
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">
                                Gifts & Photography
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="relative px-6 py-2 group"
                            >
                                <span className={`relative z-10 text-sm font-bold tracking-tight transition-colors duration-300 ${location.pathname === link.path ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                                    }`}>
                                    {link.name}
                                </span>
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-slate-100 rounded-2xl -z-0"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Search Desktop */}
                        <div className="hidden lg:block relative" ref={searchRef}>
                            <AnimatePresence>
                                {isSearchOpen ? (
                                    <motion.form
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 300, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        onSubmit={handleSearch}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center"
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search products..."
                                            className="w-full bg-slate-100 border-none rounded-2xl py-2.5 pl-4 pr-10 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                        />
                                        <button type="submit" className="absolute right-3 text-slate-400 hover:text-primary-600">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                    </motion.form>
                                ) : (
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={() => setIsSearchOpen(true)}
                                        className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Wishlist Button */}
                        <motion.button
                            onClick={() => navigate('/wishlist')}
                            aria-label="Wishlist"
                            className="relative p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <AnimatePresence>
                                {wishlistCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute top-2 right-2 bg-primary-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-xl"
                                    >
                                        {wishlistCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        {/* Cart Button */}
                        <motion.button
                            onClick={() => navigate('/cart')}
                            className="relative p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <AnimatePresence>
                                {cartCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute top-2 right-2 bg-primary-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-xl"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        {/* User Profile / Login */}
                        <Link to={isAuthenticated ? "/profile" : "/login"}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="hidden sm:flex p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all items-center space-x-2"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {isAuthenticated && (
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest hidden lg:block">
                                        Hi, {user?.firstName}
                                    </span>
                                )}
                            </motion.button>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-2xl overflow-hidden"
                    >
                        <div className="px-6 py-8 space-y-4">
                            <form onSubmit={handleSearch} className="relative mb-6">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-4 pr-12 text-sm font-bold outline-none"
                                />
                                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>

                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`block px-6 py-4 rounded-2xl text-lg font-black transition-all ${location.pathname === link.path
                                        ? 'text-primary-600 bg-primary-50'
                                        : 'text-slate-600'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <Link
                                to="/wishlist"
                                className={`flex items-center justify-between px-6 py-4 rounded-2xl text-lg font-black transition-all ${location.pathname === '/wishlist'
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-slate-600'
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    Wishlist
                                </span>
                                {wishlistCount > 0 && (
                                    <span className="px-2.5 py-0.5 bg-primary-600 text-white text-xs rounded-full font-black">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            <hr className="border-slate-100" />

                            <Link
                                to={isAuthenticated ? "/profile" : "/login"}
                                className="flex items-center space-x-3 px-6 py-4 text-slate-600 font-bold"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{isAuthenticated ? `Hi, ${user?.firstName}` : "Sign In"}</span>
                            </Link>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
