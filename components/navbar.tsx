"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUserTier } from "@/hooks/useUserTier";
import { apiFetch } from "@/lib/api";
import {
  Menu, X, Zap, Users, Trophy, Map,
  Cpu, User, LogOut, ChevronRight, BookOpen, Gamepad2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Ticker data ───────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "🏁 ROUND 5 · MIAMI GRAND PRIX · MAY 4",
  "⚡ VER LEADS · GAP +3.241",
  "🛞 LAP 42/57 · NORRIS PITS FOR MEDIUMS",
  "🔴 FASTEST LAP: LECLERC 1:28.114",
  "📡 DRS ENABLED · ZONE 2",
  "🏆 CHAMPIONSHIP: VER 392 · NOR 312 · LEC 284",
  "⛽ FUEL LOAD CRITICAL · HAM BOXES",
  "🌡️ TRACK TEMP 47°C · AIR 29°C",
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

// ── Race Ticker Strip ─────────────────────────────────────────────────────────
function RaceTicker() {
  const double = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop
  return (
    <div
      className="w-full bg-[#E10600] overflow-hidden py-1.5 select-none"
      style={{ zIndex: 200 }}
    >
      <div className="flex gap-12 ticker-track whitespace-nowrap">
        {double.map((item, i) => (
          <span key={i} className="text-white text-[10px] font-black uppercase tracking-widest flex-shrink-0">
            {item}
            <span className="mx-6 opacity-40">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Active indicator ──────────────────────────────────────────────────────────
function NavIndicator() {
  return (
    <motion.span
      layoutId="nav-indicator"
      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E10600] rounded-full"
      style={{ boxShadow: "0 0 8px rgba(225,6,0,0.8)" }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
    />
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
                className="bg-[#E10600] p-2 rounded-lg"
                style={{ boxShadow: "0 0 16px rgba(225,6,0,0.5)" }}
              >
                <Zap size={18} fill="white" className="text-white" />
              </motion.div>
              <span className="font-black italic tracking-tighter text-lg hidden sm:inline">
                F1 <span className="text-[#E10600]" style={{ textShadow: "0 0 12px rgba(225,6,0,0.5)" }}>PREDICTOR</span>
              </span>
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
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
                      isActive
                        ? "text-white bg-white/8"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={13} className={isActive ? "text-[#E10600]" : ""} />
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
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[11px] font-bold text-white truncate max-w-[120px]">{user.email}</span>
                    <span className={`text-[9px] uppercase font-black tracking-widest ${tier === "pro" ? "text-yellow-400" : "text-neutral-500"}`}>
                      {tierLoading ? "…" : tier === "pro" ? "Pro Member" : "Free Tier"}
                    </span>
                  </div>
                  <Link href="/profile" className="p-2 hover:bg-white/8 rounded-xl transition-colors">
                    <User size={16} className="text-neutral-300" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-400 hover:text-red-400 transition-colors"
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

        {/* ── Mobile Drawer ── */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
              style={{ transformOrigin: "top" }}
              className="md:hidden mt-2 max-w-7xl mx-auto glass-card rounded-2xl border border-white/8 p-3 space-y-1"
            >
              {NAV_LINKS.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center justify-between p-3 rounded-xl font-bold text-sm transition-all ${
                        isActive
                          ? "bg-[#E10600]/10 text-white border border-[#E10600]/20"
                          : "hover:bg-white/5 text-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <link.icon size={16} className={isActive ? "text-[#E10600]" : "text-neutral-500"} />
                        {link.name}
                      </div>
                      <ChevronRight size={14} className="text-neutral-600" />
                    </Link>
                  </motion.div>
                );
              })}

              {/* Mobile user section */}
              {user && (
                <div className="pt-2 mt-2 border-t border-white/8 flex items-center justify-between px-3">
                  <span className="text-xs text-neutral-400">{user.email}</span>
                  <button onClick={handleLogout} className="text-xs text-red-400 flex items-center gap-1 font-bold">
                    <LogOut size={12} /> Logout
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
