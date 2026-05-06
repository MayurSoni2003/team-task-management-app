import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();

const normalizeApiBaseUrl = (url) => {
  if (!url) return null;

  const withoutTrailingSlashes = url.replace(/\/+$/, '');
  return withoutTrailingSlashes.endsWith('/api')
    ? withoutTrailingSlashes
    : `${withoutTrailingSlashes}/api`;
};

const baseURL = normalizeApiBaseUrl(rawApiUrl)
  || (import.meta.env.DEV ? 'http://localhost:5000/api' : null);

if (!baseURL) {
  console.error(
    '%c[FATAL] VITE_API_URL is not set! All API calls will fail. Set it in Railway env vars and REDEPLOY.',
    'color: red; font-weight: bold; font-size: 16px;'
  );
}

console.log('[API] baseURL resolved to:', baseURL || '/api (FALLBACK - LIKELY BROKEN)');

const api = axios.create({
  baseURL: baseURL || '/api',
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if it's invalid/expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirecting to login is usually handled in the UI layer or via window.location here
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
