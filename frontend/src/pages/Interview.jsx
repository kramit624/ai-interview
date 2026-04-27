import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  Brain,
  MessageSquare,
  Zap,
  ArrowRight,
  FileText,
  Target,
  ChevronRight,
  Upload,
  Sparkles,
  Lock,
  BarChart2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Interview = ({ theme }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const headerRef = useRef(null);

  const [hasResume, setHasResume] = useState(null);
  const [starting, setStarting] = useState("");
  const [progress, setProgress] = useState(null);

  const pageBg = isDark ? "#07070f" : "#f5f3ff";
  const textMain = isDark ? "#f0eeff" : "#1e1b4b";
  const textSub = isDark ? "#6060a0" : "#7b7aa0";
  const cardBg = isDark ? "#0f0f1a" : "#ffffff";
  const cardBorder = isDark ? "#1e1e35" : "#ede9fe";

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -24 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
    );
    gsap.fromTo(
      ".iv-card",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.13,
        ease: "power3.out",
        delay: 0.25,
      },
    );
    gsap.fromTo(
      ".iv-side",
      { opacity: 0, x: 30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5,
      },
    );

    // Check localStorage first (fast), then verify with backend
    const cached = localStorage.getItem("resume");
    if (cached) {
      setHasResume(true);
    } else {
      api
        .get("/resume/mine")
        .then(() => setHasResume(true))
        .catch(() => setHasResume(false));
    }
  }, []);

  // Fetch lightweight analytics for the small "Your Progress" sidebar block
  useEffect(() => {
    let mounted = true;
    api
      .get("/aiTest/analytics")
      .then((res) => {
        if (!mounted) return;
        // the backend returns a top-level shape; store it as-is
        setProgress(res.data || null);
      })
      .catch(() => {
        if (!mounted) return;
        setProgress(null);
      });
    return () => (mounted = false);
  }, []);

  const handleStart = async (id) => {
    if (hasResume === false) {
      navigate("/profile");
      return;
    }
    setStarting(id);
    try {
      if (id === "live") {
        const res = await api.post("/live_interview/start");
        const interviewId = res?.data?.data?.interviewId ?? res?.data?.interviewId ?? res?.data?.id;
        if (!interviewId) throw new Error("Invalid response from server");
        // Persist start response for session page fallback
        try {
          const payload = res?.data?.data ?? res?.data ?? null;
          if (payload) sessionStorage.setItem(`aiTest:${interviewId}`, JSON.stringify(payload));
        } catch (err) {
          console.warn('Failed to persist live interview payload to sessionStorage', err);
        }
        navigate(`/interview/live/${interviewId}`);
      } else {
        const res = await api.post("/aiTest/start", { type: id });
        const interviewId = res?.data?.data?.interviewId ?? res?.data?.interviewId ?? res?.data?.id;
        if (!interviewId) throw new Error("Invalid response from server");
        try {
          const payload = res?.data?.data ?? res?.data ?? null;
          if (payload) sessionStorage.setItem(`aiTest:${interviewId}`, JSON.stringify(payload));
        } catch (err) {
          console.warn('Failed to persist aiTest payload to sessionStorage', err);
        }
        navigate(`/interview/session/${interviewId}?type=${id}`);
      }
    } catch (err) {
      console.warn('Error starting interview', err);
      setStarting("");
    }
  };

  const modes = [
    {
      id: "mcq",
      icon: Target,
      accent: "#7c3aed",
      title: "MCQ Sprint",
      sub: "Quick knowledge check",
      desc: "5 multiple-choice questions auto-generated from your resume skills. Perfect for daily practice or pre-interview warm-ups.",
      tags: ["5 Questions", "Auto-graded", "5 min"],
      badge: "Most Popular",
      badgeColor: "#7c3aed",
    },
    {
      id: "long",
      icon: Brain,
      accent: "#6366f1",
      title: "Deep Dive",
      sub: "AI-evaluated long form",
      desc: "3 in-depth technical questions. AI scores your answers on correctness, clarity, depth and real-world thinking.",
      tags: ["3 Questions", "AI Scored", "15 min"],
      badge: "Recommended",
      badgeColor: "#6366f1",
    },
    {
      id: "live",
      icon: MessageSquare,
      accent: "#8b5cf6",
      title: "Live Chat",
      sub: "Conversational AI round",
      desc: "Full back-and-forth with our AI interviewer. Adapts in real time — gets harder as you perform better.",
      tags: ["Adaptive", "Real-time", "10–30 min"],
      badge: "New ✨",
      badgeColor: "#10b981",
    },
  ];

  const tips = [
    ["💡", "Answer in full sentences — AI judges depth, not just keywords"],
    ["⏱️", "MCQ = 5 min total · Long = 15 min total"],
    ["📄", "Keep your resume current for better questions"],
    ["🎯", "Review Analytics after each session to spot weak areas"],
  ];

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
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: "5%",
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)",
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
        <div ref={headerRef} style={{ marginBottom: 48 }}>
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
              background: "rgba(124,58,237,0.1)",
              color: "#7c3aed",
              border: "1px solid rgba(124,58,237,0.2)",
              marginBottom: 18,
            }}
          >
            <Zap size={11} fill="currentColor" /> AI INTERVIEW ENGINE
          </span>
          <h1
            style={{
              color: textMain,
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 14,
            }}
          >
            Choose your{" "}
            <span
              style={{
                background: "linear-gradient(130deg,#7c3aed,#818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              interview mode
            </span>
          </h1>
          <p style={{ color: textSub, fontSize: 16, maxWidth: 500 }}>
            Every question is built from your resume — no generic fluff.
            {user?.name ? ` Let's go, ${user.name.split(" ")[0]}.` : ""}
          </p>
        </div>

        {/* Resume warning */}
        {hasResume === false && (
          <div
            style={{
              marginBottom: 32,
              padding: "16px 22px",
              borderRadius: 16,
              background: isDark
                ? "rgba(245,158,11,0.07)"
                : "rgba(254,252,232,0.8)",
              border: "1.5px solid rgba(245,158,11,0.28)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "rgba(245,158,11,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Upload size={17} color="#f59e0b" />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p
                style={{
                  color: "#f59e0b",
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 2,
                }}
              >
                No resume found
              </p>
              <p
                style={{ color: isDark ? "#9a7a3a" : "#92703a", fontSize: 12 }}
              >
                Upload your resume first to unlock AI-personalised interviews.
              </p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              style={{
                padding: "9px 18px",
                borderRadius: 10,
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "#f59e0b",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              Upload now →
            </button>
          </div>
        )}

        {/* Main grid — stacks on mobile */}
        <div
          className="iv-main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Mode cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {modes.map(
              ({
                id,
                icon,
                accent,
                title,
                sub,
                desc,
                tags,
                badge,
                badgeColor,
              }) => {
                const Icon = icon;
                return (
                <div
                  key={id}
                  className="iv-card"
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 22,
                    padding: "28px 30px",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition:
                      "transform 0.25s, box-shadow 0.25s, border-color 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = `0 20px 50px ${accent}20`;
                    e.currentTarget.style.borderColor = `${accent}55`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.borderColor = cardBorder;
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg,${accent},${accent}66,transparent)`,
                      borderRadius: "22px 22px 0 0",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 17,
                          background: `${accent}15`,
                          border: `1.5px solid ${accent}30`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={26} color={accent} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            color: isDark ? "#6060a0" : "#a78bfa",
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: 4,
                          }}
                        >
                          {sub}
                        </p>
                        <h3
                          style={{
                            color: textMain,
                            fontSize: "clamp(17px,3vw,21px)",
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {title}
                        </h3>
                      </div>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "5px 12px",
                        borderRadius: 99,
                        fontSize: 10,
                        fontWeight: 700,
                        background: `${badgeColor}15`,
                        color: badgeColor,
                        border: `1px solid ${badgeColor}30`,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {badge}
                    </span>
                  </div>

                  <p
                    style={{
                      color: textSub,
                      fontSize: 14,
                      lineHeight: 1.7,
                      margin: "18px 0 20px",
                    }}
                  >
                    {desc}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            padding: "4px 13px",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 600,
                            background: isDark ? "#1a1a30" : "#f5f3ff",
                            color: isDark ? "#7070b0" : "#6d28d9",
                            border: `1px solid ${isDark ? "#2a2a50" : "#ddd6fe"}`,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleStart(id)}
                      disabled={!!starting || hasResume === false}
                      style={{
                        padding: "11px 24px",
                        borderRadius: 13,
                        background:
                          starting === id
                            ? `${accent}88`
                            : `linear-gradient(135deg,${accent},${accent}cc)`,
                        color: "white",
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: 700,
                        border: "none",
                        cursor:
                          starting || hasResume === false
                            ? "not-allowed"
                            : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        boxShadow: `0 6px 18px ${accent}30`,
                        opacity: hasResume === false ? 0.55 : 1,
                        transition: "opacity 0.2s, transform 0.15s",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => {
                        if (!starting && hasResume !== false)
                          e.currentTarget.style.transform = "scale(1.03)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {starting === id ? (
                        "Starting…"
                      ) : hasResume === false ? (
                        <>
                          <Lock size={13} /> Resume needed
                        </>
                      ) : (
                        <>
                          Start session <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
                );
              }
            )}
          </div>

          {/* Sidebar */}
          <div
            className="iv-sidebar"
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div
              className="iv-side"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 20,
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 20,
                }}
              >
                <Sparkles size={15} color="#7c3aed" />
                <span
                  style={{ color: textMain, fontSize: 14, fontWeight: 700 }}
                >
                  Pro Tips
                </span>
              </div>
              {tips.map(([icon, text]) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    gap: 11,
                    marginBottom: 14,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>
                    {icon}
                  </span>
                  <p style={{ color: textSub, fontSize: 12, lineHeight: 1.65 }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="iv-side"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 20,
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 20,
                }}
              >
                <BarChart2 size={15} color="#6366f1" />
                <span
                  style={{ color: textMain, fontSize: 14, fontWeight: 700 }}
                >
                  Your Progress
                </span>
              </div>
              {(() => {
                const items = [
                  [
                    "Sessions",
                    progress && progress.totalInterviews !== undefined
                      ? progress.totalInterviews
                      : "–",
                    "#7c3aed",
                  ],
                  [
                    "Avg Score",
                    progress && progress.overallAvgScore !== undefined
                      ? `${progress.overallAvgScore}/50`
                      : "–/50",
                    "#6366f1",
                  ],
                  [
                    "Best Mode",
                    progress?.insights?.strongArea ?? "–",
                    "#10b981",
                  ],
                  [
                    "Needs Work",
                    progress?.insights?.weakArea ?? "–",
                    "#f59e0b",
                  ],
                ];

                return items.map(([label, val, color]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 0",
                      borderBottom: `1px solid ${isDark ? "#141424" : "#f3f0ff"}`,
                    }}
                  >
                    <span style={{ color: textSub, fontSize: 12 }}>{label}</span>
                    <span style={{ color, fontSize: 13, fontWeight: 700 }}>
                      {val}
                    </span>
                  </div>
                ));
              })()}
              <button
                onClick={() => navigate("/analytics")}
                style={{
                  marginTop: 18,
                  width: "100%",
                  padding: "11px",
                  borderRadius: 12,
                  background: "transparent",
                  border: `1.5px solid ${isDark ? "#252545" : "#ddd6fe"}`,
                  color: isDark ? "#a78bfa" : "#7c3aed",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#1a1a30"
                    : "#f5f3ff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Full Analytics <ChevronRight size={13} />
              </button>
            </div>

            <div
              className="iv-side"
              style={{
                background: "linear-gradient(135deg,#6d28d9,#4f46e5)",
                borderRadius: 20,
                padding: "24px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.07)",
                }}
              />
              <FileText
                size={22}
                color="rgba(255,255,255,0.8)"
                style={{ marginBottom: 12 }}
              />
              <p
                style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                Book a real developer
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                Practice with a senior engineer and get real feedback.
              </p>
              <button
                onClick={() => navigate("/developers")}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "white",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.26)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.18)")
                }
              >
                Browse developers →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .iv-main-grid { grid-template-columns: 1fr !important; }
          .iv-sidebar { flex-direction: row !important; flex-wrap: wrap; }
          .iv-sidebar > div { flex: 1 1 280px; }
        }
        @media (max-width: 520px) {
          .iv-card { padding: 20px 18px !important; }
          .iv-sidebar > div { flex: 1 1 100%; }
        }
      `}</style>
    </div>
  );
};

export default Interview;
