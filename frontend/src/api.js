import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Attach user id from localStorage (falls back to demo-user)
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem("userId") || "demo-user";
  config.headers = config.headers || {};
  config.headers["x-user-id"] = userId;
  return config;
});

export default api;
