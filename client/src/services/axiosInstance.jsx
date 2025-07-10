// src/services/axiosInstance.ts
import axios from "axios";
import { API_BASE_URL } from "../env"

// Create instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // optional
});

// Request interceptor to add access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
