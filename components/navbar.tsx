"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useUserTier } from "@/hooks/useUserTier";
import { apiFetch } from "@/lib/api";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { tier, loading: tierLoading } = useUserTier();
  

  // ✅ Fetch user from backend


useEffect(() => {
  const fetchUser = async () => {
    try {
      const userData = await apiFetch("/me");
      setUser(userData);
    } catch (err) {
      console.warn("User not logged in");
      setUser(null);
    }
  };

  fetchUser();
}, []);

  // ✅ Real logout (call backend if you have logout endpoint)
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }

    window.location.href = "/auth/signin";
  };

  return (
    <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-red-600/30 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-white hover:text-red-500 transition"
          >
            <span className="text-2xl">🏎️</span>
            <span className="hidden sm:inline">F1 PREDICTOR</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/teams" className="text-gray-300 hover:text-red-500 font-medium">Teams</Link>
            <Link href="/drivers" className="text-gray-300 hover:text-red-500 font-medium">Drivers</Link>
            <Link href="/tracks" className="text-gray-300 hover:text-red-500 font-medium">Tracks</Link>
            <Link href="/prediction" className="text-gray-300 hover:text-red-500 font-medium">Predictions</Link>
            <Link href="/profile" className="text-gray-300 hover:text-red-500 font-medium">Profile</Link>

            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-red-600/30">

                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-300">
                    {user.name || user.email}
                  </span>

                  <span className="text-[11px] uppercase tracking-wide rounded-full px-2 py-0.5 bg-gray-900 border border-red-600/50 text-red-400">
                    {tierLoading
                      ? "Loading..."
                      : tier === "pro"
                      ? "Pro Access"
                      : "Free Tier"}
                  </span>
                </div>

                {tier !== "pro" && !tierLoading && (
                  <Link
                    href="/upgrade"
                    className="text-xs font-semibold text-yellow-300 border border-yellow-400/60 px-3 py-1 rounded-full hover:bg-yellow-400 hover:text-black transition"
                  >
                    Upgrade to Pro
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-red-600/30 pt-4">

            <Link href="/teams" className="block text-gray-300 hover:text-red-500 py-2">Teams</Link>
            <Link href="/drivers" className="block text-gray-300 hover:text-red-500 py-2">Drivers</Link>
            <Link href="/tracks" className="block text-gray-300 hover:text-red-500 py-2">Tracks</Link>
            <Link href="/prediction" className="block text-gray-300 hover:text-red-500 py-2">Predictions</Link>
            <Link href="/profile"className="block text-gray-300 hover:text-red-500 py-2">Profile</Link>
            {user ? (
              <div className="space-y-2">

                <div className="flex justify-between px-1">
                  <span className="text-xs text-gray-300 truncate">
                    {user.name || user.email}
                  </span>

                  <span className="text-[10px] uppercase rounded-full px-2 py-0.5 bg-gray-900 border border-red-600/50 text-red-400">
                    {tierLoading ? "Loading..." : tier === "pro" ? "Pro" : "Free"}
                  </span>
                </div>

                {tier !== "pro" && !tierLoading && (
                  <Link
                    href="/upgrade"
                    className="block text-xs font-semibold text-yellow-300 border border-yellow-400/60 px-3 py-1 rounded-full text-center hover:bg-yellow-400 hover:text-black transition"
                  >
                    Upgrade to Pro
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="block bg-red-600 text-white px-4 py-2 rounded-lg text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
