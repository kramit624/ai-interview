import axios from "axios";

const base = import.meta.env.VITE_API_URL ;
const api = axios.create({
  baseURL: base,
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

// Response interceptor: on 401, attempt to refresh access token using refresh token or cookie
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // avoid infinite loop
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const storedRefresh = localStorage.getItem("refreshToken");
        let resp = null;

        if (storedRefresh) {
          resp = await axios.post(`${base}/auth/refresh-token`, { token: storedRefresh }, { withCredentials: true });
        } else {
          // Cookie-based refresh: empty body but cookies will be sent because withCredentials:true
          resp = await axios.post(`${base}/auth/refresh-token`, {}, { withCredentials: true });
        }

        const newAccess = resp?.data?.data?.accessToken || resp?.data?.access_token || resp?.data?.token;
        if (newAccess) {
          try {
            localStorage.setItem("accessToken", newAccess);
          } catch (e) {
            console.debug("Failed to save access token", e);
          }
          api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        } else {
          // Server likely set an HttpOnly cookie for accessToken; remove any stored access token so axios relies on cookie
          try {
            localStorage.removeItem("accessToken");
          } catch (e) {
            console.debug("Failed to remove access token", e);
          }
        }

        return api(originalRequest);
      } catch (err) {
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } catch (e) {
          // ignore
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
