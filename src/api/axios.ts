import axios from 'axios';

// Remove the hardcoded /api if VITE_API_URL already includes it, or just use what's provided
let apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Clean up trailing slash
if (apiBaseURL.endsWith('/')) {
  apiBaseURL = apiBaseURL.slice(0, -1);
}

// Ensure it ends with /api for consistency, unless it already does
if (!apiBaseURL.endsWith('/api')) {
  apiBaseURL += '/api';
}

const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;