// Backend origin (no trailing slash, no /api). Set VITE_API_ORIGIN in admin/.env for production.
export const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000').replace(/\/+$/, '');

// Stored file paths are relative ("/uploads/x.jpg"); external links (http/https) are kept as they are.
export const assetUrl = (url) => (!url ? '' : /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url}`);
