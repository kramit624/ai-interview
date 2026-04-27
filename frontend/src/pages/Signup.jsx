import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  User,
  AtSign,
  GraduationCap,
  Code2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Signup = ({ theme }) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "fresher",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDark = theme === "dark";

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" },
    );
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition-all duration-200 ${
    isDark
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:bg-white"
  }`;

  const labelClass = `block text-sm font-medium mb-2 ${
    isDark ? "text-gray-300" : "text-gray-700"
  }`;

  const iconClass = `absolute left-3.5 top-1/2 -translate-y-1/2 ${
    isDark ? "text-gray-500" : "text-gray-400"
  }`;

  return (
    <div
      className={`min-h-screen pt-16 flex items-center justify-center px-4 py-8 relative overflow-hidden ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div ref={cardRef} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap size={20} className="text-white" fill="white" />
            </div>
          </Link>
          <h1
            className={`text-3xl font-extrabold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Create your account
          </h1>
          <p
            className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Join 50K+ developers already using InterviewAI
          </p>
        </div>

        <div
          className={`p-8 rounded-3xl border ${
            isDark
              ? "bg-gray-900 border-gray-800/60"
              : "bg-white border-gray-200 shadow-xl shadow-gray-200/60"
          }`}
        >
          {/* Role Selection */}
          <div className="mb-6">
            <p
              className={`text-sm font-medium mb-3 pl-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              <span className="text-sm font-medium pl-3">I am a...</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "fresher",
                  label: "Fresher",
                  desc: "Looking for a job",
                  icon: GraduationCap,
                },
                {
                  value: "developer",
                  label: "Developer",
                  desc: "Want to mentor",
                  icon: Code2,
                },
              ].map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, role: value })}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    form.role === value
                      ? "border-violet-500 bg-violet-500/10"
                      : isDark
                        ? "border-gray-700 hover:border-gray-600 bg-gray-800/40"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      form.role === value
                        ? "text-violet-500"
                        : isDark
                          ? "text-gray-400"
                          : "text-gray-500"
                    }
                  />
                  <span
                    className={`text-sm font-semibold mt-2 ${
                      form.role === value
                        ? "text-violet-500"
                        : isDark
                          ? "text-white"
                          : "text-gray-900"
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className={`text-xs mt-0.5 ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className={labelClass}>Full name</label>
              <div className="relative">
                <User size={16} className={iconClass} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Rahul Sharma"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className={labelClass}>Username</label>
              <div className="relative">
                <AtSign size={16} className={iconClass} />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="rahulsharma"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email address</label>
              <div className="relative">
                <Mail size={16} className={iconClass} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock size={16} className={iconClass} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? "text-gray-500 hover:text-gray-300"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p
            className={`text-center text-sm mt-6 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-500 hover:text-violet-400 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p
          className={`text-center text-xs mt-5 ${
            isDark ? "text-gray-600" : "text-gray-400"
          }`}
        >
          By signing up, you agree to our{" "}
          <Link to="/terms" className="text-violet-500">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-violet-500">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
