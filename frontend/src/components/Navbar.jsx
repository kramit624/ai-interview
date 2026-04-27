import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  Sun,
  Moon,
  ChevronDown,
  User,
  BarChart2,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ theme, toggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    if (menuOpen && dropdownRef.current) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -10, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: "power2.out" },
      );
    }
  }, [menuOpen]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Interview", to: "/interview" },
    { label: "Developers", to: "/developers" },
    { label: "Pricing", to: "/pricing" },
  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        theme === "dark"
          ? "bg-gray-950/90 border-gray-800/60"
          : "bg-white/90 border-gray-200/80"
      } backdrop-blur-xl border-b`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span
              className={`text-lg font-bold tracking-tight ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              InterviewAI
            </span>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-white/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                theme === "dark"
                  ? "text-gray-300 hover:text-white hover:bg-white/10"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {!user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    theme === "dark"
                      ? "text-gray-300 hover:text-white hover:bg-white/10"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-violet-500/25"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 ${
                    theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"
                  }`}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-violet-500/30">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <span
                    className={`hidden sm:block text-sm font-medium ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    {user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    } ${menuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {menuOpen && (
                  <div
                    className={`absolute right-0 top-12 w-52 rounded-2xl border shadow-2xl py-2 ${
                      theme === "dark"
                        ? "bg-gray-900 border-gray-700/60 shadow-black/50"
                        : "bg-white border-gray-200 shadow-gray-200/60"
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 border-b mb-1 ${
                        theme === "dark"
                          ? "border-gray-700/60"
                          : "border-gray-100"
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {user.name}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {user.role}
                      </p>
                    </div>

                    {[
                      { icon: User, label: "Profile", to: "/profile" },
                      { icon: BarChart2, label: "Analytics", to: "/analytics" },
                    ].map(({ icon: Icon, label, to }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          theme === "dark"
                            ? "text-gray-300 hover:text-white hover:bg-white/5"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Icon size={15} />
                        {label}
                      </Link>
                    ))}

                    <div
                      className={`border-t mt-1 pt-1 ${
                        theme === "dark"
                          ? "border-gray-700/60"
                          : "border-gray-100"
                      }`}
                    >
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left text-red-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        <LogOut size={15} />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              className={`md:hidden w-9 h-9 rounded-xl flex items-center justify-center ml-1 transition-all duration-200 ${
                theme === "dark"
                  ? "text-gray-300 hover:text-white hover:bg-white/10"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className={`md:hidden pb-4 pt-2 border-t ${
              theme === "dark" ? "border-gray-800/60" : "border-gray-200"
            }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-white/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-2 mt-3 px-4">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className={`flex-1 text-center py-2 rounded-xl text-sm font-medium border transition-colors ${
                    theme === "dark"
                      ? "border-gray-700 text-gray-300 hover:bg-white/5"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
