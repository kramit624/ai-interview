import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Brain,
  Calendar,
  FileText,
  Mic,
  Star,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  ChevronRight,
  Award,
  Code2,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

gsap.registerPlugin(ScrollTrigger);

const Home = ({ theme }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const heroRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroBadgeRef = useRef(null);
  const heroBtnRef = useRef(null);
  const heroImgRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  const handleGetStarted = () => {
    if (user) {
      navigate("/interview");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(
      heroBadgeRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
    )
      .fromTo(
        heroTextRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.3",
      )
      .fromTo(
        heroBtnRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.4",
      )
      .fromTo(
        heroImgRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power3.out" },
        "-=0.5",
      );

    gsap.fromTo(
      ".stat-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 85%",
        },
      },
    );

    gsap.fromTo(
      ".feature-card",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
      },
    );

    gsap.fromTo(
      ".testimonial-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: "top 80%",
        },
      },
    );

    gsap.fromTo(
      ctaRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 85%",
        },
      },
    );

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  const stats = [
    { value: "50K+", label: "Interviews Done", icon: Brain },
    { value: "2.4K+", label: "Developers", icon: Users },
    { value: "94%", label: "Placement Rate", icon: TrendingUp },
    { value: "4.9★", label: "User Rating", icon: Star },
  ];

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Interview",
      desc: "Smart question generation based on your resume. MCQ and long-form modes with real-time AI evaluation and detailed feedback.",
      color: "violet",
      badge: "Most Popular",
    },
    {
      icon: Calendar,
      title: "Book Real Developers",
      desc: "Schedule mock interviews with experienced developers. Pick your slot, practice with real human feedback.",
      color: "indigo",
      badge: null,
    },
    {
      icon: FileText,
      title: "Resume Intelligence",
      desc: "Upload your resume and our AI structures it — extracting skills, projects, and experience for personalized questions.",
      color: "blue",
      badge: null,
    },
    {
      icon: MessageSquare,
      title: "Live AI Chat Interview",
      desc: "Have a real back-and-forth conversation with our AI interviewer. Gets harder as you improve.",
      color: "purple",
      badge: "New",
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      desc: "Track your progress over time. Identify weak areas and get actionable improvement suggestions.",
      color: "violet",
      badge: null,
    },
    {
      icon: Mic,
      title: "Voice Interview (Soon)",
      desc: "Speak your answers naturally. Our AI converts speech to text and evaluates your responses in real time.",
      color: "indigo",
      badge: "Coming Soon",
    },
  ];

  const testimonials = [
    {
      name: "Aarav Mehta",
      role: "Frontend Dev @ Razorpay",
      text: "Practiced 20+ AI interviews before my actual Razorpay round. The feedback quality is insane — felt like a real senior was reviewing me.",
      avatar: "AM",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "SDE-1 @ Flipkart",
      text: "The resume-based questions were spot on. It literally asked me about my exact projects. Got placed in 3 weeks of practice.",
      avatar: "PS",
      rating: 5,
    },
    {
      name: "Rohan Verma",
      role: "Fullstack Dev (Mentor)",
      text: "I earn ₹2500+ per session mentoring freshers. The booking system is seamless and the freshers come well-prepared.",
      avatar: "RV",
      rating: 5,
    },
  ];

  const howItWorks = [
    {
      step: "01",
      icon: FileText,
      title: "Upload Resume",
      desc: "Our AI parses and structures your resume intelligently",
    },
    {
      step: "02",
      icon: Brain,
      title: "AI Generates Questions",
      desc: "Role-specific questions tailored to your actual experience",
    },
    {
      step: "03",
      icon: Code2,
      title: "Practice & Get Feedback",
      desc: "Real-time evaluation with scores and improvement tips",
    },
    {
      step: "04",
      icon: Award,
      title: "Track & Improve",
      desc: "Analytics dashboard shows your growth over time",
    },
  ];

  const isDark = theme === "dark";

  return (
    <main
      className={`min-h-screen pt-16 ${isDark ? "bg-gray-950" : "bg-white"}`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* ============ HERO ============ */}
      <section
        ref={heroRef}
        className={`relative overflow-hidden pt-20 pb-10 lg:pt-28 lg:pb-16 ${
          isDark ? "bg-gray-950" : "bg-white"
        }`}
      >
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute -top-16 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-violet-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div
              ref={heroBadgeRef}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-500 border border-violet-500/20">
                <Zap size={12} fill="currentColor" />
                AI-Powered Interview Platform
              </span>
            </div>

            {/* Headline */}
            <div ref={heroTextRef}>
              <h1
                className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Crack every{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                    interview
                  </span>
                </span>
                <br />
                with AI precision
              </h1>
              <p
                className={`text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Practice with resume-tailored AI interviews, book mock sessions
                with real developers, and track your growth — all in one place.
              </p>
            </div>

            {/* CTA Buttons */}
            <div
              ref={heroBtnRef}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
            >
              <button
                onClick={handleGetStarted}
                className="group flex items-center gap-2 px-8 py-4 cursor-pointer rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-base hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 shadow-xl shadow-violet-500/30 hover:shadow-violet-500/40 hover:scale-105"
              >
                Get Started Free
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
              <Link
                to="/developers"
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base border transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? "border-gray-700 text-gray-300 hover:border-violet-500/50 hover:text-violet-400 hover:bg-violet-500/5"
                    : "border-gray-200 text-gray-700 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50"
                }`}
              >
                Book a Developer
                <ChevronRight size={18} />
              </Link>
            </div>

            {/* Trust badges */}
            <div
              className={`flex items-center justify-center gap-6 mt-10 text-sm ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {["Free to start", "No credit card", "AI-powered"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2
                    size={14}
                    className="text-violet-500 flex-shrink-0"
                  />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero Image / Dashboard Preview */}
          <div ref={heroImgRef} className="mt-16 relative max-w-5xl mx-auto">
            <div
              className={`rounded-3xl overflow-hidden border shadow-2xl ${
                isDark
                  ? "border-gray-800/60 shadow-black/60 bg-gray-900"
                  : "border-gray-200 shadow-gray-200/80 bg-gray-50"
              }`}
            >
              {/* Fake browser bar */}
              <div
                className={`flex items-center gap-2 px-4 py-3 border-b ${
                  isDark
                    ? "border-gray-800 bg-gray-900/80"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex gap-1.5">
                  {["bg-red-400", "bg-amber-400", "bg-green-400"].map((c) => (
                    <div key={c} className={`w-3 h-3 rounded-full ${c}`} />
                  ))}
                </div>
                <div
                  className={`flex-1 mx-4 h-6 rounded-lg text-xs flex items-center px-3 ${
                    isDark
                      ? "bg-gray-800 text-gray-500"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  interviewai.com/interview
                </div>
              </div>

              {/* Dashboard UI mockup */}
              <div className={`p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left panel */}
                  <div
                    className={`lg:col-span-2 rounded-2xl p-5 border ${
                      isDark
                        ? "bg-gray-800/60 border-gray-700/50"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                        <Brain size={18} className="text-violet-500" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          AI Interviewer
                        </p>
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Live session — Backend Role
                        </p>
                      </div>
                      <span className="ml-auto flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Active
                      </span>
                    </div>

                    <div
                      className={`rounded-xl p-4 mb-3 ${
                        isDark ? "bg-gray-900/60" : "bg-gray-50"
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <span className="text-violet-500 font-medium">
                          AI:{" "}
                        </span>
                        Explain how Node.js event loop handles async operations,
                        and how would you handle blocking calls?
                      </p>
                    </div>

                    <div
                      className={`rounded-xl p-4 border-2 border-dashed ${
                        isDark
                          ? "border-gray-700 bg-gray-800/40"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Type your answer...
                      </p>
                    </div>
                  </div>

                  {/* Right panel */}
                  <div className="flex flex-col gap-3">
                    <div
                      className={`rounded-2xl p-4 border ${
                        isDark
                          ? "bg-gray-800/60 border-gray-700/50"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <p
                        className={`text-xs font-medium mb-3 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Session Score
                      </p>
                      <div className="flex items-end gap-1">
                        <span
                          className={`text-3xl font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          8.4
                        </span>
                        <span
                          className={`text-sm mb-1 ${
                            isDark ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          /10
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                          style={{ width: "84%" }}
                        />
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl p-4 border ${
                        isDark
                          ? "bg-gray-800/60 border-gray-700/50"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <p
                        className={`text-xs font-medium mb-2 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Progress
                      </p>
                      {["React", "Node.js", "System Design"].map((skill, i) => (
                        <div key={skill} className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span
                              className={
                                isDark ? "text-gray-400" : "text-gray-600"
                              }
                            >
                              {skill}
                            </span>
                            <span className="text-violet-500 font-medium">
                              {[78, 65, 52][i]}%
                            </span>
                          </div>
                          <div
                            className={`h-1 rounded-full ${
                              isDark ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                              style={{ width: `${[78, 65, 52][i]}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-4 top-1/3 hidden lg:flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold px-3 py-2 rounded-xl backdrop-blur">
              <CheckCircle2 size={13} />
              Great answer! +8 pts
            </div>
            <div className="absolute -right-4 bottom-1/3 hidden lg:flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-semibold px-3 py-2 rounded-xl backdrop-blur">
              <Brain size={13} />
              AI analyzing...
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section
        ref={statsRef}
        className={`py-16 border-y ${
          isDark
            ? "border-gray-800/60 bg-gray-900/40"
            : "border-gray-100 bg-gray-50/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className={`stat-card text-center p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? "bg-gray-900 border-gray-800/60 hover:border-violet-500/30"
                    : "bg-white border-gray-200 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} className="text-violet-500" />
                </div>
                <p
                  className={`text-3xl font-extrabold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {value}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section
        ref={featuresRef}
        className={`py-24 ${isDark ? "bg-gray-950" : "bg-white"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-500 border border-violet-500/20 mb-4">
              Everything You Need
            </span>
            <h2
              className={`text-4xl sm:text-5xl font-extrabold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Features built for{" "}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                real growth
              </span>
            </h2>
            <p
              className={`text-lg max-w-2xl mx-auto ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              From AI-powered practice to human mentorship, every tool you need
              to ace your interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, badge }) => (
              <div
                key={title}
                className={`feature-card group relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                  isDark
                    ? "bg-gray-900 border-gray-800/60 hover:border-violet-500/40 hover:bg-gray-900/80"
                    : "bg-white border-gray-200 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/10"
                }`}
              >
                {badge && (
                  <span
                    className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      badge === "Coming Soon"
                        ? isDark
                          ? "bg-gray-800 text-gray-400"
                          : "bg-gray-100 text-gray-500"
                        : badge === "New"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-violet-500/10 text-violet-500"
                    }`}
                  >
                    {badge}
                  </span>
                )}
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                  <Icon size={22} className="text-violet-500" />
                </div>
                <h3
                  className={`text-base font-bold mb-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section
        className={`py-24 ${isDark ? "bg-gray-900/50" : "bg-gray-50/80"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-4">
              Simple Process
            </span>
            <h2
              className={`text-4xl sm:text-5xl font-extrabold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div
              className={`absolute top-10 left-[12.5%] right-[12.5%] h-px hidden lg:block ${
                isDark ? "bg-gray-800" : "bg-gray-200"
              }`}
              style={{
                background: `linear-gradient(to right, transparent, ${
                  isDark ? "#374151" : "#e5e7eb"
                } 20%, ${isDark ? "#374151" : "#e5e7eb"} 80%, transparent)`,
              }}
            />
            {howItWorks.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/30">
                  <Icon size={30} className="text-white" />
                </div>
                <span className="text-5xl font-black bg-gradient-to-r from-violet-600/20 to-indigo-600/20 bg-clip-text text-transparent">
                  {step}
                </span>
                <h3
                  className={`text-base font-bold mt-1 mb-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {title}
                </h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section
        ref={testimonialsRef}
        className={`py-24 ${isDark ? "bg-gray-950" : "bg-white"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4">
              Success Stories
            </span>
            <h2
              className={`text-4xl sm:text-5xl font-extrabold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Real results,{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                real people
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, avatar, rating }) => (
              <div
                key={name}
                className={`testimonial-card p-6 rounded-2xl border ${
                  isDark
                    ? "bg-gray-900 border-gray-800/60"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p
                  className={`text-sm leading-relaxed mb-5 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  "{text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {name}
                    </p>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section
        ref={ctaRef}
        className={`py-24 ${isDark ? "bg-gray-900/50" : "bg-gray-50"}`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className={`p-10 sm:p-14 rounded-3xl border relative overflow-hidden ${
              isDark
                ? "bg-gray-900 border-gray-800/60"
                : "bg-white border-gray-200 shadow-xl shadow-gray-200/60"
            }`}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-500 border border-violet-500/20 mb-6">
                <Zap size={12} fill="currentColor" />
                Start for free today
              </span>
              <h2
                className={`text-4xl sm:text-5xl font-extrabold mb-4 leading-tight ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Ready to ace your{" "}
                <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                  next interview?
                </span>
              </h2>
              <p
                className={`text-lg mb-8 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Join 50,000+ developers who leveled up with InterviewAI.
              </p>
              <button
                onClick={handleGetStarted}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-base hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 shadow-xl shadow-violet-500/30 hover:scale-105"
              >
                {user ? "Go to Interview" : "Start Free — No Card Needed"}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
