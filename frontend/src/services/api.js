import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Format image URL helper
export const resolveImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/uploads')) {
    const origin = API_URL.replace(/\/api\/?$/, '');
    return `${origin}${url}`;
  }
  return url;
};

// Products
export const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  search: (query, maxResults = 8) => 
    api.post('/products/search', { query, max_results: maxResults }),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  updateImage: (id, imageUrl) => api.put(`/products/${id}/image`, { image_url: imageUrl }),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Customers
export const customerService = {
  getAll: () => api.get('/customers'),
  create: (customerData) => api.post('/customers', customerData),
  getById: (id) => api.get(`/customers/${id}`),
};

// Events
export const eventService = {
  record: (eventData) => api.post('/events', eventData),
  getByCustomerId: (customerId) => api.get(`/events/customer/${customerId}`),
};

// Cart
export const cartService = {
  get: (customerId) => api.get(`/cart/${customerId}`),
  add: (customerId, productId, quantity = 1) =>
    api.post('/cart/add', { customer_id: customerId, product_id: productId, quantity }),
  remove: (cartId, productId) =>
    api.post('/cart/remove', { cart_id: cartId, product_id: productId }),
  checkout: (customerId) => api.post(`/cart/${customerId}/checkout`),
};

// Agent
export const agentService = {
  analyze: (customerId) => api.post(`/agent/analyze/${customerId}`),
  recover: (customerId) => api.post(`/agent/recover/${customerId}`),
  getDecisions: (limit = 20) => api.get('/agent/decisions', { params: { limit } }),
  getDecisionById: (id) => api.get(`/agent/decisions/${id}`),
};

// Payments
export const paymentService = {
  createLink: (customerId, amount, cartId = null) =>
    api.post('/payments/create-link', { customer_id: customerId, amount, cart_id: cartId }),
  getStatus: (paymentId) => api.get(`/payments/${paymentId}`),
  mockSuccess: (paymentLinkId) => api.post(`/payments/mock-success/${paymentLinkId}`),
};

// Dashboard
export const dashboardService = {
  getMetrics: () => api.get('/dashboard/metrics'),
  getActivity: (limit = 10) => api.get('/dashboard/activity', { params: { limit } }),
  getRevenueChart: (days = 7) => api.get('/dashboard/revenue-chart', { params: { days } }),
  getFull: () => api.get('/dashboard'),
};

// Seed reset
export const seedService = {
  reset: () => api.post('/seed/reset'),
};

// Health
export const healthService = {
  check: () => api.get('/health'),
};

export default api;
