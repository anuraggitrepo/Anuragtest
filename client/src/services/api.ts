import axios from 'axios';
import { Category, MenuItem, Order, OrderStats } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Categories API
export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),
  getById: (id: number) => api.get<Category>(`/categories/${id}`),
  create: (category: Partial<Category>) => api.post<{ id: number; message: string }>('/categories', category),
  update: (id: number, category: Partial<Category>) => api.put<{ message: string }>(`/categories/${id}`, category),
  delete: (id: number) => api.delete<{ message: string }>(`/categories/${id}`),
};

// Menu API
export const menuApi = {
  getAll: (params?: { category?: string; available?: boolean }) => 
    api.get<MenuItem[]>('/menu', { params }),
  getById: (id: number) => api.get<MenuItem>(`/menu/${id}`),
  create: (menuItem: Partial<MenuItem>) => api.post<{ id: number; message: string }>('/menu', menuItem),
  update: (id: number, menuItem: Partial<MenuItem>) => api.put<{ message: string }>(`/menu/${id}`, menuItem),
  toggleAvailability: (id: number, is_available: boolean) => 
    api.patch<{ message: string }>(`/menu/${id}/availability`, { is_available }),
  delete: (id: number) => api.delete<{ message: string }>(`/menu/${id}`),
};

// Orders API
export const ordersApi = {
  getAll: (params?: { status?: string; limit?: number }) => 
    api.get<Order[]>('/orders', { params }),
  getById: (id: number) => api.get<Order>(`/orders/${id}`),
  create: (order: Partial<Order>) => api.post<{ id: number; total_amount: number; message: string }>('/orders', order),
  updateStatus: (id: number, status: Order['status']) => 
    api.patch<{ message: string }>(`/orders/${id}/status`, { status }),
  getStats: () => api.get<OrderStats>('/orders/stats/summary'),
  cancel: (id: number) => api.delete<{ message: string }>(`/orders/${id}`),
};

// Health check
export const healthApi = {
  check: () => api.get<{ status: string; message: string }>('/health'),
};

export default api;