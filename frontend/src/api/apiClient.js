import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// Attach token for protected routes automatically
API.interceptors.request.use(
  (config) => {
    if (config.url !== '/auth/login') {
      const token = localStorage.getItem('token');
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Utility to store/remove token
export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export default API;
