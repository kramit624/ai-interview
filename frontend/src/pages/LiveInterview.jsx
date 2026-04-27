import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { User, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const LiveInterview = ({ theme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDark = theme === "dark";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ended, setEnded] = useState(false);
  const [summary, setSummary] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/live_interview/${id}`);

        const interview = res.data?.data;

        if (interview?.messages) {
          setMessages(interview.messages);
        }

        if (interview?.status === "completed") {
          setEnded(true);
          setSummary(interview.summary);
        }
      } catch (err) {
        console.error("Failed to load interview", err);
      }
    };

    fetchInterview();
  }, [id]);

  useEffect(() => {
    // auto-scroll on new messages
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending || ended) return;
    setSending(true);
    try {
      // optimistic user message
      setMessages((m) => [...m, { role: "user", content: trimmed }]);
      setInput("");

      const res = await api.post(`/live_interview/${id}/message`, { message: trimmed });
      const aiReply = res.data?.reply ?? res.data?.message ?? "";
      if (aiReply) {
        setMessages((m) => [...m, { role: "ai", content: aiReply }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleEnd = async () => {
    if (ended) return;
    try {
      const res = await api.post(`/live_interview/${id}/end`);
      const s = res.data?.summary ?? res.data?.message ?? null;
      setSummary(s);
      setEnded(true);
    } catch (err) {
      console.error(err);
    }
  };

  const pageBg = isDark ? "#07070f" : "#f5f3ff";
  const textMain = isDark ? "#f0eeff" : "#1e1b4b";
  const textSub = isDark ? "#6060a0" : "#7b7aa0";
  const cardBg = isDark ? "#0f0f1a" : "#ffffff";
  const cardBorder = isDark ? "#1e1e35" : "#ede9fe";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        paddingTop: 80,
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      {ended && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Interview Summary
              </h2>
              <button
                onClick={() => setEnded(false)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Link to="/">
                    Close
                </Link>
              </button>
            </div>

            {/* BODY */}
            <div className="p-5 overflow-y-auto space-y-4">
              {typeof summary === "object" && summary !== null ? (
                Object.entries(summary).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"
                  >
                    <p className="text-sm font-semibold text-violet-600 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>

                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {summary ?? "No summary available"}
                </p>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex-wrap">
              <p className="text-xs text-gray-500">
                Review insights and improve your next interview 🚀
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/analytics")}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm"
                >
                  View Analytics
                </button>

                
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <h1 style={{ color: textMain, fontSize: 28, fontWeight: 900 }}>
              Live Chat
            </h1>
            <p style={{ color: textSub, marginTop: 4 }}>
              One-to-one conversational interview with the AI.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => navigate("/interview")}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: `1px solid ${cardBorder}`,
                background: "transparent",
                color: textSub,
                cursor: "pointer",
              }}
            >
              Back <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}
        >
          <div style={{ width: 260 }}>
            <div
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 18,
                padding: 20,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 16,
                  margin: "0 auto 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDark ? "#0a0a14" : "#f9f8ff",
                }}
              >
                <User size={34} color="#7c3aed" />
              </div>
              <div style={{ color: textMain, fontWeight: 800 }}>
                {user?.name ?? "Candidate"}
              </div>
              <div style={{ color: textSub, fontSize: 13, marginTop: 6 }}>
                AI Interviewer
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                background: isDark ? "#141424" : "#faf9ff",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <p
                style={{
                  color: textSub,
                  fontSize: 13,
                  marginBottom: 8,
                  fontWeight: 700,
                }}
              >
                Session tips
              </p>
              <ul
                style={{
                  color: textSub,
                  fontSize: 13,
                  paddingLeft: 16,
                  lineHeight: 1.6,
                }}
              >
                <li>Keep answers concise (1–2 lines)</li>
                <li>Be honest — AI adapts</li>
                <li>End session to get a summary</li>
              </ul>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              ref={listRef}
              style={{
                minHeight: 360,
                maxHeight: 560,
                overflowY: "auto",
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 12,
                padding: 18,
              }}
            >
              {messages.length === 0 ? (
                <div style={{ color: textSub }}>
                  No conversation yet. Start by sending a message.
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      marginBottom: 12,
                      alignItems: "flex-start",
                      justifyContent:
                        m.role === "ai" ? "flex-start" : "flex-end",
                    }}
                  >
                    {m.role === "ai" && (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: isDark ? "#0a0a14" : "#f3f0ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <User size={18} color="#7c3aed" />
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: "78%",
                        background:
                          m.role === "ai"
                            ? isDark
                              ? "#0f0f1a"
                              : "#ffffff"
                            : "#7c3aed",
                        color: m.role === "ai" ? textMain : "#fff",
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: `1px solid ${m.role === "ai" ? cardBorder : "transparent"}`,
                      }}
                    >
                      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                        {typeof m.content === "object" && m.content !== null ? (
                          <pre
                            style={{
                              whiteSpace: "pre-wrap",
                              margin: 0,
                              color: m.role === "ai" ? textMain : "#fff",
                            }}
                          >
                            {JSON.stringify(m.content, null, 2)}
                          </pre>
                        ) : (
                          m.content
                        )}
                      </div>
                    </div>
                    {m.role === "user" && (
                      <div style={{ width: 36, height: 36 }} />
                    )}
                  </div>
                ))
              )}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={ended}
                placeholder={ended ? "Session ended" : "Type a message..."}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid ${cardBorder}`,
                  background: isDark ? "#0a0a14" : "#fff",
                  color: textMain,
                }}
              />
              <button
                onClick={handleSend}
                disabled={sending || ended}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "#7c3aed",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sending ? "Sending…" : "Send"}
              </button>
              <button
                onClick={handleEnd}
                disabled={ended}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "transparent",
                  border: `1px solid ${cardBorder}`,
                  color: textSub,
                }}
              >
                {ended ? "Ended" : "End"}
              </button>
            </div>

            {ended && (
              <div
                style={{
                  background: isDark ? "#0f0f1a" : "#fff",
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <p
                  style={{
                    color: textSub,
                    fontSize: 13,
                    marginBottom: 8,
                    fontWeight: 700,
                  }}
                >
                  Summary
                </p>
                <div>
                  {typeof summary === "object" && summary !== null ? (
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        margin: 0,
                        color: textMain,
                      }}
                    >
                      {JSON.stringify(summary, null, 2)}
                    </pre>
                  ) : (
                    <div style={{ color: textMain }}>
                      {summary ?? "No summary available"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveInterview;
