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

      // 🟢 REGISTER → JSON
      if (mode === "register") {
        res = await fetch(`${API_BASE}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
            name: name.trim() || "",
            tier: "free",
          }),
        });
      } else {
        // 🔵 LOGIN → OAuth2 form
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

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && Array.isArray(data.detail)) {
          setError(
            `Validation Error: ${data.detail[0].msg} (${data.detail[0].loc[1]})`
          );
        } else {
          setError(data.detail || "Authentication failed");
        }
        setIsLoading(false);
        return;
      }

      // 🔥 LOGIN response → store token
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);

        // store basic user info
        localStorage.setItem(
          "user",
          JSON.stringify({
            email,
            name: name || email,
          })
        );
      } else {
        // REGISTER response
        localStorage.setItem("user", JSON.stringify(data));
      }

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Server is unreachable. Please ensure backend is running.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-red-900 to-black p-4">
      <div className="w-full max-w-md rounded-2xl bg-white/10 p-8 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter italic">
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
            className={`flex-1 py-2 rounded-md transition ${
              mode === "login"
                ? "bg-red-600 text-white font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            LOGIN
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-md transition ${
              mode === "register"
                ? "bg-red-600 text-white font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            REGISTER
          </button>
        </div>

        <div className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">
                Display Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
                placeholder="e.g. MaxV1"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
              placeholder="driver@f1.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleEmailAuth}
            disabled={isLoading}
            className="w-full py-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black tracking-widest disabled:opacity-50"
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
