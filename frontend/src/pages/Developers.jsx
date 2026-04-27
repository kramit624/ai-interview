import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Users,
  Search,
  Star,
  Calendar,
  Clock,
  Code2,
  CheckCircle2,
  Filter,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

gsap.registerPlugin(ScrollTrigger);

const skillColors = {
  react: "#61dafb",
  node: "#6cc24a",
  javascript: "#f7df1e",
  python: "#3776ab",
  typescript: "#3178c6",
  mongodb: "#47a248",
  express: "#ffffff",
  vue: "#42b883",
  default: "#7c3aed",
};

const getSkillColor = (s) =>
  skillColors[s?.toLowerCase()] ?? skillColors.default;

const mockDevs = [
  {
    _id: "1",
    name: "Arjun Nair",
    username: "arjunnair",
    role: "developer",
    bio: "Senior Fullstack @ Swiggy. 5y exp. React, Node, System Design specialist.",
    avatar: null,
    skills: ["React", "Node.js", "MongoDB", "System Design"],
    rating: 4.9,
    sessions: 142,
    price: 299,
    badge: "Top Rated",
  },
  {
    _id: "2",
    name: "Priya Kapoor",
    username: "priyakapoor",
    role: "developer",
    bio: "SDE-2 @ Flipkart. Backend systems, DSA and interview coaching.",
    avatar: null,
    skills: ["Python", "Node.js", "MongoDB", "DSA"],
    rating: 4.8,
    sessions: 89,
    price: 249,
    badge: "Popular",
  },
  {
    _id: "3",
    name: "Rahul Singh",
    username: "rahulsingh",
    role: "developer",
    bio: "Frontend Lead @ Razorpay. Loves React, TypeScript and UI engineering.",
    avatar: null,
    skills: ["React", "TypeScript", "CSS", "Performance"],
    rating: 4.7,
    sessions: 63,
    price: 199,
    badge: null,
  },
  {
    _id: "4",
    name: "Sneha Joshi",
    username: "snehajoshi",
    role: "developer",
    bio: "Full-stack dev with 4 years in startups. Strong in backend & APIs.",
    avatar: null,
    skills: ["Node.js", "Express", "MongoDB", "React"],
    rating: 4.6,
    sessions: 47,
    price: 179,
    badge: "New",
  },
  {
    _id: "5",
    name: "Dev Patel",
    username: "devpatel",
    role: "developer",
    bio: "ML Engineer @ Walmart. Interviews for backend and data roles.",
    avatar: null,
    skills: ["Python", "MongoDB", "System Design", "DSA"],
    rating: 4.9,
    sessions: 218,
    price: 349,
    badge: "Expert",
  },
  {
    _id: "6",
    name: "Ananya Sharma",
    username: "ananyasharma",
    role: "developer",
    bio: "MERN stack dev. Specialises in interview prep and code review.",
    avatar: null,
    skills: ["React", "Node.js", "JavaScript", "MongoDB"],
    rating: 4.5,
    sessions: 31,
    price: 149,
    badge: null,
  },
];

const badgeColor = {
  "Top Rated": "#f59e0b",
  Popular: "#6366f1",
  New: "#10b981",
  Expert: "#7c3aed",
};

