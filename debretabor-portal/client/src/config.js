// Deployment-specific public details. Everything comes from Vite env vars (see client/.env.example)
// so no placeholder or unverified facts are shipped in the code: anything left empty is simply hidden.
const env = import.meta.env;

export const SITE = {
  adminUrl: env.VITE_ADMIN_URL || 'http://localhost:5174/admin/login',
  contact: {
    address: env.VITE_CONTACT_ADDRESS || '',
    email: env.VITE_CONTACT_EMAIL || '',
    phone: env.VITE_CONTACT_PHONE || ''
  }
};
