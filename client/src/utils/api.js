import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://lyallpur-barbq-production.up.railway.app';

// Public API instance (no auth)
export const publicApi = axios.create({
  baseURL: `${API_BASE}/api`,
});

// Admin API instance (with auth token)
export const adminApi = axios.create({
  baseURL: `${API_BASE}/api`,
});

adminApi.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('lbq_admin_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default publicApi;
