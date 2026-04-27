import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.BASE_URL|| "http://localhost:5000/api/v1",
  withCredentials: true,
});

// Attach access token from localStorage (if present) to every request
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    // ignore localStorage access errors
  }
  return config;
});

// Response interceptor: on 401, attempt to refresh access token using refresh token
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    // avoid infinite loop
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return Promise.reject(error);

        // call refresh endpoint directly with axios to avoid interceptor recursion
        const resp = await axios.post(
          "http://localhost:5000/api/v1/auth/refresh-token",
          { token: refreshToken },
          { withCredentials: true },
        );

        const newAccess = resp?.data?.data?.accessToken;
        if (newAccess) {
          try {
            localStorage.setItem("accessToken", newAccess);
          } catch {
            // ignore storage write errors
          }
          api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
          return api(originalRequest);
        }
      } catch {
        // refresh failed — clear tokens and reject
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } catch {
          // ignore
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
