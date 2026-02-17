"use client";

import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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

      let res;

      // 🟢 REGISTER
      if (mode === "register") {
        res = await fetch(`${API_BASE}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
            name: name.trim() || "",
          }),
        });
      } else {
        // 🔵 LOGIN
        res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: email.trim(),
            password,
          }).toString(),
        });
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.detail || "Authentication failed");
        setIsLoading(false);
        return;
      }

      // ✅ STORE JWT TOKEN AFTER LOGIN
      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      // redirect after success
      window.location.href = "/";

    } catch (err) {
      console.error(err);
      setError("Server unreachable. Make sure backend is running.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-900 to-black p-4">
      <div className="w-full max-w-md rounded-2xl bg-white/10 p-8 backdrop-blur-md border border-white/20 shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 italic">
            🏎️ F1 PREDICTOR
          </h1>
          <p className="text-gray-400 text-sm">
            Join the grid and start predicting
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8 rounded-lg bg-black/40 p-1 border border-white/5">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md ${
              mode === "login"
                ? "bg-red-600 text-white font-bold"
                : "text-gray-400"
            }`}
          >
            LOGIN
          </button>

          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-md ${
              mode === "register"
                ? "bg-red-600 text-white font-bold"
                : "text-gray-400"
            }`}
          >
            REGISTER
          </button>
        </div>

        <div className="space-y-4">

          {mode === "register" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
              placeholder="Display name"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
            placeholder="Email"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
            placeholder="Password"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleEmailAuth}
            disabled={isLoading}
            className="w-full py-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black disabled:opacity-50"
          >
            {isLoading
              ? "SYNCING..."
              : mode === "login"
              ? "ENTER PADDOCK"
              : "SIGN CONTRACT"}
          </button>

        </div>
      </div>
    </div>
  );
}
