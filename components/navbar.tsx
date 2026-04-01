"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUserTier } from "@/hooks/useUserTier";
import { useLiveRace } from "@/hooks/useLiveRace";
import { apiFetch } from "@/lib/api";
import {
  Menu, X, Zap, Users, Trophy, Map,
  Cpu, LogOut, ChevronRight, BookOpen, Gamepad2, Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Static ticker items ───────────────────────────────────────────────────────
const STATIC_TICKER = [
  "🏁 2025 SEASON · FORMULA 1 WORLD CHAMPIONSHIP",
  "⚡ AI PREDICTIONS · RANDOM FOREST ML MODEL",
  "📡 LIVE TIMING · REAL F1 DATA",
  "🏆 24 ROUNDS · 20 DRIVERS · 10 CONSTRUCTORS",
  "🌡️ TRACK ANALYTICS · CIRCUIT TELEMETRY",
  "🛞 PIT STRATEGY ANALYSIS · ML POWERED",
];

// ── Nav links ─────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { name: "Learn F1",    href: "/learn",       icon: BookOpen },
  { name: "Simulations", href: "/simulations", icon: Gamepad2 },
  { name: "Teams",       href: "/teams",       icon: Users },
  { name: "Drivers",     href: "/drivers",     icon: Trophy },
  { name: "Tracks",      href: "/tracks",      icon: Map },
  { name: "Predictions", href: "/prediction",  icon: Cpu },
];