const Developers = ({ theme }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const headerRef = useRef(null);

  const [devs, setDevs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingDev, setBookingDev] = useState(null);

  const pageBg = isDark ? "#07070f" : "#f5f3ff";
  const textMain = isDark ? "#f0eeff" : "#1e1b4b";
  const textSub = isDark ? "#6060a0" : "#7b7aa0";
  const cardBg = isDark ? "#0f0f1a" : "#ffffff";
  const cardBorder = isDark ? "#1e1e35" : "#ede9fe";
  const inputBg = isDark ? "#0f0f1a" : "#ffffff";
  const inputBorder = isDark ? "#1e1e35" : "#ddd6fe";

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -24 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
    );

    api
      .get("/developers")
      .then((res) => {
        const list = res.data?.data?.developers || mockDevs;
        setDevs(list);
        setFiltered(list);
        setLoading(false);
      })
      .catch(() => {
        setDevs(mockDevs);
        setFiltered(mockDevs);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(devs);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(
      devs.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.bio?.toLowerCase().includes(q) ||
          d.skills?.some((s) => s.toLowerCase().includes(q)),
      ),
    );
  }, [query, devs]);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(
        ".dev-card",
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.09,
          ease: "power3.out",
          delay: 0.1,
        },
      );
    }
  }, [loading, filtered]);

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        fontFamily: "'Poppins', sans-serif",
        paddingTop: 80,
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: "10%",
            width: 550,
            height: 550,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "5%",
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 65%)",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "40px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: 44 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.07em",
              background: "rgba(16,185,129,0.1)",
              color: "#10b981",
              border: "1px solid rgba(16,185,129,0.2)",
              marginBottom: 16,
            }}
          >
            <Users size={11} /> DEVELOPER MARKETPLACE
          </span>
          <h1
            style={{
              color: textMain,
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            Book a{" "}
            <span
              style={{
                background: "linear-gradient(130deg,#10b981,#6366f1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              real developer
            </span>
          </h1>
          <p
            style={{
              color: textSub,
              fontSize: 16,
              maxWidth: 500,
              marginBottom: 32,
            }}
          >
            Practice with senior engineers. Get human feedback that AI can't
            give you.
          </p>

          {/* Search */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280, position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: textSub,
                }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, skill, or tech…"
                style={{
                  width: "100%",
                  padding: "13px 16px 13px 46px",
                  borderRadius: 14,
                  border: `2px solid ${inputBorder}`,
                  background: inputBg,
                  color: textMain,
                  fontFamily: "inherit",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = inputBorder)}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["All", "React", "Node.js", "Python", "DSA"].map((f) => (
                <button
                  key={f}
                  onClick={() => setQuery(f === "All" ? "" : f)}
                  style={{
                    padding: "13px 18px",
                    borderRadius: 12,
                    border: `1.5px solid ${query === f || (f === "All" && !query) ? "#7c3aed" : inputBorder}`,
                    background:
                      query === f || (f === "All" && !query)
                        ? "rgba(124,58,237,0.1)"
                        : inputBg,
                    color:
                      query === f || (f === "All" && !query)
                        ? "#7c3aed"
                        : textSub,
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <p style={{ color: textSub, fontSize: 13, marginBottom: 24 }}>
          {filtered.length} developer{filtered.length !== 1 ? "s" : ""}{" "}
          available
        </p>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "3px solid #7c3aed",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ color: textSub, fontSize: 14 }}>Loading developers…</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.map((dev) => (
              <div
                key={dev._id}
                className="dev-card"
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 22,
                  padding: "24px",
                  position: "relative",
                  overflow: "hidden",
                  transition:
                    "transform 0.25s, box-shadow 0.25s, border-color 0.25s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 24px 50px rgba(124,58,237,0.15)";
                  e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = cardBorder;
                }}
              >
                {dev.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: 18,
                      right: 18,
                      padding: "4px 12px",
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 700,
                      background: `${badgeColor[dev.badge] ?? "#7c3aed"}18`,
                      color: badgeColor[dev.badge] ?? "#7c3aed",
                      border: `1px solid ${badgeColor[dev.badge] ?? "#7c3aed"}30`,
                    }}
                  >
                    {dev.badge}
                  </div>
                )}

                {/* Avatar + name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 16,
                  }}
                >
                  {dev.avatar ? (
                    <img
                      src={dev.avatar}
                      alt={dev.name}
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid rgba(124,58,237,0.3)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 18,
                        fontWeight: 800,
                        flexShrink: 0,
                        border: "2px solid rgba(124,58,237,0.3)",
                      }}
                    >
                      {getInitials(dev.name)}
                    </div>
                  )}
                  <div>
                    <p
                      style={{
                        color: textMain,
                        fontSize: 16,
                        fontWeight: 800,
                        marginBottom: 2,
                      }}
                    >
                      {dev.name}
                    </p>
                    <p style={{ color: textSub, fontSize: 12 }}>
                      @{dev.username}
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    color: textSub,
                    fontSize: 13,
                    lineHeight: 1.65,
                    marginBottom: 16,
                    minHeight: 44,
                  }}
                >
                  {dev.bio}
                </p>

                {/* Skills */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 18,
                  }}
                >
                  {(dev.skills || []).slice(0, 4).map((s) => (
                    <span
                      key={s}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 600,
                        background: isDark ? "#1a1a30" : "#f5f3ff",
                        color: isDark ? "#8080c0" : "#6d28d9",
                        border: `1px solid ${isDark ? "#2a2a50" : "#ddd6fe"}`,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "12px 0",
                    borderTop: `1px solid ${isDark ? "#141424" : "#f3f0ff"}`,
                    borderBottom: `1px solid ${isDark ? "#141424" : "#f3f0ff"}`,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span
                      style={{ color: textMain, fontSize: 13, fontWeight: 700 }}
                    >
                      {dev.rating}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <CheckCircle2 size={13} color="#10b981" />
                    <span style={{ color: textSub, fontSize: 12 }}>
                      {dev.sessions} sessions
                    </span>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <span
                      style={{ color: textMain, fontSize: 17, fontWeight: 900 }}
                    >
                      ₹{dev.price}
                    </span>
                    <span style={{ color: textSub, fontSize: 11 }}>
                      /session
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    user ? navigate(`/booking/${dev._id}`) : navigate("/login")
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                    color: "white",
                    fontFamily: "inherit",
                    fontSize: 14,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 6px 18px rgba(124,58,237,0.3)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 28px rgba(124,58,237,0.42)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 18px rgba(124,58,237,0.3)";
                  }}
                >
                  <Calendar size={15} /> Book a Session
                </button>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: textSub, fontSize: 14 }}>
              No developers found for "{query}"
            </p>
            <button
              onClick={() => setQuery("")}
              style={{
                marginTop: 12,
                padding: "10px 20px",
                borderRadius: 12,
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.2)",
                color: "#7c3aed",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Developers;
