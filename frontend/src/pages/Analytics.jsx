import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BarChart2,
  TrendingUp,
  Target,
  Brain,
  Award,
  Zap,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

gsap.registerPlugin(ScrollTrigger);

// Top-level component to render live interview history (ongoing + completed).
function LiveHistoryBlockComp({ liveHistory = [], isDark, cardBg, cardBorder, textMain, textSub, navigate }) {
  const ongoing = liveHistory.filter((i) => i.status !== "completed");
  const completed = liveHistory.filter((i) => i.status === "completed");

  const handleResume = (item) => {
    const id = item._id || item.interviewId || item.id;
    if (!id) {
      alert("Cannot resume: missing interview id");
      return;
    }
    const key = `aiTest:${id}`;
    const raw = sessionStorage.getItem(key);
    if (raw) {
      navigate(`/interview/live/${id}`);
      return;
    }
    if (confirm("No local session data found. If you continue you may not be able to resume the conversation. Open live interview page anyway?")) {
      navigate(`/interview/live/${id}`);
    }
  };

  return (
    <div className="stat-block" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "22px", marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ color: textMain, fontSize: 16, fontWeight: 800 }}>Live Interview History</h3>
        <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: isDark ? "#1a1a30" : "#f3f0ff", color: textSub }}>{liveHistory.length} sessions</span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <h4 style={{ color: textSub, fontSize: 13, marginBottom: 8 }}>Ongoing</h4>
        {ongoing.length === 0 ? (
          <p style={{ color: textSub }}>No ongoing live interviews</p>
        ) : (
          ongoing.slice(0, 8).map((item, i) => (
            <div key={item._id ?? i} onClick={() => handleResume(item)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleResume(item)}
              style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 12, padding: '12px 14px', borderBottom: `1px solid ${isDark ? '#0f0f1a' : '#f8f6ff'}`, cursor: 'pointer' }}>
              <span style={{ color: textMain, fontSize: 13, fontWeight: 600 }}>{item.role ?? `Session ${i+1}`}</span>
              <span style={{ color: textSub, fontSize: 12, textTransform: 'capitalize' }}>{item.role}</span>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>{item.status}</span>
            </div>
          ))
        )}
      </div>

      <div>
        <h4 style={{ color: textSub, fontSize: 13, marginBottom: 8 }}>Completed</h4>
        {completed.length === 0 ? (
          <p style={{ color: textSub }}>No completed live interviews</p>
        ) : (
          completed.slice(0, 8).map((item, i) => (
            <div key={item._id ?? i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 12, padding: '12px 14px', borderBottom: `1px solid ${isDark ? '#0f0f1a' : '#f8f6ff'}` }}>
              <span style={{ color: textMain, fontSize: 13, fontWeight: 600 }}>{item.role ?? `Session ${i+1}`}</span>
              <span style={{ color: textSub, fontSize: 12, textTransform: 'capitalize' }}>{item.role}</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>{item.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const Analytics = ({ theme }) => {
  const { user: _user } = useAuth();
  const isDark = theme === "dark";
  const headerRef = useRef(null);
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [liveHistory, setLiveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  

  const pageBg = isDark ? "#07070f" : "#f5f3ff";
  const textMain = isDark ? "#f0eeff" : "#1e1b4b";
  const textSub = isDark ? "#6060a0" : "#7b7aa0";
  const cardBg = isDark ? "#0f0f1a" : "#ffffff";
  const cardBorder = isDark ? "#1e1e35" : "#ede9fe";

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
    );

    Promise.all([api.get("/aiTest/analytics"), api.get("/aiTest/history"), api.get("/live_interview/history")])
      .then(([aRes, hRes, lRes]) => {
        setData(aRes.data);
        setHistory(hRes.data?.data || []);
        setLiveHistory(lRes.data?.data || []);
        setLoading(false);
        gsap.fromTo(
          ".stat-block",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power3.out",
            delay: 0.1,
          },
        );
        gsap.fromTo(
          ".history-row",
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.06,
            ease: "power3.out",
            delay: 0.3,
          },
        );
      })
      .catch(() => setLoading(false));
  }, []);

  const StatCard = ({ icon: Icon, label, value, sub, accent, big }) => (
    <div
      className="stat-block"
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 20,
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg,${accent},${accent}44,transparent)`,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: `${accent}18`,
            border: `1px solid ${accent}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color={accent} />
        </div>
      </div>
      <p
        style={{
          color: textSub,
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: textMain,
          fontSize: big ? 36 : 28,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          marginBottom: 4,
        }}
      >
        {value}
      </p>
      {sub && <p style={{ color: textSub, fontSize: 12 }}>{sub}</p>}
    </div>
  );

  const BarViz = ({ label, value, max, color }) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 7,
          }}
        >
          <span style={{ color: textSub, fontSize: 13 }}>{label}</span>
          <span style={{ color, fontSize: 13, fontWeight: 700 }}>{value}</span>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 99,
            background: isDark ? "#1a1a30" : "#ede9fe",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: `linear-gradient(90deg,${color},${color}88)`,
              borderRadius: 99,
              transition: "width 1s ease",
            }}
          />
        </div>
      </div>
    );
  };

  const ScoreRing = ({ score, max = 10, color, size = 100 }) => {
    const pct = max > 0 ? (score / max) * 100 : 0;
    const r = (size - 12) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={isDark ? "#1a1a30" : "#ede9fe"}
          strokeWidth={10}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1.2s ease" }}
        />
        <text
          x={size / 2}
          y={size / 2 + 6}
          textAnchor="middle"
          fill={textMain}
          fontSize={size * 0.2}
          fontWeight={800}
          fontFamily="'Poppins',sans-serif"
          style={{
            transform: "rotate(90deg)",
            transformOrigin: `${size / 2}px ${size / 2}px`,
          }}
        >
          {score}
        </text>
      </svg>
    );
  };

  const scoreLabel = (s) => {
    if (s >= 8) return ["Excellent", "#10b981"];
    if (s >= 6) return ["Good", "#6366f1"];
    if (s >= 4) return ["Average", "#f59e0b"];
    return ["Needs Work", "#ef4444"];
  };

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
            top: "5%",
            right: "5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "5%",
            width: 400,
            height: 400,
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
        <div
          ref={headerRef}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 44,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
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
                background: "rgba(99,102,241,0.1)",
                color: "#6366f1",
                border: "1px solid rgba(99,102,241,0.2)",
                marginBottom: 16,
              }}
            >
              <BarChart2 size={11} /> PERFORMANCE ANALYTICS
            </span>
            <h1
              style={{
                color: textMain,
                fontSize: 42,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: 10,
              }}
            >
              Your{" "}
              <span
                style={{
                  background: "linear-gradient(130deg,#6366f1,#a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                progress
              </span>
            </h1>
            <p style={{ color: textSub, fontSize: 15 }}>
              Track your growth, spot weak areas, and crush your next interview.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 18px",
              borderRadius: 12,
              background: "transparent",
              border: `1.5px solid ${cardBorder}`,
              color: textSub,
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#6366f1";
              e.currentTarget.style.color = "#6366f1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = cardBorder;
              e.currentTarget.style.color = textSub;
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid #7c3aed",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ color: textSub, fontSize: 14 }}>Loading analytics…</p>
          </div>
        ) : !data || data.totalInterviews === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                background: isDark ? "#1a1a30" : "#f3f0ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <BarChart2 size={36} color="#7c3aed" />
            </div>
            <h3
              style={{
                color: textMain,
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              No data yet
            </h3>
            <p style={{ color: textSub, fontSize: 14, marginBottom: 28 }}>
              Complete your first interview to see analytics here.
            </p>
            <a
              href="/interview"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 28px",
                borderRadius: 14,
                background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                color: "white",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 700,
                boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
              }}
            >
              Start first interview <ChevronRight size={15} />
            </a>
          </div>
        ) : (
          <>
            {/* Top stat cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 28,
              }}
            >
              <StatCard
                icon={Zap}
                label="Total Sessions"
                value={data.totalInterviews}
                sub="All completed"
                accent="#7c3aed"
                big
              />
              <StatCard
                icon={TrendingUp}
                label="Overall Avg Score"
                value={`${data.overallAvgScore}/50`}
                sub={scoreLabel(data.overallAvgScore)[0]}
                accent="#6366f1"
                big
              />
              <StatCard
                icon={Target}
                label="MCQ Accuracy"
                value={`${data.mcq?.accuracy ?? 0}%`}
                sub={`${data.mcq?.correct ?? 0} correct of ${data.mcq?.attempted ?? 0}`}
                accent="#10b981"
                big
              />
              <StatCard
                icon={Brain}
                label="Long Answer Avg"
                value={`${data.long?.averageScore ?? 0}/10`}
                sub={`Best: ${data.long?.bestScore ?? 0}`}
                accent="#f59e0b"
                big
              />
            </div>

            {/* Mid row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                marginBottom: 28,
              }}
            >
              {/* MCQ breakdown */}
              <div
                className="stat-block"
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 20,
                  padding: "28px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <h3
                    style={{ color: textMain, fontSize: 16, fontWeight: 800 }}
                  >
                    MCQ Breakdown
                  </h3>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      background: "rgba(124,58,237,0.1)",
                      color: "#7c3aed",
                    }}
                  >
                    {data.mcq?.totalQuestions ?? 0} total
                  </span>
                </div>
                <BarViz
                  label="Correct"
                  value={data.mcq?.correct ?? 0}
                  max={data.mcq?.totalQuestions || 1}
                  color="#10b981"
                />
                <BarViz
                  label="Wrong"
                  value={data.mcq?.wrong ?? 0}
                  max={data.mcq?.totalQuestions || 1}
                  color="#ef4444"
                />
                <BarViz
                  label="Attempted"
                  value={data.mcq?.attempted ?? 0}
                  max={data.mcq?.totalQuestions || 1}
                  color="#6366f1"
                />

                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  {[
                    ["Correct", data.mcq?.correct ?? 0, "#10b981"],
                    ["Wrong", data.mcq?.wrong ?? 0, "#ef4444"],
                    ["Accuracy", `${data.mcq?.accuracy ?? 0}%`, "#7c3aed"],
                  ].map(([l, v, c]) => (
                    <div
                      key={l}
                      style={{
                        flex: 1,
                        background: isDark ? "#141424" : "#f9f8ff",
                        borderRadius: 12,
                        padding: "12px",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ color: c, fontSize: 18, fontWeight: 900 }}>
                        {v}
                      </p>
                      <p style={{ color: textSub, fontSize: 11, marginTop: 2 }}>
                        {l}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score rings */}
              <div
                className="stat-block"
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 20,
                  padding: "28px",
                }}
              >
                <h3
                  style={{
                    color: textMain,
                    fontSize: 16,
                    fontWeight: 800,
                    marginBottom: 24,
                  }}
                >
                  Score Breakdown
                </h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <ScoreRing
                      score={data.mcq?.averageScore ?? 0}
                      color="#7c3aed"
                      size={96}
                    />
                    <p
                      style={{
                        color: textSub,
                        fontSize: 12,
                        marginTop: 8,
                        fontWeight: 600,
                      }}
                    >
                      MCQ Avg
                    </p>
                    <p
                      style={{
                        color:
                          scoreLabel(data.mcq?.averageScore ?? 0)[0] ===
                          "Excellent"
                            ? "#10b981"
                            : scoreLabel(data.mcq?.averageScore ?? 0)[1],
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {scoreLabel(data.mcq?.averageScore ?? 0)[0]}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 1,
                      height: 80,
                      background: isDark ? "#1a1a30" : "#ede9fe",
                    }}
                  />
                  <div style={{ textAlign: "center" }}>
                    <ScoreRing
                      score={data.long?.averageScore ?? 0}
                      color="#6366f1"
                      size={96}
                    />
                    <p
                      style={{
                        color: textSub,
                        fontSize: 12,
                        marginTop: 8,
                        fontWeight: 600,
                      }}
                    >
                      Long Avg
                    </p>
                    <p
                      style={{
                        color: scoreLabel(data.long?.averageScore ?? 0)[1],
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {scoreLabel(data.long?.averageScore ?? 0)[0]}
                    </p>
                  </div>
                </div>

                {/* Insight */}
                <div
                  style={{
                    background: isDark ? "#141424" : "#f9f8ff",
                    borderRadius: 14,
                    padding: "16px 18px",
                  }}
                >
                  <div style={{ display: "flex", gap: 14 }}>
                    <div>
                      <p
                        style={{
                          color: textSub,
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: 4,
                        }}
                      >
                        Insight
                      </p>
                      <p
                        style={{
                          color: textMain,
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        <span style={{ color: "#10b981", fontWeight: 700 }}>
                          Strong:{" "}
                        </span>
                        {data.insights?.strongArea ?? "—"} ·{" "}
                        <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                          Work on:{" "}
                        </span>
                        {data.insights?.weakArea ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* History table */}
            <div
              className="stat-block"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 20,
                padding: "28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <h3 style={{ color: textMain, fontSize: 16, fontWeight: 800 }}>
                  Interview History
                </h3>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 700,
                    background: isDark ? "#1a1a30" : "#f3f0ff",
                    color: textSub,
                  }}
                >
                  {history.length} sessions
                </span>
              </div>

              {history.length === 0 ? (
                <p
                  style={{
                    color: textSub,
                    fontSize: 13,
                    textAlign: "center",
                    padding: "24px 0",
                  }}
                >
                  No history yet
                </p>
              ) : (
                <div>
                  {/* Table header */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 100px 100px 100px 120px",
                      gap: 12,
                      padding: "10px 16px",
                      borderBottom: `1px solid ${isDark ? "#1a1a30" : "#ede9fe"}`,
                      marginBottom: 4,
                    }}
                  >
                    {["Interview", "Type", "Role", "Score", "Date"].map((h) => (
                      <span
                        key={h}
                        style={{
                          color: textSub,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  {history.slice(0, 8).map((item, i) => {
                    const [, color] = scoreLabel(
                      (item.totalScore / (item.type === "mcq" ? 50 : 30)) * 10,
                    );
                    return (
                      <div
                        key={item._id ?? i}
                        className="history-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 100px 100px 100px 120px",
                          gap: 12,
                          padding: "14px 16px",
                          borderBottom: `1px solid ${isDark ? "#0f0f1a" : "#f8f6ff"}`,
                          transition: "background 0.15s",
                          borderRadius: 10,
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = isDark
                            ? "#141424"
                            : "#faf8ff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <span
                          style={{
                            color: textMain,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          Session #{i + 1}
                        </span>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            background:
                              item.type === "mcq"
                                ? "rgba(124,58,237,0.1)"
                                : "rgba(99,102,241,0.1)",
                            color: item.type === "mcq" ? "#7c3aed" : "#6366f1",
                            width: "fit-content",
                          }}
                        >
                          {item.type?.toUpperCase()}
                        </span>
                        <span
                          style={{
                            color: textSub,
                            fontSize: 12,
                            textTransform: "capitalize",
                          }}
                        >
                          {item.role}
                        </span>
                        <span style={{ color, fontSize: 13, fontWeight: 800 }}>
                          {item.totalScore}
                        </span>
                        <span style={{ color: textSub, fontSize: 12 }}>
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short" },
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Live Interview History (ongoing vs completed) */}
            <LiveHistoryBlockComp
              liveHistory={liveHistory}
              isDark={isDark}
              cardBg={cardBg}
              cardBorder={cardBorder}
              textMain={textMain}
              textSub={textSub}
              navigate={navigate}
            />
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Analytics;
