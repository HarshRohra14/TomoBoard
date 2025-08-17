import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://tomoboard-backend.vercel.app';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  logoutAll: () => api.post('/auth/logout-all'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
};

// Whiteboard API functions
export const whiteboardAPI = {
  list: (params = {}) => api.get('/whiteboards', { params }),
  get: (id) => api.get(`/whiteboards/${id}`),
  create: (data) => api.post('/whiteboards', data),
  update: (id, data) => api.put(`/whiteboards/${id}`, data),
  delete: (id) => api.delete(`/whiteboards/${id}`),
  addCollaborator: (id, data) => api.post(`/whiteboards/${id}/collaborators`, data),
  removeCollaborator: (id, userId) => api.delete(`/whiteboards/${id}/collaborators/${userId}`),
};

// User API functions
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  removeAvatar: () => api.delete('/users/avatar'),
  changePassword: (data) => api.put('/users/password', data),
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
  deleteAccount: (data) => api.delete('/users/account', { data }),
};

// Health check
export const healthAPI = {
  check: () => axios.get(`${API_BASE_URL}/health`),
};

export default api;
