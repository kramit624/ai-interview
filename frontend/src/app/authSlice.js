import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

const savedUser = (() => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    // ignore JSON parse/localStorage errors
    return null;
  }
})();

export const fetchProfile = createAsyncThunk("auth/fetchProfile", async () => {
  const res = await api.get("/auth/profile");
  return res.data;
});

export const login = createAsyncThunk("auth/login", async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
});

export const register = createAsyncThunk("auth/register", async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: savedUser, loading: savedUser ? false : true },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        // action.payload === res.data
        state.user = action.payload?.data?.user ?? null;
        state.loading = false;
        try {
          if (state.user) localStorage.setItem("user", JSON.stringify(state.user));
        } catch {
          // ignore localStorage set errors
        }
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.user = null;
        state.loading = false;
        try {
          localStorage.removeItem("user");
        } catch {
          // ignore localStorage remove errors
        }
      })
      .addCase(login.fulfilled, (state, action) => {
        // action.payload === res.data
        state.user = action.payload?.data?.user ?? null;
        try {
          if (state.user) localStorage.setItem("user", JSON.stringify(state.user));
        } catch {
          // ignore localStorage set errors
        }
      })
      .addCase(register.fulfilled, () => {
        // register returns full response; do not set user here
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        try {
          localStorage.removeItem("user");
        } catch {
          // ignore localStorage remove errors
        }
      });
  },
});

export default authSlice.reducer;
