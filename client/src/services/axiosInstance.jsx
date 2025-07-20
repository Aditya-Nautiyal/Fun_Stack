// src/services/axiosInstance.ts
import axios from "axios";
import { API_BASE_URL } from "../env";
import { showLoader, hideLoader } from "../utility/loaderManager";

// Create instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Track how many calls are active
let activeCalls = 0;

// Request interceptor to add token & show loader
axiosInstance.interceptors.request.use(
  (config) => {
    activeCalls++;
    showLoader(); // 👈 Start loader

    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    activeCalls = Math.max(0, activeCalls - 1);
    if (activeCalls === 0) hideLoader(); // 👈 Stop if last request
    return Promise.reject(error);
  }
);

// Response interceptor to handle refresh and hide loader
axiosInstance.interceptors.response.use(
  (response) => {
    activeCalls = Math.max(0, activeCalls - 1);
    if (activeCalls === 0) hideLoader(); // 👈 Stop loader
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    activeCalls = Math.max(0, activeCalls - 1);
    if (activeCalls === 0) hideLoader(); // 👈 Stop loader on error too

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axiosInstance.post("/refresh-token", {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/loginAndSignUp";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
