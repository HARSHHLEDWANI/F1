"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://127.0.0.1:8000";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/auth/signin");
      return;
    }

    fetch(`${API_BASE}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/auth/signin");
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white bg-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 relative overflow-hidden">
      
      {/* 🔥 Aggressive Red F1 Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_70%)] animate-pulse pointer-events-none" />

      <div className="relative max-w-5xl mx-auto space-y-8">

        {/* PROFILE HEADER */}
        <div className="bg-zinc-900 border border-red-600 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center shadow-lg">

          <div className="flex items-center gap-6">
            
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-2xl font-bold shadow-[0_0_20px_rgba(255,0,0,0.6)]">
              {user.email?.[0]?.toUpperCase()}
            </div>

            {/* Name + Email */}
            <div>
              <h1 className="text-3xl font-bold text-red-500">
                {user.name || "F1 Racer"}
              </h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* PRO Badge Section */}
          <div className="mt-6 md:mt-0 relative">

            {user.plan === "PRO" && (
              <span className="absolute -top-4 -right-4 text-yellow-400 text-2xl">
                👑
              </span>
            )}

            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                user.plan === "PRO"
                  ? "bg-yellow-500 text-black shadow-[0_0_20px_rgba(255,215,0,0.8)]"
                  : "bg-red-600 text-white"
              }`}
            >
              {user.plan || "FREE"}
            </span>
          </div>

        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 hover:border-red-600 transition">
            <h3 className="text-gray-400 text-sm">Predictions Made</h3>
            <p className="text-3xl font-bold mt-2">12</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 hover:border-red-600 transition">
            <h3 className="text-gray-400 text-sm">Accuracy</h3>
            <p className="text-3xl font-bold mt-2">78%</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 hover:border-red-600 transition">
            <h3 className="text-gray-400 text-sm">Favorite Team</h3>
            <p className="text-3xl font-bold mt-2">
              {user.favorite_team || "Not Set"}
            </p>
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4">

          {user.plan !== "PRO" && (
            <button className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition shadow-[0_0_20px_rgba(255,0,0,0.5)]">
              Upgrade to Pro
            </button>
          )}

          <button
            onClick={handleLogout}
            className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            Logout
          </button>

        </div>

      </div>
    </div>
  );
}
