import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized access
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on authentication failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const loginApi = (credentials) => API.post('/auth/login', credentials);
export const registerApi = (data) => API.post('/auth/register', data);
export const logoutApi = () => API.post('/auth/logout');
export const getMeApi = () => API.get('/auth/me');

// Users APIs
export const getUsersApi = (params) => API.get('/users', { params });
export const createUserApi = (data) => API.post('/users', data);
export const getUserByIdApi = (id) => API.get(`/users/${id}`);
export const updateUserApi = (id, data) => API.put(`/users/${id}`, data);
export const changePasswordApi = (id, data) => API.put(`/users/${id}/password`, data);

// Stores APIs
export const getStoresApi = (params) => API.get('/stores', { params });
export const createStoreApi = (data) => API.post('/stores', data);
export const getStoreByIdApi = (id) => API.get(`/stores/${id}`);
export const updateStoreApi = (id, data) => API.put(`/stores/${id}`, data);
export const deleteStoreApi = (id) => API.delete(`/stores/${id}`);

// Ratings APIs
export const getRatingsApi = (params) => API.get('/ratings', { params });
export const submitRatingApi = (data) => API.post('/ratings', data);
export const updateRatingApi = (id, data) => API.put(`/ratings/${id}`, data);

// Dashboard APIs
export const getAdminDashboardApi = () => API.get('/admin/dashboard');
export const getStoreOwnerDashboardApi = () => API.get('/store-owner/dashboard');

export default API;
