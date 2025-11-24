import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    // Step 1: Send magic link to email (login/register)
    login: (email: string) => {
        return api.post('/api/auth/log', { email });
    },
    // Step 2: Verify Supabase access token from email link
    verifyEmail: (token: string) => {
        return api.post('/api/auth/varify-email', {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },
    // Legacy verify code endpoint (kept for compatibility)
    verifyCode: (email: string, code: string) => api.post('/api/auth/verify', { email, code }),
};

// User API
export const userAPI = {
    getProfile: () => {
        return api.post('/user/get-user-profile', {}, {
            withCredentials: true
        });
    },
    getOrders: () => {
        return api.post('/user/get-orders', {}, {
            withCredentials: true
        });
    },
    getAddresses: () => {
        return api.post('/user/get-user-addresess', {}, {
            withCredentials: true
        });
    },
    getCart: () => api.post('/user/get-user-cart', {}, {
        withCredentials: true
    }).catch((error) => {
        if (error.response?.status === 404) {
            throw new Error('Cart endpoint not available. Using localStorage only.');
        }
        if (error.response?.status === 403) {
            throw new Error('Authentication required for cart. Using localStorage only.');
        }
        throw error;
    }),
    saveCart: (cartItems: Array<Record<string, unknown>>) => api.post('/user/save-cart', { cartItems }, {
        withCredentials: true
    }).catch((error) => {
        if (error.response?.status === 404) {
            throw new Error('Save cart endpoint not available. Cart saved to localStorage only.');
        }
        if (error.response?.status === 403) {
            throw new Error('Authentication required to save cart. Cart saved to localStorage only.');
        }
        throw error;
    }),
    addToCart: (productId: number, quantity: number) => api.post('/user/add-to-cart', { product_id: productId, quantity }, {
        withCredentials: true
    }).catch((error) => {
        if (error.response?.status === 404) {
            throw new Error('Add to cart endpoint not available.');
        }
        if (error.response?.status === 403) {
            throw new Error('Authentication required to add to cart.');
        }
        throw error;
    }),
    removeFromCart: (productId: number) => api.get(`/user/remove-cart-by-product/${productId}`, {
        withCredentials: true
    }).catch((error) => {
        if (error.response?.status === 404) {
            throw new Error('Remove from cart endpoint not available.');
        }
        if (error.response?.status === 403) {
            throw new Error('Authentication required to remove from cart.');
        }
        throw error;
    }),
    updateCartItem: (productId: number, quantity: number) => api.post('/user/update-cart-item', { product_id: productId, quantity }, {
        withCredentials: true
    }).catch((error) => {
        if (error.response?.status === 404) {
            throw new Error('Update cart item endpoint not available.');
        }
        if (error.response?.status === 403) {
            throw new Error('Authentication required to update cart item.');
        }
        throw error;
    }),
    clearCart: () => api.post('/user/clear-cart', {}, {
        withCredentials: true
    }).catch((error) => {
        if (error.response?.status === 404) {
            throw new Error('Clear cart endpoint not available.');
        }
        if (error.response?.status === 403) {
            throw new Error('Authentication required to clear cart.');
        }
        throw error;
    }),
    createAddress: async (address: unknown) => {
        try {
            const response = await api.post('/user/create-newAddress', address);
            return response;
        } catch (error) {
            console.error('Error creating address:', error);

            // If we have response data with a specific error message, use that
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string; error?: string }, status?: number } };
                if (apiError.response?.data?.message) {
                    // Check if it's a duplicate phone number error
                    if (apiError.response.data.message.includes('phone') &&
                        (apiError.response.data.message.includes('already') ||
                            apiError.response.data.message.includes('exist') ||
                            apiError.response.data.message.includes('unique'))) {
                        throw new Error('An address with this phone number already exists.');
                    } else {
                        throw new Error(apiError.response.data.message);
                    }
                } else if (apiError.response?.data?.error) {
                    throw new Error(apiError.response.data.error);
                } else if (apiError.response?.status === 500) {
                    // Handle 500 errors specifically for phone number conflicts
                    throw new Error('An address with this phone number already exists.');
                }
            }

            // Re-throw the original error if we can't provide a better one
            throw error;
        }
    },

    updateAddress: async (addressId: number, address: Record<string, unknown>) => {
        try {
            const response = await api.patch('/user/update-user-address', { address_id: addressId, ...address });
            return response;
        } catch (error) {
            console.error('Error updating address:', error);

            // If we have response data with a specific error message, use that
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string; error?: string }, status?: number } };
                if (apiError.response?.data?.message) {
                    // Check if it's a duplicate phone number error
                    if (apiError.response.data.message.includes('phone') &&
                        (apiError.response.data.message.includes('already') ||
                            apiError.response.data.message.includes('exist') ||
                            apiError.response.data.message.includes('unique'))) {
                        throw new Error('An address with this phone number already exists.');
                    } else {
                        throw new Error(apiError.response.data.message);
                    }
                } else if (apiError.response?.data?.error) {
                    throw new Error(apiError.response.data.error);
                } else if (apiError.response?.status === 500) {
                    // Handle 500 errors specifically for phone number conflicts
                    throw new Error('An address with this phone number already exists.');
                }
            }

            // Re-throw the original error if we can't provide a better one
            throw error;
        }
    },

    createOrder: async (orderData: { address_id: number; items: Array<{ product_id: number; quantity: number }> }) => {
        // Get user ID from localStorage
        const user = localStorage.getItem('user');
        let userId = null;
        if (user) {
            try {
                const userData = JSON.parse(user);
                userId = userData.id;
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }

        try {
            const response = await api.post('/user/create-order', {
                ...orderData,
                decode_user: userId
            }, {
                withCredentials: true
            });

            return response;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    cancelOrder: (orderId: string) =>
        api.post("/user/cancel-order", { order_id: orderId }),

};

// Product API
export const productAPI = {
    getProducts: () => api.get('/user/show-product'),
    getProductById: (id: number) => api.get(`/user/get-product-byid/${id}`),
    getProductByCategory: (category: string) => api.get(`/user/get-product-byCategory/${category}`),
    searchProduct: (search: string, price?: number) => {
        return api.post('/user/search', { search, price });
    },
    getCategories: () => {
        return api.get('/user/get-categories');
    },
};

// Admin API
// Note: Admin login uses username/password (no session/token creation)
// Admin routes are not protected by middleware in backend
export const adminAPI = {
    login: (userName: string, password: string) => api.post('/admin/login', { userName, password }),
    addCategory: (name: string) => {
        return api.post('/admin/add-catagory', { name });
    },
    uploadProduct: (formData: FormData) => {
        return api.post('/admin/upload-product', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getProducts: () => {
        return api.get('/admin/get-products');
    },
    updateProduct: (productId: number, data: { price?: number; selling_price?: number; quantity?: number }) => {
        const url = `/admin/update-product/${productId}`;
        return api.patch(url, data);
    },
    getOrders: () => {
        return api.get('/admin/get-orders');
    },
    updateOrderStatus: (orderId: string, status: string) => {
        return api.patch('/admin/update-order-status', { order_id: orderId, status });
    }
};