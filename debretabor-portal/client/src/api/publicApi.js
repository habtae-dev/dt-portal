// Thin wrappers around the backend's public (unauthenticated) endpoints.
// Every list endpoint returns { success, count, data } (+ total/page/limit when ?limit= is sent).
import axiosClient from './axiosClient';

// Stored upload paths are relative ("/uploads/x.jpg"); make them absolute for <img>/<a>/<video>.
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000';
export const assetUrl = (url) => (!url ? null : /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url}`);

// JSON columns (images) arrive as arrays; tolerate a JSON string or null as well.
export const asArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
  return [];
};

const list = (path, params) => axiosClient.get(path, { params }).then((r) => r.data.data || []);
const page = (path, params) => axiosClient.get(path, { params }).then((r) => r.data);
const one = (path) => axiosClient.get(path).then((r) => r.data.data);

// ---- Announcements ----
export const fetchNewsPage = (params) => page('/news', params);        // { data, total, page, limit }
export const fetchNews = (params) => list('/news', params);
export const fetchNewsById = (id) => one(`/news/${id}`);
export const fetchTenders = (params) => list('/tenders', params);
export const fetchTenderById = (id) => one(`/tenders/${id}`);
export const fetchVacancies = (params) => list('/vacancies', params);
export const fetchVacancyById = (id) => one(`/vacancies/${id}`);
export const fetchEvents = (params) => list('/events', params);
export const fetchEventById = (id) => one(`/events/${id}`);
export const fetchNotices = (params) => list('/noticeboard', params);  // active, non-expired only
export const fetchNoticeById = (id) => one(`/noticeboard/${id}`);

// ---- Government, council, city ----
export const fetchExecutive = (category) => list('/executive', { category });   // mayor | cabinet | structure | bureau
export const fetchSubCities = () => list('/executive/sub-cities');
export const fetchCouncil = (subcategory) => list('/council', { subcategory }); // overview | structure | speaker | standing_committees
export const fetchAbout = (category) => list('/about', { category }).then((rows) => rows[0] || null);

// ---- Explore, projects, media ----
export const fetchPlaces = (category) => list('/places', { category });         // Park | Monument | Museum
export const fetchBusiness = (category) => list('/business', { category });
export const fetchProjects = (category) => list('/projects', { category });     // Program | Project
export const fetchPhotos = () => list('/photos');
export const fetchVideos = () => list('/videos');

// ---- Complaints ----
export const submitComplaint = (formData) =>
  axiosClient.post('/complaints/submit', formData).then((r) => r.data);          // multipart (optional attachment)
export const trackComplaint = (code) =>
  axiosClient.get(`/complaints/track/${encodeURIComponent(code.trim())}`).then((r) => r.data.data);

// ---- City facts (home page "City at a glance") and e-mail subscription ----
export const fetchCityFacts = () => list('/city-facts');
export const subscribeEmail = (email, language) => axiosClient.post('/subscribers', { email, language }).then((r) => r.data);
export const unsubscribeEmail = (token) => axiosClient.post('/subscribers/unsubscribe', { token }).then((r) => r.data);
