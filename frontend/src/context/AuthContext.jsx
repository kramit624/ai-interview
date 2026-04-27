import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile as fetchProfileThunk,
  login as loginThunk,
  register as registerThunk,
  logout as logoutThunk,
} from "../app/authSlice";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // This provider acts as a thin compatibility layer so existing code using
  // useAuth() continues to work. The actual state and side-effects live in Redux.
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth || { user: null, loading: true });

  const fetchProfile = async () => {
    return dispatch(fetchProfileThunk());
  };

  useEffect(() => {
    // fetch profile once when provider mounts to restore session
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials) => {
    const action = await dispatch(loginThunk(credentials));
    if (action?.meta?.requestStatus === "rejected") {
      const msg = action.error?.message || action.payload?.message || "Login failed";
      throw new Error(msg);
    }
    const payload = action.payload;
    // Some backends return 200 with an error payload. Treat responses that
    // don't include a user or access token as failures so the UI can show an error.
    const maybeData = payload?.data || payload;
    const hasUser = !!maybeData?.user;
    const hasToken = !!(maybeData?.accessToken || maybeData?.access_token || maybeData?.token);
    if (!hasUser && !hasToken) {
      const msg = payload?.message || maybeData?.message || "Login failed";
      throw new Error(msg);
    }
    // Persist tokens if backend returned them in the response body
    try {
      const data = payload?.data || {};
      const access = data.accessToken || data.access_token || data.token;
      const refresh = data.refreshToken || data.refresh_token;
      if (access) localStorage.setItem("accessToken", access);
      if (refresh) localStorage.setItem("refreshToken", refresh);
    } catch {
      // ignore storage errors
    }
    // Immediately refresh profile in Redux so UI (avatar, name) updates
    await dispatch(fetchProfileThunk());
    return payload;
  };

  const register = async (data) => {
    const action = await dispatch(registerThunk(data));
    if (action?.meta?.requestStatus === "rejected") {
      const msg = action.error?.message || action.payload?.message || "Register failed";
      throw new Error(msg);
    }
    const payload = action.payload;
    const maybe = payload?.data || payload;
    const okUser = !!maybe?.user;
    const okToken = !!(maybe?.accessToken || maybe?.access_token || maybe?.token);
    if (!okUser && !okToken) {
      const msg = payload?.message || maybe?.message || "Register failed";
      throw new Error(msg);
    }
    try {
      const d = payload?.data || {};
      const access = d.accessToken || d.access_token || d.token;
      const refresh = d.refreshToken || d.refresh_token;
      if (access) localStorage.setItem("accessToken", access);
      if (refresh) localStorage.setItem("refreshToken", refresh);
    } catch {
      // ignore storage errors
    }
    // If registration also authenticates, fetch profile
    await dispatch(fetchProfileThunk());
    return payload;
  };

  const logout = async () => {
    await dispatch(logoutThunk());
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    } catch {
      // ignore storage errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        loading: auth.loading,
        login,
        register,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
