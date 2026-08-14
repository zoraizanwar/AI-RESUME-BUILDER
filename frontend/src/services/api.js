import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/token/refresh/') {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
          const res = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken });
          localStorage.setItem('access', res.data.access);
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
