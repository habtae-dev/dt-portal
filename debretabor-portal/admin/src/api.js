// One axios instance for the whole dashboard: base URL from VITE_API_ORIGIN, JWT attached automatically,
// and an expired/invalid session (401) sends the user back to the login page.
import axios from 'axios';
import { API_ORIGIN } from './config';

const api = axios.create({ baseURL: API_ORIGIN });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const onLogin = window.location.pathname.endsWith('/login');
    if (err.response?.status === 401 && !onLogin) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;
