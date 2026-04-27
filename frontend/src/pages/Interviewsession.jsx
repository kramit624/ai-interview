import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  BarChart2,
  ArrowRight,
  Trophy,
  Brain,
  Target,
  AlertTriangle,
  RotateCcw,
  Home,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

// ─── Timer durations ───────────────────────────────────────────────────────
const TIMERS = { mcq: 5 * 60, long: 15 * 60 }; // seconds

// ─── Score colour helper ───────────────────────────────────────────────────
const scoreColor = (s) => {
  if (s >= 8) return "#10b981";
  if (s >= 6) return "#6366f1";
  if (s >= 4) return "#f59e0b";
  return "#ef4444";
};

const fmtTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

// ─── Avatar placeholder (left panel) ──────────────────────────────────────
const AvatarPanel = ({
  isDark,
  textSub,
  cardBg,
  cardBorder,
  questionIndex,
  total,
  type,
}) => (
  <div
    style={{
      width: 260,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}
  >
    {/* AI avatar box */}
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 20,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1/1",
          maxWidth: 180,
          borderRadius: 18,
          background: isDark
            ? "linear-gradient(135deg,#1a1a30,#0f0f1a)"
            : "linear-gradient(135deg,#f3f0ff,#ede9fe)",
          border: `2px dashed ${isDark ? "#2a2a50" : "#c4b5fd"}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* pulsing ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            boxShadow: "inset 0 0 40px rgba(124,58,237,0.08)",
          }}
        />
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#7c3aed22,#6366f122)",
            border: "2px solid rgba(124,58,237,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={28} color="#7c3aed" />
        </div>
        <p
          style={{
            color: isDark ? "#6060a0" : "#a78bfa",
            fontSize: 11,
            fontWeight: 600,
            textAlign: "center",
            letterSpacing: "0.05em",
          }}
        >
          AI INTERVIEWER
        </p>
      </div>

      <div style={{ textAlign: "center", width: "100%" }}>
        <p
          style={{
            color: isDark ? "#f0eeff" : "#1e1b4b",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          {type === "mcq" ? "MCQ Sprint" : "Deep Dive"}
        </p>
        <p style={{ color: textSub, fontSize: 12 }}>
          Question {questionIndex + 1} of {total}
        </p>
      </div>

      {/* Progress dots */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background:
                i < questionIndex
                  ? "#10b981"
                  : i === questionIndex
                    ? "#7c3aed"
                    : isDark
                      ? "#1e1e35"
                      : "#ddd6fe",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
    </div>

    {/* Hint card */}
    <div
      style={{
        background: isDark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)",
        border: "1px solid rgba(124,58,237,0.15)",
        borderRadius: 16,
        padding: "16px",
      }}
    >
      <p
        style={{
          color: "#7c3aed",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 6,
        }}
      >
        💡 Tip
      </p>
      <p style={{ color: textSub, fontSize: 12, lineHeight: 1.65 }}>
        {type === "mcq"
          ? "Read all options before selecting. Eliminate obviously wrong answers first."
          : "Structure your answer: what → why → how. Depth matters more than length."}
      </p>
    </div>
  </div>
);

// ─── Results screen ────────────────────────────────────────────────────────
const ResultsScreen = ({
  isDark,
  questions,
  type,
  totalScore,
  summary,
  onRetry,
  onHome,
}) => {
  const cardBg = isDark ? "#0f0f1a" : "#ffffff";
  const cardBorder = isDark ? "#1e1e35" : "#ede9fe";
  const textMain = isDark ? "#f0eeff" : "#1e1b4b";
  const textSub = isDark ? "#6060a0" : "#7b7aa0";
  const pageBg = isDark ? "#07070f" : "#f5f3ff";
  const headerRef = useRef(null);
  const cardsRef = useRef(null);

  const maxScore =
    type === "mcq" ? questions.length * 10 : questions.length * 10;
  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const grade =
    pct >= 80
      ? ["Excellent! 🏆", "#10b981"]
      : pct >= 60
        ? ["Good job! 👍", "#6366f1"]
        : pct >= 40
          ? ["Keep practising 💪", "#f59e0b"]
          : ["Needs work 📚", "#ef4444"];

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
    );
    gsap.fromTo(
      ".res-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.3,
      },
    );
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        fontFamily: "'Poppins',sans-serif",
        paddingTop: 80,
      }}
    >
      <div
        style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}
      >
        {/* Header */}
        <div ref={headerRef} style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: `${grade[1]}18`,
              border: `2px solid ${grade[1]}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Trophy size={36} color={grade[1]} />
          </div>
          <h1
            style={{
              color: textMain,
              fontSize: "clamp(24px,5vw,38px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          >
            {grade[0]}
          </h1>
          <p style={{ color: textSub, fontSize: 15 }}>
            You scored <strong style={{ color: grade[1] }}>{totalScore}</strong>{" "}
            out of <strong style={{ color: textMain }}>{maxScore}</strong>{" "}
            points
          </p>

          {/* Big score ring */}
          <div
            style={{
              margin: "28px auto 0",
              width: 130,
              height: 130,
              position: "relative",
            }}
          >
            <svg
              width={130}
              height={130}
              viewBox="0 0 130 130"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx={65}
                cy={65}
                r={54}
                fill="none"
                stroke={isDark ? "#1e1e35" : "#ede9fe"}
                strokeWidth={12}
              />
              <circle
                cx={65}
                cy={65}
                r={54}
                fill="none"
                stroke={grade[1]}
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 2 * Math.PI * 54} ${2 * Math.PI * 54}`}
                style={{ transition: "stroke-dasharray 1.5s ease" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: textMain, fontSize: 26, fontWeight: 900 }}>
                {pct}%
              </span>
              <span
                style={{
                  color: textSub,
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                Score
              </span>
            </div>
          </div>
        </div>

        {/* Summary box */}
        {summary && (
          <div
            className="res-card"
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 20,
              padding: "24px",
              marginBottom: 24,
            }}
          >
            <p
              style={{
                color: "#7c3aed",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 12,
              }}
            >
              AI Summary
            </p>
            <p style={{ color: textMain, fontSize: 14, lineHeight: 1.75 }}>
              {typeof summary === "string" ? (
                summary
              ) : (
                <>
                  {summary.strengths && (
                    <>
                      <strong style={{ color: "#10b981" }}>Strengths:</strong>{" "}
                      {summary.strengths}
                      <br />
                    </>
                  )}
                  {summary.weaknesses && (
                    <>
                      <strong style={{ color: "#f59e0b" }}>Weaknesses:</strong>{" "}
                      {summary.weaknesses}
                      <br />
                    </>
                  )}
                  {summary.overallFeedback && (
                    <>
                      <strong style={{ color: textMain }}>Overall:</strong>{" "}
                      {summary.overallFeedback}
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        {/* Per-question breakdown */}
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              color: textMain,
              fontSize: 17,
              fontWeight: 800,
              marginBottom: 18,
            }}
          >
            Question Breakdown
          </h2>
          {questions.map((q, i) => (
            <div
              key={i}
              className="res-card"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 18,
                padding: "22px",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      color: textSub,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 6,
                    }}
                  >
                    Question {i + 1}
                  </p>
                  <p
                    style={{
                      color: textMain,
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: 1.6,
                    }}
                  >
                    {q.question}
                  </p>
                </div>
                <div style={{ flexShrink: 0, textAlign: "center" }}>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: scoreColor(q.score ?? 0),
                    }}
                  >
                    {q.score ?? 0}
                  </span>
                  <span style={{ color: textSub, fontSize: 11 }}>/10</span>
                </div>
              </div>

              {/* User answer */}
              <div
                style={{
                  background: isDark ? "#141424" : "#f9f8ff",
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 10,
                }}
              >
                <p
                  style={{
                    color: textSub,
                    fontSize: 11,
                    fontWeight: 600,
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Your Answer
                </p>
                <p style={{ color: textMain, fontSize: 13, lineHeight: 1.65 }}>
                  {q.userAnswer || "—"}
                </p>
              </div>

              {/* Correct answer for MCQ */}
              {q.correctAnswer && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  {q.userAnswer === q.correctAnswer ? (
                    <CheckCircle2 size={15} color="#10b981" />
                  ) : (
                    <XCircle size={15} color="#ef4444" />
                  )}
                  <span
                    style={{
                      color:
                        q.userAnswer === q.correctAnswer
                          ? "#10b981"
                          : "#f87171",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {q.userAnswer === q.correctAnswer
                      ? "Correct"
                      : `Correct: ${q.correctAnswer}`}
                  </span>
                </div>
              )}

              {/* AI feedback */}
              {q.aiFeedback && (
                <div
                  style={{
                    borderTop: `1px solid ${isDark ? "#1e1e35" : "#f0edff"}`,
                    paddingTop: 10,
                  }}
                >
                  <p
                    style={{
                      color: textSub,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    AI Feedback
                  </p>
                  <p
                    style={{
                      color: isDark ? "#9090c0" : "#6060a0",
                      fontSize: 13,
                      lineHeight: 1.65,
                    }}
                  >
                    {q.aiFeedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onRetry}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 28px",
              borderRadius: 14,
              background: "linear-gradient(135deg,#7c3aed,#6366f1)",
              color: "white",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <RotateCcw size={15} /> Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/analytics")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 28px",
              borderRadius: 14,
              background: "transparent",
              color: isDark ? "#a78bfa" : "#7c3aed",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              border: `2px solid ${isDark ? "#252545" : "#ddd6fe"}`,
              cursor: "pointer",
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
            <BarChart2 size={15} /> View Analytics
          </button>
          <button
            onClick={onHome}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 28px",
              borderRadius: 14,
              background: "transparent",
              color: textSub,
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              border: `2px solid ${isDark ? "#1e1e35" : "#ede9fe"}`,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = isDark
                ? "#0f0f1a"
                : "#f9f8ff")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Home size={15} /> Home
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Session Component ────────────────────────────────────────────────
const InterviewSession = ({ theme }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "mcq";
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDark = theme === "dark";

  // ── state ────────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedOpt, setSelectedOpt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // per-answer feedback
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [summary, setSummary] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]); // full history with answers
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TIMERS[type] ?? TIMERS.mcq);
  const [timerActive, setTimerActive] = useState(false);
  const [timesUp, setTimesUp] = useState(false);
  const timerRef = useRef(null);

  // ── theme tokens ─────────────────────────────────────────────────────────
  const pageBg = isDark ? "#07070f" : "#f5f3ff";
  const textMain = isDark ? "#f0eeff" : "#1e1b4b";
  const textSub = isDark ? "#6060a0" : "#7b7aa0";
  const cardBg = isDark ? "#0f0f1a" : "#ffffff";
  const cardBorder = isDark ? "#1e1e35" : "#ede9fe";

  // ── refs for animation ───────────────────────────────────────────────────
  const questionRef = useRef(null);
  const answerRef = useRef(null);

  // ── load questions on mount ──────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      // Prefer client-side start payload saved by Interview.jsx
      try {
        const raw = sessionStorage.getItem(`aiTest:${id}`);
        const payload = raw ? JSON.parse(raw) : null;
        const testFromSession = payload?.aiTest || payload;
        if (testFromSession?.questions) {
          const test = testFromSession;
          setQuestions(test.questions);
          setCurrentIdx(test.currentQuestionIndex ?? 0);
          setAllQuestions(test.questions);
          if (test.status === "completed") {
            setCompleted(true);
            setTotalScore(test.totalScore ?? 0);
            setSummary(test.summary ?? null);
          }
          setLoading(false);
          setTimerActive(true);
          return;
        }
      } catch {
        // ignore parse errors and fall back to server
      }

      // No client-side payload — try server (some backends may provide GET /aiTest/:id)
      try {
        const res = await api.get(`/aiTest/${id}`);
        const test = res.data?.data?.aiTest || res.data;
        if (test?.questions) {
          setQuestions(test.questions);
          setCurrentIdx(test.currentQuestionIndex ?? 0);
          setAllQuestions(test.questions);
          if (test.status === "completed") {
            setCompleted(true);
            setTotalScore(test.totalScore ?? 0);
            setSummary(test.summary ?? null);
          }
        }
      } catch {
        // server GET not available or failed; user must start from Interview page
      } finally {
        setLoading(false);
        setTimerActive(true);
      }
    };
    init();
  }, [id]);

  // ── countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerActive || completed) return;
    if (timeLeft <= 0) {
      setTimesUp(true);
      handleTimeUp();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, timerActive, completed]);

  const handleTimeUp = useCallback(async () => {
    setTimerActive(false);
    // Auto-submit whatever was typed / selected for current question
    await submitAnswer(true);
  }, [currentIdx, answer, selectedOpt]);

  // ── animate question in ───────────────────────────────────────────────────
  const animateQuestion = () => {
    if (questionRef.current) {
      gsap.fromTo(
        questionRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" },
      );
    }
    setAnswer("");
    setSelectedOpt("");
    setFeedback(null);
    setShowFeedback(false);
  };

  useEffect(() => {
    if (!loading && questions.length > 0) animateQuestion();
  }, [currentIdx, loading]);

  // ── submit answer ─────────────────────────────────────────────────────────
  const submitAnswer = async (forced = false) => {
    const ans = type === "mcq" ? selectedOpt : answer;
    if (!forced && !ans.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/aiTest/${id}/answer`, {
        answer: ans || "No answer",
      });
      const data = res.data;

      // Update the local question record
      const updated = [...allQuestions];
      if (updated[currentIdx]) {
        updated[currentIdx] = {
          ...updated[currentIdx],
          userAnswer: ans,
          aiFeedback: data.feedback,
          score: data.score,
        };
      }
      setAllQuestions(updated);

      if (data.completed) {
        clearTimeout(timerRef.current);
        setTimerActive(false);
        setCompleted(true);
        setTotalScore(data.totalScore ?? 0);
        setSummary(data.summary ?? null);
      } else {
        // Show per-answer feedback briefly for long type
        if (type === "long" && data.feedback) {
          setFeedback({ score: data.score, text: data.feedback });
          setShowFeedback(true);
          // auto advance after 3s
          setTimeout(() => {
            setShowFeedback(false);
            setCurrentIdx((i) => i + 1);
          }, 3000);
        } else {
          setCurrentIdx((i) => i + 1);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── timer colour ──────────────────────────────────────────────────────────
  const timerColor =
    timeLeft <= 60 ? "#ef4444" : timeLeft <= 120 ? "#f59e0b" : "#10b981";
  const timerPct = (timeLeft / TIMERS[type]) * 100;

  const currentQ = questions[currentIdx];

  // ── loading state ─────────────────────────────────────────────────────────
  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          fontFamily: "'Poppins',sans-serif",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "3px solid #7c3aed",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: textSub, fontSize: 14 }}>Loading your session…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  // ── error / no questions ──────────────────────────────────────────────────
  if (!loading && questions.length === 0 && !completed)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          fontFamily: "'Poppins',sans-serif",
          padding: 24,
        }}
      >
        <AlertTriangle size={40} color="#f59e0b" />
        <p
          style={{
            color: textMain,
            fontSize: 16,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Couldn't load session
        </p>
        <p style={{ color: textSub, fontSize: 13, textAlign: "center" }}>
          Make sure your backend returns the test data on GET /aiTest/:id
        </p>
        <button
          onClick={() => navigate("/interview")}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            background: "linear-gradient(135deg,#7c3aed,#6366f1)",
            color: "white",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}
        >
          Back to Interview
        </button>
      </div>
    );

  // ── results screen ────────────────────────────────────────────────────────
  if (completed)
    return (
      <ResultsScreen
        isDark={isDark}
        questions={allQuestions}
        type={type}
        totalScore={totalScore}
        summary={summary}
        onRetry={() => navigate("/interview")}
        onHome={() => navigate("/")}
      />
    );

  // ── session UI ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        fontFamily: "'Poppins',sans-serif",
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
            left: "20%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 65%)",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── Top bar: session info + timer ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background:
                  type === "mcq"
                    ? "rgba(124,58,237,0.15)"
                    : "rgba(99,102,241,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {type === "mcq" ? (
                <Target size={18} color="#7c3aed" />
              ) : (
                <Brain size={18} color="#6366f1" />
              )}
            </div>
            <div>
              <p style={{ color: textMain, fontSize: 15, fontWeight: 800 }}>
                {type === "mcq" ? "MCQ Sprint" : "Deep Dive"}
              </p>
              <p style={{ color: textSub, fontSize: 12 }}>
                Question {currentIdx + 1} of {questions.length}
              </p>
            </div>
          </div>

          {/* Timer */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Timer bar */}
            <div
              style={{
                width: 120,
                height: 6,
                borderRadius: 99,
                background: isDark ? "#1e1e35" : "#ede9fe",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${timerPct}%`,
                  background: timerColor,
                  borderRadius: 99,
                  transition: "width 1s linear, background 0.3s",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 16px",
                borderRadius: 12,
                background:
                  timeLeft <= 60
                    ? "rgba(239,68,68,0.1)"
                    : isDark
                      ? "#0f0f1a"
                      : "#ffffff",
                border: `1.5px solid ${timeLeft <= 60 ? "rgba(239,68,68,0.3)" : isDark ? "#1e1e35" : "#ede9fe"}`,
                transition: "all 0.3s",
              }}
            >
              <Clock size={14} color={timerColor} />
              <span
                style={{
                  color: timerColor,
                  fontSize: 15,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                }}
              >
                {fmtTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Main layout: avatar left + question right ── */}
        <div
          className="session-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Avatar panel */}
          <AvatarPanel
            isDark={isDark}
            textSub={textSub}
            cardBg={cardBg}
            cardBorder={cardBorder}
            questionIndex={currentIdx}
            total={questions.length}
            type={type}
          />

          {/* Question panel */}
          <div
            ref={questionRef}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            {/* Question card */}
            <div
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 22,
                padding: "32px",
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
                  background: `linear-gradient(90deg,${type === "mcq" ? "#7c3aed" : "#6366f1"},transparent)`,
                  borderRadius: "22px 22px 0 0",
                }}
              />

              <p
                style={{
                  color: type === "mcq" ? "#7c3aed" : "#6366f1",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 16,
                }}
              >
                {type === "mcq" ? "Multiple Choice" : "Long Answer"} · Q
                {currentIdx + 1}
              </p>

              <p
                style={{
                  color: textMain,
                  fontSize: "clamp(15px,2.5vw,18px)",
                  fontWeight: 700,
                  lineHeight: 1.65,
                  marginBottom: type === "mcq" ? 28 : 0,
                }}
              >
                {currentQ?.question || "Loading question…"}
              </p>

              {/* MCQ options */}
              {type === "mcq" && currentQ?.options?.length > 0 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {currentQ.options.map((opt, i) => {
                    const letters = ["A", "B", "C", "D"];
                    const isSelected = selectedOpt === opt;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedOpt(opt)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "14px 18px",
                          borderRadius: 14,
                          cursor: "pointer",
                          border: `2px solid ${isSelected ? "#7c3aed" : isDark ? "#1e1e35" : "#ede9fe"}`,
                          background: isSelected
                            ? "rgba(124,58,237,0.08)"
                            : isDark
                              ? "#0a0a14"
                              : "#faf9ff",
                          fontFamily: "inherit",
                          textAlign: "left",
                          transition: "all 0.18s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor =
                              "rgba(124,58,237,0.4)";
                            e.currentTarget.style.background = isDark
                              ? "#141428"
                              : "#f5f3ff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = isDark
                              ? "#1e1e35"
                              : "#ede9fe";
                            e.currentTarget.style.background = isDark
                              ? "#0a0a14"
                              : "#faf9ff";
                          }
                        }}
                      >
                        <span
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 9,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isSelected
                              ? "#7c3aed"
                              : isDark
                                ? "#1e1e35"
                                : "#ede9fe",
                            color: isSelected ? "white" : textSub,
                            fontSize: 12,
                            fontWeight: 800,
                            transition: "all 0.18s",
                          }}
                        >
                          {letters[i]}
                        </span>
                        <span
                          style={{
                            color: isSelected
                              ? isDark
                                ? "#f0eeff"
                                : "#1e1b4b"
                              : textMain,
                            fontSize: 14,
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {opt}
                        </span>
                        {isSelected && (
                          <CheckCircle2
                            size={16}
                            color="#7c3aed"
                            style={{ marginLeft: "auto", flexShrink: 0 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Long answer textarea */}
            {type === "long" && (
              <div
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 22,
                  padding: "24px",
                }}
              >
                <p
                  style={{
                    color: textSub,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 12,
                  }}
                >
                  Your Answer
                </p>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your detailed answer here. Think out loud — structure: what → why → how…"
                  rows={7}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: 14,
                    boxSizing: "border-box",
                    border: `2px solid ${answer.length > 0 ? "#6366f1" : isDark ? "#1e1e35" : "#ede9fe"}`,
                    background: isDark ? "#0a0a14" : "#faf9ff",
                    color: textMain,
                    fontFamily: "inherit",
                    fontSize: 14,
                    lineHeight: 1.7,
                    outline: "none",
                    resize: "vertical",
                    minHeight: 160,
                    transition: "border-color 0.2s",
                    boxShadow:
                      answer.length > 0
                        ? "0 0 0 4px rgba(99,102,241,0.08)"
                        : "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) =>
                    (e.target.style.borderColor =
                      answer.length > 0
                        ? "#6366f1"
                        : isDark
                          ? "#1e1e35"
                          : "#ede9fe")
                  }
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <span style={{ color: textSub, fontSize: 11 }}>
                    Aim for 3–5 sentences with examples
                  </span>
                  <span
                    style={{
                      color: answer.length > 20 ? "#10b981" : textSub,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {answer.length} chars
                  </span>
                </div>
              </div>
            )}

            {/* Per-answer feedback banner (long type) */}
            {showFeedback && feedback && (
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 16,
                  background: isDark
                    ? "rgba(99,102,241,0.08)"
                    : "rgba(99,102,241,0.06)",
                  border: "1.5px solid rgba(99,102,241,0.25)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${scoreColor(feedback.score)}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Brain size={17} color={scoreColor(feedback.score)} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 4,
                    }}
                  >
                    <p
                      style={{ color: textMain, fontSize: 13, fontWeight: 700 }}
                    >
                      AI Feedback
                    </p>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: scoreColor(feedback.score),
                      }}
                    >
                      {feedback.score}/10
                    </span>
                  </div>
                  <p style={{ color: textSub, fontSize: 13, lineHeight: 1.65 }}>
                    {feedback.text}
                  </p>
                  <p
                    style={{
                      color: "#6366f1",
                      fontSize: 11,
                      fontWeight: 600,
                      marginTop: 6,
                    }}
                  >
                    Next question in 3 seconds…
                  </p>
                </div>
              </div>
            )}

            {/* Submit button */}
            {!showFeedback && (
              <button
                onClick={() => submitAnswer(false)}
                disabled={
                  submitting || (type === "mcq" ? !selectedOpt : !answer.trim())
                }
                style={{
                  padding: "15px 32px",
                  borderRadius: 16,
                  alignSelf: "flex-end",
                  background: submitting
                    ? "#5b21b6"
                    : "linear-gradient(135deg,#7c3aed,#6366f1)",
                  color: "white",
                  fontFamily: "inherit",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  cursor:
                    submitting ||
                    (type === "mcq" ? !selectedOpt : !answer.trim())
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
                  opacity:
                    (type === "mcq" ? !selectedOpt : !answer.trim()) &&
                    !submitting
                      ? 0.6
                      : 1,
                  transition: "transform 0.15s, opacity 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!submitting)
                    e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {submitting ? (
                  <>
                    <span className="spin-inline">◌</span> Submitting…
                  </>
                ) : currentIdx + 1 >= questions.length ? (
                  <>
                    Finish & See Results <Trophy size={15} />
                  </>
                ) : (
                  <>
                    Submit Answer <ArrowRight size={15} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin-inline { display: inline-block; animation: spin 0.8s linear infinite; }
        @media (max-width: 768px) {
          .session-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .session-grid > div:first-child { display: none; }
        }
      `}</style>
    </div>
  );
};

export default InterviewSession;
