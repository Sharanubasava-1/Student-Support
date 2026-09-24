import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://student-support-1.onrender.com/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('edumerge_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;