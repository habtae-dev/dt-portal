// Shared axios instance for the public site.
// Dev: vite.config.js proxies "/api/*" to the Express backend, so the default "/api" works as-is.
// Production: set VITE_API_BASE_URL to the API's full URL (e.g. https://api.debretabor.gov.et/api).
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000
});

export default axiosClient;