// ── User initials ─────────────────────────────────────────────────────────────
function getInitials(email: string): string {
  const parts = email.split("@")[0].split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

// ── Active Nav Indicator ──────────────────────────────────────────────────────
function NavIndicator() {
  return (
    <motion.span
      layoutId="nav-indicator"
      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#E10600]"
      style={{ boxShadow: "0 0 10px rgba(225,6,0,0.9), 0 0 20px rgba(225,6,0,0.5)" }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
    />
  );
}

// ── Race Ticker Strip ─────────────────────────────────────────────────────────
function RaceTicker() {
  const { isSimulation, isLive, lap, totalLaps, leaderboard } = useLiveRace();

  // Build dynamic leaderboard items from top 3
  const dynamicItems: string[] = [];
  if (leaderboard.length >= 3) {
    const top3 = leaderboard.slice(0, 3);
    const leaderStr = top3
      .map((e) => `P${e.position}: ${e.driverCode} ${e.gap === "LEADER" ? "+LEADER" : e.gap}`)
      .join(" | ");
    dynamicItems.push(`🏎️ ${leaderStr}`);
    dynamicItems.push(`🔄 LAP ${lap}/${totalLaps}`);
  }

  const allItems = [...dynamicItems, ...STATIC_TICKER];
  const doubled = [...allItems, ...allItems];

  const badgeLabel = isSimulation ? "◉ SIM" : isLive ? "● LIVE" : "● LIVE";
  const badgeColor = isSimulation ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
    : "bg-red-600/20 text-red-400 border-red-600/30";

  return (
    <div className="w-full bg-[#0d0d14] border-b border-white/5 overflow-hidden py-1.5 select-none flex items-center" style={{ zIndex: 200 }}>
      {/* Status badge */}
      <div className={`flex-shrink-0 px-3 flex items-center gap-1.5 border-r border-white/10 mr-3`}>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${badgeColor}`}>
          {badgeLabel}
        </span>
      </div>

      {/* Scrolling content */}
      <div className="flex-1 overflow-hidden relative">
        <div className="flex gap-10 ticker-track whitespace-nowrap">
          {doubled.map((item, i) => (
            <span key={i} className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest flex-shrink-0">
              {item}
              <span className="mx-5 text-white/20">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const { tier, loading: tierLoading } = useUserTier();
  const pathname = usePathname();

  // Scroll shrink effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch user on path change
  useEffect(() => {
    setIsMenuOpen(false);
    const token = localStorage.getItem("token");
    if (!token) { setUser(null); return; }
    apiFetch("/profile").then(setUser).catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/auth/signin";
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      {/* ── Race Ticker ── */}
      <RaceTicker />

      {/* ── Floating Nav Shell ── */}
      <div className="px-4 pt-2">
        <motion.div
          animate={{
            paddingTop: scrolled ? "8px" : "12px",
            paddingBottom: scrolled ? "8px" : "12px",
          }}
          transition={{ duration: 0.2 }}
          className="max-w-7xl mx-auto glass-card rounded-2xl border border-white/8 px-4 md:px-6"
        >
          <div className="flex justify-between items-center">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <motion.div
                whileHover={{ rotate: 0, scale: 1.1 }}
                initial={{ rotate: -10 }}
                className="bg-[#E10600] p-2 rounded-lg flex items-center justify-center"
                style={{ boxShadow: "0 0 20px rgba(225,6,0,0.6)" }}
              >
                <Zap size={18} fill="white" className="text-white" />
              </motion.div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-[#E10600] font-black text-xl italic tracking-tighter leading-none"
                  style={{ textShadow: "0 0 16px rgba(225,6,0,0.6)" }}>
                  F1
                </span>
                <span className="text-white font-black text-[9px] uppercase tracking-[0.25em] leading-none mt-0.5">
                  PREDICTOR
                </span>
              </div>
            </Link>

            {/* ── Desktop Links ── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 group ${
                      isActive
                        ? "text-white bg-white/8"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      size={13}
                      className={isActive ? "text-[#E10600]" : "group-hover:text-[#E10600] transition-colors"}
                    />
                    {link.name}
                    {isActive && <NavIndicator />}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right: User / CTA ── */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2 pl-3 border-l border-white/10">
                  {/* Info (desktop) */}
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[11px] font-bold text-white truncate max-w-[120px]">
                      {user.email}
                    </span>
                    <span className={`text-[9px] uppercase font-black tracking-widest ${tier === "pro" ? "text-yellow-400" : "text-neutral-500"}`}>
                      {tierLoading ? "…" : tier === "pro" ? "Pro Member" : "Free Tier"}
                    </span>
                  </div>

                  {/* Avatar circle */}
                  <Link href="/profile" className="relative flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white border-2 transition-all hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #E10600, #ff4d4d)",
                        borderColor: tier === "pro" ? "#facc15" : "rgba(255,255,255,0.15)",
                        boxShadow: tier === "pro"
                          ? "0 0 12px rgba(250,204,21,0.4)"
                          : "0 0 8px rgba(225,6,0,0.3)",
                      }}
                    >
                      {getInitials(user.email)}
                    </div>
                    {/* Plan badge */}
                    {!tierLoading && (
                      <span
                        className={`absolute -bottom-1 -right-1 text-[7px] font-black px-1 rounded-full leading-tight ${
                          tier === "pro"
                            ? "bg-yellow-400 text-black"
                            : "bg-neutral-700 text-neutral-300"
                        }`}
                      >
                        {tier === "pro" ? "PRO" : "FREE"}
                      </span>
                    )}
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-400 hover:text-red-400 transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/auth/signin"
                    className="bg-[#E10600] text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#ff1a0e] transition-colors"
                    style={{ boxShadow: "0 0 20px rgba(225,6,0,0.35)" }}
                  >
                    Connect
                  </Link>
                </motion.div>
              )}

              {/* Mobile toggle */}
              <button
                className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X size={22} />
                    </motion.span>
                  ) : (
                    <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu size={22} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Mobile Full-Screen Overlay Menu ── */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-[-1]"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Drawer */}
              <motion.div
                key="drawer"
                initial={{ opacity: 0, y: -12, scaleY: 0.92 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -12, scaleY: 0.92 }}
                style={{ transformOrigin: "top" }}
                className="md:hidden mt-2 max-w-7xl mx-auto glass-card rounded-2xl border border-white/10 p-4 space-y-1 backdrop-blur-2xl"
              >
                {NAV_LINKS.map((link, i) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.045, type: "spring", bounce: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center justify-between p-3.5 rounded-xl font-bold text-sm transition-all ${
                          isActive
                            ? "bg-[#E10600]/15 text-white border border-[#E10600]/30"
                            : "hover:bg-white/5 text-neutral-300 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? "bg-[#E10600]/20" : "bg-white/5"}`}>
                            <link.icon size={15} className={isActive ? "text-[#E10600]" : "text-neutral-400"} />
                          </div>
                          <span className="uppercase tracking-wider text-[11px] font-black">{link.name}</span>
                        </div>
                        <ChevronRight size={14} className={isActive ? "text-[#E10600]" : "text-neutral-600"} />
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile user section */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: NAV_LINKS.length * 0.045 + 0.05 }}
                    className="pt-3 mt-2 border-t border-white/8 flex items-center justify-between px-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white border border-white/20"
                        style={{ background: "linear-gradient(135deg, #E10600, #ff4d4d)" }}
                      >
                        {getInitials(user.email)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-white font-bold truncate max-w-[150px]">{user.email}</span>
                        <span className={`text-[9px] uppercase font-black tracking-widest ${tier === "pro" ? "text-yellow-400" : "text-neutral-500"}`}>
                          {tier === "pro" ? "Pro Member" : "Free Tier"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-red-400 flex items-center gap-1.5 font-black uppercase tracking-wider hover:text-red-300 transition-colors"
                    >
                      <LogOut size={13} /> Logout
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
