// src/api/axios.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "/";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 🔑 cookie auth
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
