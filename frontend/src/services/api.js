import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

// CSRF token storage
let csrfToken = null;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize CSRF token from backend
export async function initCSRF() {
  try {
    // CSRF token endpoint is at root level, not under /v1
    const baseURL = API_URL.replace('/v1', '');
    const response = await axios.get(`${baseURL}/csrf-token`);
    csrfToken = response.data.csrfToken;
    console.log('CSRF token initialized');
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
}

// Request interceptor - add auth token and CSRF token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing operations
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      } else {
        console.warn('CSRF token not available for', config.method, config.url);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Try to refresh token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        }, {
          headers: {
            'X-CSRF-Token': csrfToken || '',
          },
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
