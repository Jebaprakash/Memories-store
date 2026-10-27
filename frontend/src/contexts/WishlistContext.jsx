import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const { addToCart } = useCart();
    const [wishlistItems, setWishlistItems] = useState(() => {
        try {
            const saved = localStorage.getItem('wishlist');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading wishlist from localStorage:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
        } catch (error) {
            console.error('Error saving wishlist to localStorage:', error);
        }
    }, [wishlistItems]);

    const isInWishlist = (productId) => {
        return wishlistItems.some((item) => item.id === productId);
    };

    const addToWishlist = (product) => {
        if (!product || !product.id) return;
        setWishlistItems((prev) => {
            if (prev.some((item) => item.id === product.id)) {
                return prev;
            }
            toast.success(`${product.name} saved to wishlist!`, {
                icon: '❤️',
            });
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems((prev) => {
            const item = prev.find((p) => p.id === productId);
            if (item) {
                toast.success(`${item.name} removed from wishlist`);
            }
            return prev.filter((p) => p.id !== productId);
        });
    };

    const toggleWishlist = (product) => {
        if (!product || !product.id) return;
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const moveToCart = (product) => {
        if (!product || !product.id) return;
        if (product.stockQty <= 0) {
            toast.error('This product is currently out of stock');
            return;
        }
        addToCart(product, 1);
        removeFromWishlist(product.id);
    };

    const clearWishlist = () => {
        setWishlistItems([]);
        toast.success('Wishlist cleared');
    };

    const getWishlistCount = () => {
        return wishlistItems.length;
    };

    const value = {
        wishlistItems,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        moveToCart,
        clearWishlist,
        getWishlistCount,
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
