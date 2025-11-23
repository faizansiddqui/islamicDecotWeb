import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../utils/productUtils';

interface WishlistContextType {
    wishlistItems: Product[];
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (productId: number) => Promise<void>;
    isInWishlist: (productId: number) => boolean;
    fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

    // Load wishlist from localStorage on initial render
    useEffect(() => {
        const loadWishlistFromLocalStorage = () => {
            try {
                const savedWishlist = localStorage.getItem('wishlist');
                if (savedWishlist) {
                    setWishlistItems(JSON.parse(savedWishlist));
                }
            } catch (error) {
                console.error('Failed to load wishlist from localStorage:', error);
            }
        };

        loadWishlistFromLocalStorage();
    }, []);

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
        } catch (error) {
            console.error('Failed to save wishlist to localStorage:', error);
        }
    }, [wishlistItems]);

    // Fetch wishlist from backend (to be implemented when backend is ready)
    const fetchWishlist = async () => {
        try {
            // TODO: Implement when backend endpoint is ready
            // const response = await api.get('/user/wishlist');
            // setWishlistItems(response.data.items);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        }
    };

    // Add item to wishlist (to be implemented when backend is ready)
    const addToWishlist = async (product: Product) => {
        try {
            // TODO: Implement when backend endpoint is ready
            // await api.post('/user/wishlist', { productId: product.id });
            setWishlistItems(prev => {
                // Check if product already exists in wishlist
                const exists = prev.some(item => item.product_id === product.product_id);
                if (exists) {
                    return prev;
                }
                return [...prev, product];
            });
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
        }
    };

    // Remove item from wishlist (to be implemented when backend is ready)
    const removeFromWishlist = async (productId: number) => {
        try {
            // TODO: Implement when backend endpoint is ready
            // await api.delete(`/user/wishlist/${productId}`);
            setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    };

    const isInWishlist = (productId: number) => {
        return wishlistItems.some(item => item.product_id === productId);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                fetchWishlist
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};