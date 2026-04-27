import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./app/store";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Interview from "./pages/Interview";
import InterviewSession from "./pages/Interviewsession";
import Analytics from "./pages/Analytics";
import LiveInterview from "./pages/LiveInterview";
import Developers from "./pages/Developers";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";

// Guard: redirect to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Poppins',sans-serif",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid #7c3aed",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
};

function AppLayout() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.style.background =
      theme === "dark" ? "#07070f" : "#f5f3ff";
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<Home theme={theme} />} />
        <Route path="/login" element={<Login theme={theme} />} />
        <Route path="/signup" element={<Signup theme={theme} />} />
        <Route path="/pricing" element={<Pricing theme={theme} />} />
        <Route path="/developers" element={<Developers theme={theme} />} />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview theme={theme} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/session/:id"
          element={
            <ProtectedRoute>
              <InterviewSession theme={theme} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/live/:id"
          element={
            <ProtectedRoute>
              <LiveInterview theme={theme} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics theme={theme} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile theme={theme} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer theme={theme} />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}
