import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        if (!product || !product.id) return;
        const addQty = Math.max(1, parseInt(quantity, 10) || 1);

        if (product.stockQty <= 0) {
            toast.error(`${product.name} is currently out of stock`);
            return;
        }

        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            const parsedPrice = typeof product.price === 'string'
                ? parseFloat(product.price.replace(/,/g, ''))
                : Number(product.price || 0);

            if (existingItem) {
                const newQty = existingItem.quantity + addQty;
                if (newQty > product.stockQty) {
                    toast.error(`Only ${product.stockQty} item(s) available in stock`);
                    return prevItems;
                }

                toast.success('Bag updated!');
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: newQty, price: parsedPrice, stockQty: product.stockQty }
                        : item
                );
            } else {
                if (addQty > product.stockQty) {
                    toast.error(`Only ${product.stockQty} item(s) available in stock`);
                    return prevItems;
                }

                toast.success('Added to bag!');
                return [...prevItems, { ...product, price: parsedPrice, quantity: addQty }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => {
            const item = prevItems.find((i) => i.id === productId);
            if (item) {
                toast.success(`${item.name} removed from bag`);
            }
            return prevItems.filter((i) => i.id !== productId);
        });
    };

    const updateQuantity = (productId, quantity) => {
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty < 1) {
            removeFromCart(productId);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === productId) {
                    if (qty > item.stockQty) {
                        toast.error(`Only ${item.stockQty} item(s) available in stock`);
                        return { ...item, quantity: item.stockQty };
                    }
                    return { ...item, quantity: qty };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const itemPrice = typeof item.price === 'string'
                ? parseFloat(item.price.replace(/,/g, ''))
                : Number(item.price || 0);
            return total + itemPrice * item.quantity;
        }, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + (item.quantity || 0), 0);
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isCartOpen,
        toggleCart,
        setIsCartOpen,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
