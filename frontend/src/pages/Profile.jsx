import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  User, Mail, AtSign, Edit2, Save, X, Upload, Github, Linkedin,
  FileText, CheckCircle2, Camera, Loader2, ExternalLink, Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

// ─────────────────────────────────────────────────────────────────────────────
// InfoRow and Section are defined OUTSIDE Profile on purpose.
// If they were inside, React would treat them as new component types on every
// re-render (every keystroke), unmounting and remounting them — which kills
// input focus. Keeping them outside gives them a stable identity.
// ─────────────────────────────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value, isDark, textMain, textSub }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 0",
    borderBottom: `1px solid ${isDark ? "#141424" : "#f3f0ff"}`,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 9,
      background: isDark ? "#1a1a30" : "#f5f3ff",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={14} color="#7c3aed" />
    </div>
    <div>
      <p style={{ color: textSub, fontSize: 11, marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p style={{ color: textMain, fontSize: 14, fontWeight: 500 }}>{value || "—"}</p>
    </div>
  </div>
);

const Section = ({
  id, title, children,
  editSection, setEditSection,
  saving, saved, error, saveSection,
  isDark, textMain, textSub, labelCol, cardBg, cardBorder,
}) => (
  <div className="prof-section" style={{
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: 20, padding: "28px",
  }}>
    {/* Header row */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
      <h3 style={{ color: textMain, fontSize: 15, fontWeight: 800 }}>{title}</h3>

      {editSection !== id ? (
        <button
          onClick={() => setEditSection(id)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 10,
            background: "transparent",
            border: `1.5px solid ${isDark ? "#252545" : "#ddd6fe"}`,
            color: labelCol, fontFamily: "'Poppins', sans-serif",
            fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = isDark ? "#1a1a30" : "#f5f3ff"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Edit2 size={12} /> Edit
        </button>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setEditSection(null)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "7px 14px", borderRadius: 10,
              background: "transparent",
              border: `1.5px solid ${isDark ? "#252545" : "#e5e7eb"}`,
              color: textSub, fontFamily: "'Poppins', sans-serif",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            <X size={12} /> Cancel
          </button>
          <button
            onClick={() => saveSection(id)}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "7px 16px", borderRadius: 10,
              background: "linear-gradient(135deg,#7c3aed,#6366f1)",
              color: "white", fontFamily: "'Poppins', sans-serif",
              fontSize: 12, fontWeight: 700, border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? <Loader2 size={12} className="spin" /> : <Save size={12} />} Save
          </button>
        </div>
      )}
    </div>

    {/* Success banner */}
    {saved === id && (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px", borderRadius: 10,
        background: "rgba(16,185,129,0.08)",
        border: "1px solid rgba(16,185,129,0.2)",
        color: "#10b981", fontSize: 13, marginBottom: 16,
      }}>
        <CheckCircle2 size={14} /> Changes saved
      </div>
    )}

    {/* Error banner */}
    {error && editSection === id && (
      <div style={{
        padding: "10px 14px", borderRadius: 10,
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#f87171", fontSize: 13, marginBottom: 16,
      }}>
        {error}
      </div>
    )}

    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const Profile = ({ theme }) => {
  const { user, fetchProfile } = useAuth();
  const isDark = theme === "dark";
  const headerRef = useRef(null);
  const avatarRef = useRef(null);

  // ── edit state ──────────────────────────────────────────────────────────────
  const [editSection, setEditSection] = useState(null);
  const [form, setForm] = useState({ name: "", bio: "", github: "", linkedin: "" });
  const [focusedInput, setFocusedInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  // ── resume state (localStorage-backed so it survives refresh) ───────────────
  const [resume, setResume] = useState(() => {
    try {
      const r = localStorage.getItem("resume");
      return r ? JSON.parse(r) : null;
    } catch { return null; }
  });
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ── theme tokens ────────────────────────────────────────────────────────────
  const pageBg     = isDark ? "#07070f" : "#f5f3ff";
  const textMain   = isDark ? "#f0eeff" : "#1e1b4b";
  const textSub    = isDark ? "#6060a0" : "#7b7aa0";
  const cardBg     = isDark ? "#0f0f1a" : "#ffffff";
  const cardBorder = isDark ? "#1e1e35" : "#ede9fe";
  const inputBg    = isDark ? "#141426" : "#faf8ff";
  const inputBorder= isDark ? "#252545" : "#ddd6fe";
  const labelCol   = isDark ? "#a78bfa" : "#7c3aed";

  // ── helpers ─────────────────────────────────────────────────────────────────
  const persistResume = (data) => {
    setResume(data);
    try {
      if (data) localStorage.setItem("resume", JSON.stringify(data));
      else localStorage.removeItem("resume");
    } catch {}
  };

  const inputStyle = (focused) => ({
    width: "100%", padding: "12px 14px", borderRadius: 12,
    border: `2px solid ${focused ? "#7c3aed" : inputBorder}`,
    background: inputBg, color: textMain,
    fontFamily: "'Poppins', sans-serif",
    fontSize: 14, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focused ? "0 0 0 4px rgba(124,58,237,0.1)" : "none",
  });

  const getInitials = (name) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  // ── effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: -24 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
    );
    gsap.fromTo(".prof-section",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power3.out", delay: 0.2 }
    );

    // Try backend GET (works when route is added); localStorage already has data if uploaded before
    setResumeLoading(true);
    api.get("/resume/get")
      .then(res => {
        const r = res.data?.data?.resume || res.data?.resume || res.data;
        if (r?._id || r?.resumeUrl) persistResume(r);
      })
      .catch(() => { /* silently fall back to localStorage cache */ })
      .finally(() => setResumeLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
      });
    }
  }, [user]);

  // ── API handlers ─────────────────────────────────────────────────────────────
  const saveSection = async (section) => {
    setSaving(true); setError("");
    try {
      if (section === "basic") {
        await api.put("/auth/profile/basic", { name: form.name });
      } else if (section === "social") {
        await api.put("/auth/profile/social", { github: form.github, linkedin: form.linkedin });
      } else if (section === "bio") {
        await api.put("/auth/profile/extras", { bio: form.bio });
      }
      await fetchProfile();
      setSaved(section);
      setEditSection(null);
      setTimeout(() => setSaved(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    setAvatarUploading(true);
    try {
      await api.put("/auth/profile/extras", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchProfile();
      gsap.fromTo(avatarRef.current,
        { scale: 0.8 },
        { scale: 1, duration: 0.4, ease: "back.out(2)" }
      );
    } catch {
      setError("Avatar upload failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("resume", file);
    setResumeUploading(true);
    try {
      // POST for first upload, PUT to replace existing
      const method = resume ? api.put : api.post;
      const res = await method("/resume/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const r = res.data?.data?.resume;
      if (r) persistResume(r);
    } catch {
      setError("Resume upload failed");
    } finally {
      setResumeUploading(false);
    }
  };

  // ── shared props object passed to every Section ──────────────────────────────
  const sectionProps = {
    editSection, setEditSection,
    saving, saved, error, saveSection,
    isDark, textMain, textSub, labelCol, cardBg, cardBorder,
  };

  // ── shared props for InfoRow ─────────────────────────────────────────────────
  const rowProps = { isDark, textMain, textSub };

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: pageBg,
      fontFamily: "'Poppins', sans-serif",
      paddingTop: 80,
    }}>
      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: 0, left: "30%",
          width: 600, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 65%)",
        }} />
      </div>

      <div style={{
        maxWidth: 1080, margin: "0 auto",
        padding: "40px 24px 80px",
        position: "relative", zIndex: 1,
      }}>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div ref={headerRef} style={{ marginBottom: 40 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 99,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
            background: "rgba(124,58,237,0.1)", color: "#7c3aed",
            border: "1px solid rgba(124,58,237,0.2)", marginBottom: 16,
          }}>
            <User size={11} /> MY PROFILE
          </span>
          <h1 style={{ color: textMain, fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em" }}>
            Account{" "}
            <span style={{
              background: "linear-gradient(130deg,#7c3aed,#a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              settings
            </span>
          </h1>
        </div>

        {/* ── Two-column grid ─────────────────────────────────────────────── */}
        <div className="profile-grid" style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 24, alignItems: "start",
        }}>

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Avatar card */}
            <div className="prof-section" style={{
              background: cardBg, border: `1px solid ${cardBorder}`,
              borderRadius: 20, padding: "32px",
              textAlign: "center", position: "relative",
            }}>
              {/* top accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: "linear-gradient(90deg,#7c3aed,#6366f1,transparent)",
                borderRadius: "20px 20px 0 0",
              }} />

              {/* Avatar */}
              <div style={{ position: "relative", display: "inline-block", marginBottom: 18 }}>
                <div ref={avatarRef}>
                  {user?.avatar ? (
                    <img
                      src={user.avatar} alt={user.name}
                      style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(124,58,237,0.3)" }}
                    />
                  ) : (
                    <div style={{
                      width: 96, height: 96, borderRadius: "50%",
                      background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: 30, fontWeight: 900,
                      border: "3px solid rgba(124,58,237,0.3)", margin: "0 auto",
                    }}>
                      {getInitials(user?.name)}
                    </div>
                  )}
                </div>
                {/* Camera button */}
                <label htmlFor="avatar-upload" style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 30, height: 30, borderRadius: "50%",
                  background: "#7c3aed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", border: `2px solid ${cardBg}`,
                }}>
                  {avatarUploading
                    ? <Loader2 size={13} color="white" className="spin" />
                    : <Camera size={13} color="white" />
                  }
                </label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
              </div>

              <p style={{ color: textMain, fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                {user?.name || "—"}
              </p>
              <p style={{ color: textSub, fontSize: 13, marginBottom: 10 }}>@{user?.username}</p>
              <span style={{
                display: "inline-block", padding: "4px 14px", borderRadius: 99,
                fontSize: 11, fontWeight: 700, textTransform: "capitalize",
                background: user?.role === "developer" ? "rgba(16,185,129,0.1)" : "rgba(124,58,237,0.1)",
                color: user?.role === "developer" ? "#10b981" : "#7c3aed",
                border: `1px solid ${user?.role === "developer" ? "rgba(16,185,129,0.25)" : "rgba(124,58,237,0.25)"}`,
              }}>
                {user?.role}
              </span>

              {/* Email / Username rows */}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${isDark ? "#141424" : "#f3f0ff"}` }}>
                <InfoRow icon={Mail}   label="Email"    value={user?.email}    {...rowProps} />
                <InfoRow icon={AtSign} label="Username" value={user?.username} {...rowProps} />
              </div>

              {/* Social icon links */}
              {(user?.github || user?.linkedin) && (
                <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center" }}>
                  {user.github && (
                    <a href={user.github} target="_blank" rel="noreferrer"
                      style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? "#1a1a30" : "#f5f3ff", border: `1px solid ${cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: textSub, textDecoration: "none", transition: "color 0.2s, border-color 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#7c3aed"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = textSub; e.currentTarget.style.borderColor = cardBorder; }}
                    >
                      <Github size={16} />
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={user.linkedin} target="_blank" rel="noreferrer"
                      style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? "#1a1a30" : "#f5f3ff", border: `1px solid ${cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: textSub, textDecoration: "none", transition: "color 0.2s, border-color 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#0077b5"; e.currentTarget.style.borderColor = "#0077b530"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = textSub; e.currentTarget.style.borderColor = cardBorder; }}
                    >
                      <Linkedin size={16} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Resume card */}
            <div className="prof-section" style={{
              background: cardBg, border: `1px solid ${cardBorder}`,
              borderRadius: 20, padding: "24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <FileText size={16} color="#6366f1" />
                <h3 style={{ color: textMain, fontSize: 14, fontWeight: 800 }}>Resume</h3>
              </div>

              {resumeLoading ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Loader2 size={20} color="#7c3aed" className="spin" />
                </div>

              ) : resume ? (
                /* ── Resume exists ── */
                <div>
                  {/* File row */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 14px", borderRadius: 12,
                    background: isDark ? "#141424" : "#f5f3ff",
                    border: `1px solid ${isDark ? "#252545" : "#ddd6fe"}`,
                    marginBottom: 14,
                  }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={16} color="#6366f1" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: textMain, fontSize: 13, fontWeight: 600 }}>Resume uploaded</p>
                      <p style={{ color: textSub, fontSize: 11 }}>
                        {resume.createdAt
                          ? new Date(resume.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "Uploaded"}
                      </p>
                    </div>
                    <a href={resume.resumeUrl} target="_blank" rel="noreferrer" style={{ color: "#6366f1", display: "flex" }}>
                      <ExternalLink size={15} />
                    </a>
                  </div>

                  {/* Detected skills */}
                  {resume.structuredData?.skills?.length > 0 && (
                    <div>
                      <p style={{ color: textSub, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                        Detected Skills
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {resume.structuredData.skills.slice(0, 8).map(s => (
                          <span key={s} style={{
                            padding: "3px 10px", borderRadius: 99,
                            fontSize: 11, fontWeight: 600,
                            background: isDark ? "#1a1a30" : "#f3f0ff",
                            color: isDark ? "#8080c0" : "#6d28d9",
                            border: `1px solid ${isDark ? "#2a2a50" : "#ddd6fe"}`,
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Replace resume button */}
                  <label htmlFor="resume-upload"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      marginTop: 16, padding: "10px", borderRadius: 12,
                      background: "transparent",
                      border: `1.5px dashed ${isDark ? "#252545" : "#ddd6fe"}`,
                      color: textSub, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", transition: "border-color 0.2s, color 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#7c3aed"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "#252545" : "#ddd6fe"; e.currentTarget.style.color = textSub; }}
                  >
                    {resumeUploading
                      ? <><Loader2 size={13} className="spin" /> Uploading…</>
                      : <><Upload size={13} /> Replace resume</>
                    }
                  </label>
                  <input id="resume-upload" type="file" accept=".pdf" onChange={handleResumeUpload} style={{ display: "none" }} />
                </div>

              ) : (
                /* ── No resume — upload prompt ── */
                <label htmlFor="resume-upload" style={{ display: "block", cursor: "pointer" }}>
                  <div
                    style={{
                      textAlign: "center", padding: "28px 16px", borderRadius: 14,
                      border: `2px dashed ${isDark ? "#252545" : "#ddd6fe"}`,
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.background = isDark ? "#1a1a30" : "#f9f8ff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "#252545" : "#ddd6fe"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: isDark ? "#1a1a30" : "#f3f0ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      {resumeUploading
                        ? <Loader2 size={20} color="#7c3aed" className="spin" />
                        : <Upload size={20} color="#7c3aed" />
                      }
                    </div>
                    <p style={{ color: textMain, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      {resumeUploading ? "Uploading…" : "Upload PDF resume"}
                    </p>
                    <p style={{ color: textSub, fontSize: 11 }}>Required for AI interviews</p>
                  </div>
                  <input id="resume-upload" type="file" accept=".pdf" onChange={handleResumeUpload} style={{ display: "none" }} />
                </label>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Basic Info */}
            <Section id="basic" title="Basic Info" {...sectionProps}>
              {editSection === "basic" ? (
                <div>
                  <label style={{ display: "block", color: labelCol, fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Full Name
                  </label>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    onFocus={() => setFocusedInput("name")}
                    onBlur={() => setFocusedInput("")}
                    placeholder="Your full name"
                    style={inputStyle(focusedInput === "name")}
                  />
                </div>
              ) : (
                <div>
                  <InfoRow icon={User} label="Full Name" value={user?.name} {...rowProps} />
                  <InfoRow icon={Mail} label="Email"     value={user?.email} {...rowProps} />
                </div>
              )}
            </Section>

            {/* Bio */}
            <Section id="bio" title="About You" {...sectionProps}>
              {editSection === "bio" ? (
                <div>
                  <label style={{ display: "block", color: labelCol, fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Bio
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    onFocus={() => setFocusedInput("bio")}
                    onBlur={() => setFocusedInput("")}
                    placeholder="Tell us about yourself…"
                    rows={4}
                    style={{ ...inputStyle(focusedInput === "bio"), resize: "vertical", minHeight: 100 }}
                  />
                </div>
              ) : (
                <p style={{ color: user?.bio ? textMain : textSub, fontSize: 14, lineHeight: 1.7, fontStyle: user?.bio ? "normal" : "italic" }}>
                  {user?.bio || "No bio yet. Add one to tell developers about yourself."}
                </p>
              )}
            </Section>

            {/* Social Links */}
            <Section id="social" title="Social Links" {...sectionProps}>
              {editSection === "social" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    ["github",   Github,   "GitHub URL",   "https://github.com/username"],
                    ["linkedin", Linkedin, "LinkedIn URL",  "https://linkedin.com/in/username"],
                  ].map(([key, Icon, label, ph]) => (
                    <div key={key}>
                      <label style={{ display: "flex", alignItems: "center", gap: 7, color: labelCol, fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                        <Icon size={12} /> {label}
                      </label>
                      <input
                        value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        onFocus={() => setFocusedInput(key)}
                        onBlur={() => setFocusedInput("")}
                        placeholder={ph}
                        style={inputStyle(focusedInput === key)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {[
                    ["github",   Github,   "GitHub",   user?.github],
                    ["linkedin", Linkedin, "LinkedIn", user?.linkedin],
                  ].map(([key, Icon, label, val]) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${isDark ? "#141424" : "#f3f0ff"}` }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: isDark ? "#1a1a30" : "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={14} color="#7c3aed" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: textSub, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</p>
                        {val
                          ? <a href={val} target="_blank" rel="noreferrer" style={{ color: "#7c3aed", fontSize: 13, textDecoration: "none" }}>{val}</a>
                          : <p style={{ color: isDark ? "#3a3a5a" : "#c4c4d8", fontSize: 13, fontStyle: "italic" }}>Not added</p>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Danger Zone */}
            <div className="prof-section" style={{
              background: cardBg,
              border: `1px solid ${isDark ? "#3a1a1a" : "#fee2e2"}`,
              borderRadius: 20, padding: "24px",
            }}>
              <h3 style={{ color: "#f87171", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Danger Zone</h3>
              <p style={{ color: textSub, fontSize: 13, marginBottom: 16 }}>These actions are permanent and cannot be undone.</p>
              <button
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
              >
                <Trash2 size={14} /> Delete Account
              </button>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }

        @media (max-width: 1024px) {
          .profile-grid { grid-template-columns: 1fr !important; gap: 18px !important; }
        }
        @media (max-width: 480px) {
          .profile-grid { gap: 12px !important; }
          .prof-section { padding: 16px !important; border-radius: 14px !important; }
        }
      `}</style>
    </div>
  );
};

export default Profile;