import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    console.warn('VITE_API_URL is not defined. Falling back to localhost for development.');
}

const api = axios.create({
    baseURL: (API_URL ? (API_URL.endsWith('/') ? API_URL : `${API_URL}/`) : 'http://localhost:5000/api/'),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');

    // Use admin token for any admin API route
    if (config.url.startsWith('admin') || config.url.startsWith('/admin')) {
        if (adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`;
        }
    } else {
        // Use user token for all other routes (like /users/profile or /orders)
        if (userToken) {
            config.headers.Authorization = `Bearer ${userToken}`;
        }
    }

    return config;
});

// Handle unauthorized responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const isAdminRoute = window.location.pathname.startsWith('/portal-secure-mgt');

            if (isAdminRoute) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminData');
                if (!window.location.pathname.includes('/portal-secure-mgt/login')) {
                    window.location.href = '/portal-secure-mgt/login';
                }
            } else {
                localStorage.removeItem('userToken');
                localStorage.removeItem('userData');
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// Users API
export const usersAPI = {
    login: (data) => api.post('users/login', data),
    register: (data) => api.post('users/register', data),
    getProfile: () => api.get('users/profile'),
    updateProfile: (data) => api.put('users/profile', data),
};

// ... existing code ...

// Products API
export const productsAPI = {
    getAll: (params) => api.get('products', { params }),
    getById: (id) => api.get(`products/${id}`),
    getCategories: () => api.get('products/categories'),
};

// Orders API
export const ordersAPI = {
    create: (data, config) => api.post('orders', data, config),
    getById: (id) => api.get(`orders/${id}`),
    updatePaymentStatus: (orderId, paymentStatus) =>
        api.patch(`orders/${orderId}/payment-status`, { paymentStatus }),
    getUserOrders: (params) => api.get('orders/user', { params }),
};

// Admin API
export const adminAPI = {
    login: (credentials) => api.post('admin/login', credentials),

    // Categories
    getCategories: () => api.get('admin/categories'),
    createCategory: (data) => api.post('admin/categories', data),
    deleteCategory: (id) => api.delete(`admin/categories/${id}`),
    reorderCategories: (orderedIds) => api.patch('admin/categories/reorder', { orderedIds }),

    // Products
    getAllProducts: () => api.get('admin/products'),
    createProduct: (formData) => api.post('admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    updateProduct: (id, formData) => api.put(`admin/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteProduct: (id) => api.delete(`admin/products/${id}`),

    // Orders
    getAllOrders: (params) => api.get('admin/orders', { params }),
    updateOrder: (id, data) => api.patch(`admin/orders/${id}`, data),
    deleteOrder: (id) => api.delete(`admin/orders/${id}`),
    clearAllOrders: () => api.delete('admin/orders'),
};

export default api;
