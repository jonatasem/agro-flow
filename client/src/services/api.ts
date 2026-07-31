import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Automatically attaches the JWT token if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@agroflow:token");
  
  if (token) {
    // Ensures config.headers is initialized to prevent undefined type errors
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
