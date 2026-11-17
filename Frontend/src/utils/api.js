import axios from 'axios';

// ─── Axios Instance for LeadFlow Backend ──────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ─── Request Interceptor: Attach JWT Token if available ───────────────────────
api.interceptors.request.use(
  (config) => {
    try {
      const storedAuth = localStorage.getItem('leadflow_auth_user');
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch (err) {
      console.error('Error reading auth token from localStorage', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 (Expired) and 403 (Suspended) ─────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Check if user is suspended or token expired
      const isSuspended =
        status === 403 &&
        data?.message &&
        data.message.toLowerCase().includes('suspend');

      const isUnauthorized = status === 401;

      if (isSuspended || isUnauthorized) {
        // 1. Clear credentials from localStorage
        localStorage.removeItem('leadflow_auth_user');

        // 2. Redirect to login with reason if not already on login page
        if (!window.location.pathname.includes('/login')) {
          const reason = isSuspended ? 'suspended' : 'session_expired';
          window.location.href = `/login?reason=${reason}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

