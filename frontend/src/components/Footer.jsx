import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";

const Footer = ({ theme }) => {
  const { user } = useAuth();

  const footerLinks = {
    Product: [
      { label: "AI Interview", to: "/interview" },
      { label: "Mock Interviews", to: "/developers" },
      { label: "Resume Analysis", to: user ? "/resume" : "/login" },
      { label: "Analytics", to: user ? "/analytics" : "/login" },
    ],
    Company: [
      { label: "About", to: "/about" },
      { label: "Blog", to: "/blog" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
    ],
    Legal: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Cookie Policy", to: "/cookies" },
    ],
  };

  const socials = [
    { label: <Github />, href: "https://github.com" },
    { label: <Twitter />, href: "https://twitter.com" },
    { label: <Linkedin />, href: "https://linkedin.com" },
    { label: <Mail />, href: "mailto:hello@interviewai.com" },
  ];

  return (
    <footer
      className={`border-t ${
        theme === "dark"
          ? "bg-gray-950 border-gray-800/60 text-gray-400"
          : "bg-gray-50 border-gray-200 text-gray-500"
      }`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <span className="text-white text-sm font-bold">⚡</span>
              </div>
              <span
                className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                InterviewAI
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mb-2">
              The AI-powered interview ecosystem for freshers and developers.
              Practice smarter, get hired faster.
            </p>

            {!user && (
              <div className="flex gap-2 mt-6 mb-4">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    theme === "dark"
                      ? "border-gray-700 text-gray-300 hover:bg-white/5"
                      : "border-gray-300 text-gray-700 hover:bg-white"
                  }`}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 transition-all"
                >
                  Get started free
                </Link>
              </div>
            )}

            <div className="flex gap-3 mt-6 mb-2">
              {socials.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={`px-3 py-1 rounded-md text-sm font-medium border transition-all duration-200 ${
                    theme === "dark"
                      ? "border-gray-800 hover:border-violet-500/50 hover:text-violet-400 hover:bg-violet-500/10"
                      : "border-gray-200 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50"
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4
                className={`text-sm font-semibold mb-4 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className={`text-sm transition-colors ${
                        theme === "dark"
                          ? "hover:text-white"
                          : "hover:text-gray-900"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className={`mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
            theme === "dark" ? "border-gray-800/60" : "border-gray-200"
          }`}
        >
          <p>© {new Date().getFullYear()} InterviewAI. All rights reserved.</p>
          <p>
            Built with <span className="text-violet-500">♥</span> for aspiring
            developers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
