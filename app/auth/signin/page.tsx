"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { signIn } from "next-auth/react";
import { apiFetch } from "@/lib/api";

const SteeringWheel3D = dynamic(
  () => import("@/components/3d/SteeringWheel3D"),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#050508]" />,
  }
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Inline styles / keyframes injected once                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(60px); }
    to   { opacity: 1; transform: translateX(0);    }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-60px); }
    to   { opacity: 1; transform: translateX(0);     }
  }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0);   }
    15%       { transform: translateX(-8px); }
    30%       { transform: translateX(8px);  }
    45%       { transform: translateX(-6px); }
    60%       { transform: translateX(6px);  }
    75%       { transform: translateX(-4px); }
    90%       { transform: translateX(4px);  }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 6px #E10600, 0 0 14px #E1060055; }
    50%       { box-shadow: 0 0 14px #E10600, 0 0 30px #E1060088; }
  }
  @keyframes cyanPulse {
    0%, 100% { box-shadow: 0 0 4px #00D2FF66; }
    50%       { box-shadow: 0 0 12px #00D2FFaa; }
  }
  @keyframes statusBlink {
    0%, 80%, 100% { opacity: 1; }
    40%            { opacity: 0.3; }
  }
  @keyframes gridMove {
    from { background-position: 0 0; }
    to   { background-position: 40px 40px; }
  }
  @keyframes borderTrace {
    0%   { clip-path: inset(0 100% 100% 0); }
    25%  { clip-path: inset(0 0 100% 0);    }
    50%  { clip-path: inset(0 0 0 0);       }
    100% { clip-path: inset(0 0 0 0);       }
  }
  .hud-input:focus {
    outline: none;
    border-color: #E10600 !important;
    box-shadow: 0 0 0 1px #E1060066, 0 0 18px #E1060033;
  }
  .hud-input:focus + .scan-bar {
    animation: scanline 1s linear forwards;
  }
  .btn-auth:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 24px #E1060099, 0 8px 32px #E1060044;
  }
  .btn-auth:active {
    transform: translateY(0) scale(0.98);
  }
  .tab-btn:hover:not(.tab-active) {
    color: #00D2FF;
  }
`;

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Sub-components                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function HudCornerBrackets({ color = "#E10600" }: { color?: string }) {
  const s = (pos: string): React.CSSProperties => ({
    position: "absolute",
    width: 18,
    height: 18,
    borderColor: color,
    borderStyle: "solid",
    ...({
      tl: { top: 0, left: 0, borderWidth: "2px 0 0 2px" },
      tr: { top: 0, right: 0, borderWidth: "2px 2px 0 0" },
      bl: { bottom: 0, left: 0, borderWidth: "0 0 2px 2px" },
      br: { bottom: 0, right: 0, borderWidth: "0 2px 2px 0" },
    } as Record<string, React.CSSProperties>)[pos],
  });
  return (
    <>
      <span style={s("tl")} />
      <span style={s("tr")} />
      <span style={s("bl")} />
      <span style={s("br")} />
    </>
  );
}

function HudInput({
  label,
  type,
  value,
  onChange,
  icon,
  right,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  right?: React.ReactNode;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontFamily: "'Rajdhani', 'Orbitron', monospace",
          fontSize: 10,
          letterSpacing: "0.2em",
          color: "#00D2FF",
          marginBottom: 6,
          fontWeight: 700,
        }}
      >
        {label}:
      </div>
      <div style={{ position: "relative" }}>
        {/* left icon */}
        <span
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: focused ? "#E10600" : "#4a4a5a",
            transition: "color 0.2s",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          {icon}
        </span>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className="hud-input"
          style={{
            width: "100%",
            background:
              "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,210,255,0.015) 2px,rgba(0,210,255,0.015) 4px), #0a0a0f",
            border: `1px solid ${focused ? "#E10600" : "#1e1e2e"}`,
            borderRadius: 4,
            padding: "13px 44px 13px 42px",
            color: "#e8e8f0",
            fontSize: 14,
            fontFamily: "monospace",
            letterSpacing: "0.05em",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
          }}
        />
        {right && (
          <span
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
            }}
          >
            {right}
          </span>
        )}
        {/* scan bar that sweeps on focus */}
        {focused && (
          <span
            className="scan-bar"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: 2,
              background:
                "linear-gradient(90deg,transparent,#00D2FF88,transparent)",
              pointerEvents: "none",
              animation: "scanline 0.8s linear forwards",
            }}
          />
        )}
        {/* blinking cursor overlay when focused & empty */}
        {focused && !value && (
          <span
            style={{
              position: "absolute",
              left: 43,
              top: "50%",
              transform: "translateY(-50%)",
              width: 2,
              height: 16,
              background: "#E10600",
              animation: "blink 0.8s step-end infinite",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main page                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function SignInPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!email || !password) {
      setError("All fields are required.");
      triggerShake();
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      triggerShake();
      return;
    }
    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      triggerShake();
      return;
    }

    setIsLoading(true);
    localStorage.removeItem("token");

    try {
      if (mode === "register") {
        await apiFetch(
          "/signup",
          {
            method: "POST",
            body: JSON.stringify({ email: email.trim(), password }),
          },
          { skipAuth: true }
        );
      }

      const loginData = await apiFetch(
        "/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: email.trim(),
            password,
          }).toString(),
        },
        { skipAuth: true }
      );

      if (!loginData?.access_token) {
        setError("Invalid credentials. Access denied.");
        triggerShake();
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", loginData.access_token);
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message || "System unreachable. Try again.");
      triggerShake();
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  /* ── icons ── */
  const IconAt = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94" />
    </svg>
  );
  const IconLock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
  const IconEye = ({ open }: { open: boolean }) =>
    open ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  const IconChevron = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
  const IconSpinner = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
  const IconGoogle = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
  const IconGitHub = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#e8e8f0">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );

  return (
    <>
      {/* inject global keyframes */}
      <style>{GLOBAL_CSS}</style>

      <div
        onKeyDown={handleKeyDown}
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#050508",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* LEFT PANEL — 60%                                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            flex: "0 0 60%",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          className="hidden md:flex"
        >
          {/* 3D background */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <SteeringWheel3D />
          </div>

          {/* HUD grid overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              backgroundImage: `
                linear-gradient(rgba(0,210,255,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,210,255,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
              animation: "gridMove 8s linear infinite",
            }}
          />

          {/* dark gradient to make content readable */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              background:
                "linear-gradient(135deg,rgba(5,5,8,0.7) 0%,rgba(5,5,8,0.3) 50%,rgba(5,5,8,0.85) 100%)",
            }}
          />

          {/* Content on top */}
          <div style={{ position: "relative", zIndex: 3, padding: "48px 52px 0" }}>
            {/* F1 logo area */}
            <div
              style={{
                animation: mounted ? "slideInLeft 0.7s ease both" : "none",
              }}
            >
              {/* Red stripe logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div
                  style={{
                    width: 6,
                    height: 48,
                    background: "linear-gradient(180deg,#E10600,#ff4422)",
                    borderRadius: 2,
                    boxShadow: "0 0 18px #E10600",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.35em",
                      color: "#00D2FF",
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    FORMULA 1
                  </div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      color: "#ffffff",
                      letterSpacing: "0.08em",
                      lineHeight: 1,
                      textShadow: "0 0 40px rgba(225,6,0,0.4)",
                    }}
                  >
                    F1 PREDICTOR
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "rgba(232,232,240,0.6)",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  fontWeight: 600,
                }}
              >
                <span style={{ color: "#E10600" }}>▶</span>
                POWERED BY AI
                <span style={{ color: "#1e1e2e" }}>·</span>
                ML PREDICTIONS
                <span style={{ color: "#1e1e2e" }}>·</span>
                LIVE DATA
              </div>
            </div>
          </div>

          {/* Stats strip at bottom */}
          <div
            style={{
              position: "relative",
              zIndex: 3,
              padding: "0 52px 48px",
              animation: mounted ? "slideInLeft 0.7s 0.3s ease both" : "none",
              opacity: mounted ? 1 : 0,
            }}
          >
            <div
              style={{
                borderTop: "1px solid rgba(0,210,255,0.15)",
                paddingTop: 20,
                display: "flex",
                gap: 32,
              }}
            >
              {[
                { val: "20", label: "DRIVERS" },
                { val: "24", label: "CIRCUITS" },
                { val: "ML", label: "POWERED" },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: "#E10600",
                      lineHeight: 1,
                      textShadow: "0 0 20px #E1060066",
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.25em",
                      color: "rgba(232,232,240,0.45)",
                      marginTop: 4,
                      fontWeight: 600,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* RIGHT PANEL — 40%                                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            flex: "1 1 40%",
            minWidth: 0,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflowY: "auto",
            background: "#050508",
            borderLeft: "1px solid rgba(225,6,0,0.12)",
          }}
        >
          {/* scanline overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
              backgroundImage:
                "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.08) 3px,rgba(0,0,0,0.08) 4px)",
            }}
          />

          {/* subtle grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              backgroundImage: `
                linear-gradient(rgba(225,6,0,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(225,6,0,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
            }}
          />

          {/* STATUS INDICATOR — top right */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "rgba(232,232,240,0.5)",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#00D2FF",
                boxShadow: "0 0 8px #00D2FF",
                animation: "statusBlink 2s ease infinite",
              }}
            />
            SYSTEM ONLINE
          </div>

          {/* version text — bottom left */}
          <div
            style={{
              position: "absolute",
              bottom: 18,
              left: 24,
              zIndex: 10,
              fontSize: 9,
              letterSpacing: "0.15em",
              color: "rgba(232,232,240,0.2)",
              fontWeight: 600,
            }}
          >
            F1 PREDICTOR v2.0
          </div>

          {/* main form card */}
          <div
            style={{
              position: "relative",
              zIndex: 5,
              padding: "0 40px",
              maxWidth: 440,
              width: "100%",
              margin: "0 auto",
              animation: mounted ? "slideInRight 0.7s 0.1s ease both" : "none",
              opacity: mounted ? 1 : 0,
            }}
          >
            {/* HUD panel with corner brackets */}
            <div
              style={{
                position: "relative",
                background:
                  "linear-gradient(135deg,rgba(10,10,20,0.95),rgba(5,5,8,0.98))",
                border: "1px solid rgba(225,6,0,0.2)",
                borderRadius: 6,
                padding: "36px 32px 32px",
              }}
            >
              <HudCornerBrackets color="#E10600" />

              {/* ── HEADER ── */}
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      color: "#E10600",
                      fontSize: 20,
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    ⌐
                  </span>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 22,
                      fontWeight: 900,
                      letterSpacing: "0.12em",
                      color: "#ffffff",
                    }}
                  >
                    {mode === "login" ? "PILOT LOGIN" : "REGISTER"}
                  </h1>
                  <span
                    style={{
                      color: "#E10600",
                      fontSize: 20,
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    ¬
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(0,210,255,0.6)",
                    letterSpacing: "0.2em",
                    fontWeight: 600,
                  }}
                >
                  {mode === "login"
                    ? "AUTHENTICATED ACCESS REQUIRED"
                    : "CREATE YOUR PILOT PROFILE"}
                </div>
              </div>

              {/* ── TAB SWITCHER ── */}
              <div
                style={{
                  display: "flex",
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 4,
                  padding: 3,
                  marginBottom: 28,
                  gap: 3,
                }}
              >
                {(["login", "register"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setMode(tab);
                      setError(null);
                    }}
                    className={`tab-btn ${mode === tab ? "tab-active" : ""}`}
                    style={{
                      flex: 1,
                      padding: "9px 0",
                      border: "none",
                      borderRadius: 3,
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.18em",
                      transition: "all 0.2s",
                      background:
                        mode === tab
                          ? "linear-gradient(135deg,#E10600,#c00400)"
                          : "transparent",
                      color: mode === tab ? "#ffffff" : "rgba(232,232,240,0.4)",
                      boxShadow:
                        mode === tab
                          ? "0 0 14px #E1060055"
                          : "none",
                    }}
                  >
                    {tab === "login" ? "LOGIN" : "REGISTER"}
                  </button>
                ))}
              </div>

              {/* ── FORM FIELDS ── */}
              <div
                style={{
                  animation: "fadeIn 0.25s ease",
                }}
              >
                <HudInput
                  label="EMAIL ADDRESS"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="pilot@team.f1"
                  autoComplete="email"
                  icon={<IconAt />}
                />

                <HudInput
                  label="PASSWORD"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  icon={<IconLock />}
                  right={
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(232,232,240,0.4)",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <IconEye open={showPassword} />
                    </button>
                  }
                />

                {mode === "register" && (
                  <HudInput
                    label="CONFIRM PASSWORD"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    icon={<IconLock />}
                    right={
                      <button
                        type="button"
                        onClick={() => setShowConfirm((p) => !p)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "rgba(232,232,240,0.4)",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <IconEye open={showConfirm} />
                      </button>
                    }
                  />
                )}

                {/* Remember me */}
                {mode === "login" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        onClick={() => setRememberMe((r) => !r)}
                        style={{
                          width: 20,
                          height: 20,
                          border: `1px solid ${rememberMe ? "#E10600" : "#2a2a3a"}`,
                          borderRadius: 3,
                          background: rememberMe
                            ? "rgba(225,6,0,0.15)"
                            : "rgba(0,0,0,0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                          boxShadow: rememberMe ? "0 0 8px #E1060044" : "none",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {rememberMe && (
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="#E10600"
                            strokeWidth="2.5"
                          >
                            <polyline points="1.5,6 4.5,9 10.5,3" />
                          </svg>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.15em",
                          color: "rgba(232,232,240,0.5)",
                          fontWeight: 600,
                          userSelect: "none",
                        }}
                      >
                        REMEMBER ME
                      </span>
                    </label>
                    <a
                      href="#"
                      style={{
                        fontSize: 10,
                        color: "rgba(0,210,255,0.5)",
                        textDecoration: "none",
                        letterSpacing: "0.1em",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#00D2FF")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(0,210,255,0.5)")
                      }
                    >
                      FORGOT PASSWORD?
                    </a>
                  </div>
                )}

                {/* ── ERROR PANEL ── */}
                {error && (
                  <div
                    style={{
                      background: "rgba(225,6,0,0.08)",
                      border: "1px solid rgba(225,6,0,0.4)",
                      borderRadius: 4,
                      padding: "11px 14px",
                      marginBottom: 16,
                      position: "relative",
                      animation: shake ? "shake 0.5s ease" : "fadeIn 0.2s ease",
                    }}
                  >
                    <HudCornerBrackets color="#E10600" />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ color: "#E10600", fontSize: 12 }}>⚠</span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#ff6666",
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                        }}
                      >
                        {error}
                      </span>
                    </div>
                  </div>
                )}

                {/* ── SUBMIT BUTTON ── */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn-auth"
                  style={{
                    width: "100%",
                    padding: "15px 24px",
                    background: isLoading
                      ? "rgba(225,6,0,0.5)"
                      : "linear-gradient(135deg,#E10600 0%,#c00400 60%,#ff2200 100%)",
                    border: "none",
                    borderRadius: 4,
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: "0.2em",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    transition: "all 0.2s",
                    boxShadow: "0 0 14px #E1060055, 0 4px 20px rgba(225,6,0,0.3)",
                    position: "relative",
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >
                  {/* shimmer */}
                  {!isLoading && (
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "60%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)",
                        animation: "scanline 2.5s linear infinite",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  {isLoading ? (
                    <>
                      <IconSpinner />
                      VERIFYING...
                    </>
                  ) : (
                    <>
                      AUTHENTICATE
                      <IconChevron />
                    </>
                  )}
                </button>
              </div>

              {/* ── DIVIDER ── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  margin: "22px 0",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background:
                      "linear-gradient(90deg,transparent,rgba(255,255,255,0.08))",
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.2em",
                    color: "rgba(232,232,240,0.3)",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  OR CONTINUE WITH
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background:
                      "linear-gradient(90deg,rgba(255,255,255,0.08),transparent)",
                  }}
                />
              </div>

              {/* ── SOCIAL BUTTONS ── */}
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "GOOGLE", icon: <IconGoogle />, provider: "google" as const },
                  { label: "GITHUB", icon: <IconGitHub />, provider: "github" as const },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => signIn(s.provider, { callbackUrl: "/auth/callback" })}
                    style={{
                      flex: 1,
                      padding: "11px 0",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 4,
                      color: "rgba(232,232,240,0.75)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                  >
                    {s.icon}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* bottom note */}
            <div
              style={{
                marginTop: 16,
                textAlign: "center",
                fontSize: 10,
                color: "rgba(232,232,240,0.25)",
                letterSpacing: "0.1em",
              }}
            >
              {mode === "login" ? (
                <>
                  NO ACCOUNT?{" "}
                  <button
                    onClick={() => { setMode("register"); setError(null); }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(0,210,255,0.6)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      padding: 0,
                    }}
                  >
                    REGISTER NOW
                  </button>
                </>
              ) : (
                <>
                  ALREADY A PILOT?{" "}
                  <button
                    onClick={() => { setMode("login"); setError(null); }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(0,210,255,0.6)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      padding: 0,
                    }}
                  >
                    LOGIN
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
