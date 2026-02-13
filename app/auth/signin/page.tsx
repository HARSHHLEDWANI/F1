"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!email || !password) {
        setError("Please enter both email and password.");
        setIsLoading(false);
        return;
      }

      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      
      // Constructing payload based on your schema.py
      const payload = mode === "register" 
        ? {
            email: email.trim(),
            password: password,
            name: name.trim() || "", // Matches Optional[str]
            tier: "free"
          }
        : {
            email: email.trim(),
            password: password
          };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {  
        // Handle FastAPI 422 validation errors specifically
        if (res.status === 422 && Array.isArray(data.detail)) {
          setError(`Validation Error: ${data.detail[0].msg} (${data.detail[0].loc[1]})`);
        } else {
          setError(data.detail || "Authentication failed");
        }
        setIsLoading(false);
        return;
      }

      // Success logic
      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = "/";

    } catch (err) {
      console.error(err);
      setError("Server is unreachable. Please ensure the backend is running.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { redirect: true, callbackUrl: "/" });
    } catch (err) {
      console.error("Sign in error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-900 to-black p-4">
      <div className="w-full max-w-md rounded-2xl bg-white/10 p-8 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter italic">🏎️ F1 PREDICTOR</h1>
          <p className="text-gray-400 text-sm">Join the grid and start predicting</p>
        </div>

        <div className="flex mb-8 rounded-lg bg-black/40 p-1 border border-white/5">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md transition-all duration-200 ${
              mode === "login" ? "bg-red-600 text-white font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            LOGIN
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-md transition-all duration-200 ${
              mode === "register" ? "bg-red-600 text-white font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            REGISTER
          </button>
        </div>

        <div className="space-y-4">
          {mode === "register" && (
            <div className="group">
              <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-widest">Display Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                placeholder="e.g. MaxV1"
              />
            </div>
          )}
          
          <div className="group">
            <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              placeholder="driver@f1.com"
            />
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-red-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleEmailAuth}
            disabled={isLoading}
            className="w-full py-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black tracking-widest transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
          >
            {isLoading ? "SYNCING..." : mode === "login" ? "ENTER PADDOCK" : "SIGN CONTRACT"}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-tighter"><span className="bg-[#1a1a1a] px-4 text-gray-500">Quick Access</span></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 rounded-lg bg-white hover:bg-gray-200 text-black font-bold flex items-center justify-center gap-3 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            GOOGLE
          </button>
        </div>
      </div>
    </div>
  );
}
