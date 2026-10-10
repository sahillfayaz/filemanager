import axios from "axios";
import { clearSession, getToken } from "./session.js";

const apiBaseUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 20000,
  withCredentials: true
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const payload = error.response?.data;
    const message = payload?.message || error.message || "Network request failed";
    if (error.response?.status === 401) clearSession();
    return Promise.reject({ ...payload, message, status: error.response?.status });
  }
);

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const unwrap = (response) => response?.data;
