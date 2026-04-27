import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  CheckCircle2,
  X,
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Pricing = ({ theme }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const headerRef = useRef(null);

  const pageBg = isDark ? "#07070f" : "#f5f3ff";
  const textMain = isDark ? "#f0eeff" : "#1e1b4b";
  const textSub = isDark ? "#6060a0" : "#7b7aa0";
  const cardBg = isDark ? "#0f0f1a" : "#ffffff";
  const cardBorder = isDark ? "#1e1e35" : "#ede9fe";

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
    );
    gsap.fromTo(
      ".price-card",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.25,
      },
    );
    gsap.fromTo(
      ".faq-item",
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.6,
      },
    );
  }, []);

  const plans = [
    {
      id: "free",
      icon: Zap,
      label: "Free",
      price: 0,
      period: "forever",
      desc: "Perfect to get started and explore the platform.",
      accent: "#7c3aed",
      highlight: false,
      features: [
        ["3 AI MCQ interviews/month", true],
        ["1 AI Long interview/month", true],
        ["Basic performance analytics", true],
        ["Resume upload & parsing", true],
        ["Live AI Chat interview", false],
        ["Developer booking", false],
        ["Priority support", false],
        ["PDF report export", false],
      ],
      cta: "Get Started Free",
    },
    {
      id: "pro",
      icon: Crown,
      label: "Pro",
      price: 499,
      period: "month",
      desc: "Unlimited practice + developer sessions. For serious job seekers.",
      accent: "#6366f1",
      highlight: true,
      badge: "Most Popular",
      features: [
        ["Unlimited AI MCQ interviews", true],
        ["Unlimited AI Long interviews", true],
        ["Full analytics dashboard", true],
        ["Resume upload & parsing", true],
        ["Unlimited Live AI Chat", true],
        ["5 developer sessions/month", true],
        ["Priority support", true],
        ["PDF report export", true],
      ],
      cta: "Start Pro — ₹499/mo",
    },
    {
      id: "team",
      icon: Users,
      label: "Team",
      price: 1999,
      period: "month",
      desc: "For bootcamps & colleges. Bulk seats with admin dashboard.",
      accent: "#10b981",
      highlight: false,
      features: [
        ["Everything in Pro", true],
        ["Up to 20 seats", true],
        ["Admin dashboard", true],
        ["Bulk CSV upload", true],
        ["Unlimited developer sessions", true],
        ["Dedicated account manager", true],
        ["Custom branding", true],
        ["SLA support", true],
      ],
      cta: "Contact Sales",
    },
  ];

  const faqs = [
    [
      "Is the free plan really free?",
      "Yes, completely free — no credit card needed. You get 3 MCQ and 1 long-form AI interview every month.",
    ],
    [
      "Can I cancel anytime?",
      "Absolutely. Cancel from your profile settings with one click, effective immediately.",
    ],
    [
      "How are developer sessions charged?",
      "Sessions are pre-paid per booking. Refunds are issued automatically on cancellations with 2+ hours notice.",
    ],
    [
      "Do unused sessions roll over?",
      "Pro plan sessions reset monthly and don't roll over. Team plans have a shared pool.",
    ],
    [
      "What payment methods do you accept?",
      "UPI, Credit/Debit cards, Net banking, and Wallets via Razorpay.",
    ],
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
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 65%)",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "40px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div ref={headerRef} style={{ textAlign: "center", marginBottom: 60 }}>
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
              marginBottom: 20,
            }}
          >
            <Sparkles size={11} /> SIMPLE PRICING
          </span>
          <h1
            style={{
              color: textMain,
              fontSize: 48,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.08,
              marginBottom: 16,
            }}
          >
            Invest in your{" "}
            <span
              style={{
                background: "linear-gradient(130deg,#7c3aed,#6366f1,#a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              career
            </span>
          </h1>
          <p
            style={{
              color: textSub,
              fontSize: 17,
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            Start free. Upgrade when you're serious. No surprise charges.
          </p>
        </div>

        {/* Plans */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 80,
            alignItems: "start",
          }}
        >
          {plans.map(
            ({
              id,
              icon: Icon,
              label,
              price,
              period,
              desc,
              accent,
              highlight,
              badge,
              features,
              cta,
            }) => (
              <div
                key={id}
                className="price-card"
                style={{
                  background: highlight
                    ? `linear-gradient(180deg, ${isDark ? "#110e1f" : "#fdfaff"} 0%, ${cardBg} 100%)`
                    : cardBg,
                  border: highlight
                    ? `2px solid ${accent}55`
                    : `1px solid ${cardBorder}`,
                  borderRadius: 24,
                  padding: "32px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.25s, box-shadow 0.25s",
                  marginTop: highlight ? 0 : 12,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 24px 50px ${accent}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                {highlight && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg,${accent},${accent}88,${accent})`,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 18,
                        right: 18,
                        padding: "4px 12px",
                        borderRadius: 99,
                        fontSize: 10,
                        fontWeight: 700,
                        background: `${accent}18`,
                        color: accent,
                        border: `1px solid ${accent}30`,
                      }}
                    >
                      {badge}
                    </div>
                  </>
                )}

                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: `${accent}18`,
                    border: `1px solid ${accent}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Icon size={22} color={accent} />
                </div>

                <p
                  style={{
                    color: textSub,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
                  {label}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                    marginBottom: 10,
                  }}
                >
                  {price === 0 ? (
                    <span
                      style={{ color: textMain, fontSize: 38, fontWeight: 900 }}
                    >
                      Free
                    </span>
                  ) : (
                    <>
                      <span
                        style={{
                          color: textMain,
                          fontSize: 13,
                          fontWeight: 600,
                          marginTop: 6,
                        }}
                      >
                        ₹
                      </span>
                      <span
                        style={{
                          color: textMain,
                          fontSize: 42,
                          fontWeight: 900,
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {price}
                      </span>
                      <span style={{ color: textSub, fontSize: 13 }}>
                        /{period}
                      </span>
                    </>
                  )}
                </div>
                <p
                  style={{
                    color: textSub,
                    fontSize: 13,
                    lineHeight: 1.65,
                    marginBottom: 28,
                  }}
                >
                  {desc}
                </p>

                <button
                  onClick={() =>
                    id === "team"
                      ? window.open("mailto:hello@interviewai.com")
                      : user
                        ? navigate("/interview")
                        : navigate("/signup")
                  }
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: 14,
                    background: highlight
                      ? `linear-gradient(135deg,${accent},${accent}cc)`
                      : "transparent",
                    color: highlight ? "white" : accent,
                    fontFamily: "inherit",
                    fontSize: 14,
                    fontWeight: 700,
                    border: highlight ? "none" : `2px solid ${accent}55`,
                    cursor: "pointer",
                    marginBottom: 28,
                    boxShadow: highlight ? `0 8px 22px ${accent}35` : "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!highlight)
                      e.currentTarget.style.background = `${accent}12`;
                  }}
                  onMouseLeave={(e) => {
                    if (!highlight)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {cta}
                </button>

                <div
                  style={{
                    borderTop: `1px solid ${isDark ? "#141424" : "#f3f0ff"}`,
                    paddingTop: 24,
                  }}
                >
                  {features.map(([text, included]) => (
                    <div
                      key={text}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 13,
                      }}
                    >
                      {included ? (
                        <CheckCircle2
                          size={15}
                          color={accent}
                          style={{ flexShrink: 0 }}
                        />
                      ) : (
                        <X
                          size={15}
                          color={isDark ? "#3a3a5a" : "#d1d5db"}
                          style={{ flexShrink: 0 }}
                        />
                      )}
                      <span
                        style={{
                          color: included
                            ? textMain
                            : isDark
                              ? "#3a3a5a"
                              : "#c4c4d8",
                          fontSize: 13,
                          fontWeight: included ? 500 : 400,
                        }}
                      >
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2
            style={{
              color: textMain,
              fontSize: 30,
              fontWeight: 900,
              textAlign: "center",
              marginBottom: 40,
              letterSpacing: "-0.025em",
            }}
          >
            Frequently asked questions
          </h2>
          {faqs.map(([q, a], i) => (
            <div
              key={i}
              className="faq-item"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 16,
                padding: "22px 24px",
                marginBottom: 12,
              }}
            >
              <p
                style={{
                  color: textMain,
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {q}
              </p>
              <p style={{ color: textSub, fontSize: 13, lineHeight: 1.7 }}>
                {a}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: 72 }}>
          <div
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              borderRadius: 24,
              padding: "48px 56px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 12,
              }}
            >
              Still not sure?
            </p>
            <h3
              style={{
                color: "white",
                fontSize: 28,
                fontWeight: 900,
                marginBottom: 10,
                letterSpacing: "-0.02em",
              }}
            >
              Try it free — no card needed
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                marginBottom: 28,
              }}
            >
              Join 50,000+ developers already on InterviewAI.
            </p>
            <button
              onClick={() => navigate(user ? "/interview" : "/signup")}
              style={{
                padding: "14px 32px",
                borderRadius: 14,
                background: "white",
                color: "#6d28d9",
                fontFamily: "inherit",
                fontSize: 15,
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.04)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Get started free <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          div[style*="gridTemplateColumns: repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="marginTop: highlight ? 0 : 12"] { margin-top: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Pricing;
