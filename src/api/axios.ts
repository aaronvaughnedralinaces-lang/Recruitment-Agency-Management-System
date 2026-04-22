import axios from 'axios';

// Use VITE_API_URL if set, otherwise fallback to localhost for development
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;