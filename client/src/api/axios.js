import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Enables transmitting secure HttpOnly cookies across requests
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('alumniconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('alumniconnect_token');
      // Only redirect if user is on a protected route, avoiding jarring bounce on public landing
      const publicPaths = ['/', '/login', '/register', '/signup', '/auth/github/callback'];
      if (!publicPaths.includes(window.location.pathname) && !window.location.pathname.startsWith('/#')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
