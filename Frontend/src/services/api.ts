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
        return api.post('/user/get-user-profile',{},{
            withCredentials:true
        });
    },
    getOrders: () => {
        return api.post('/user/get-orders',{},{
            withCredentials:true
        });
    },
    getAddresses: () => {
        return api.post('/user/get-user-addresess',{},{
            withCredentials:true
        });
    },
    getCart: () => api.post('/user/get-user-cart',{},{
            withCredentials:true
        }).catch((error) => {
        if (error.response?.status === 404) {
            throw new Error('Cart endpoint not available. Using localStorage only.');
        }
        throw error;
    }),
    saveCart: (cartItems: Array<Record<string, unknown>>) => api.post('/user/cart', { cartItems }).catch((error) => {
        if (error.response?.status === 404) {
            throw new Error('Save cart endpoint not available. Cart saved to localStorage only.');
        }
        throw error;
    }),
    createAddress: async(address: unknown) => await api.post('/user/create-newAddress', address),
    updateAddress: async(addressId: number, address: unknown) => await api.put(`/user/update-address/${addressId}`, address).catch((error) => {
        if (error.response?.status === 404) {
            throw new Error('Update address endpoint not available.');
        }
        throw error;
    }),
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