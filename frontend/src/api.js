import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Attach userId and optionally Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const userId = localStorage.getItem("userId") || "demo-user";
  config.headers = config.headers || {};
  config.headers["x-user-id"] = userId;

  // Attach Firebase auth token if user is logged in with Google
  try {
    const { auth, firebaseConfigured } = await import("./firebase.js");
    if (firebaseConfigured && auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    // Firebase not available — fine, userId header is the fallback
  }

  return config;
});

export default api;
