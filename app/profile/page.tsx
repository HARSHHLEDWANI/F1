"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  CheckCircle2,
  Flame,
  Zap,
  Trophy,
  Target,
  Star,
  Flag,
  Lock,
  Power,
  ChevronDown,
  ChevronUp,
  X,
  Edit3,
  Car,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  id: number;
  email: string;
  is_pro: boolean;
  plan: "FREE" | "PRO";
  predictions_today: number;
  favorite_team?: string;
  favorite_driver?: string;
}

interface PredictionHistoryItem {
  race_name: string;
  season: number;
  round: number;
  predicted_p1: string;
  predicted_p2: string;
  predicted_p3: string;
  score?: number;
  created_at?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TEAM_COLORS: Record<string, string> = {
  "Red Bull": "#3671C6",
  Ferrari: "#E10600",
  Mercedes: "#27F4D2",
  McLaren: "#FF8000",
  "Aston Martin": "#229971",
  Alpine: "#FF87BC",
  Williams: "#64C4FF",
  "RB F1": "#6692FF",
  "Kick Sauber": "#52E252",
  Haas: "#B6BABD",
};

const DRIVER_TEAMS: Record<string, string> = {
  VER: "Red Bull",
  PER: "Red Bull",
  LEC: "Ferrari",
  SAI: "Ferrari",
  HAM: "Mercedes",
  RUS: "Mercedes",
  NOR: "McLaren",
  PIA: "McLaren",
  ALO: "Aston Martin",
  STR: "Aston Martin",
  GAS: "Alpine",
  OCO: "Alpine",
  ALB: "Williams",
  SAR: "Williams",
  RIC: "RB F1",
  TSU: "RB F1",
  BOT: "Kick Sauber",
  ZHO: "Kick Sauber",
  HUL: "Haas",
  MAG: "Haas",
};

const ALL_DRIVERS = Object.keys(DRIVER_TEAMS);
const ALL_TEAMS = Object.keys(TEAM_COLORS);

// ─── Utility helpers ─────────────────────────────────────────────────────────

function getInitials(email: string): string {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getPilotRank(accuracy: number): { label: string; color: string } {
  if (accuracy >= 80) return { label: "PLATINUM", color: "#E5E4E2" };
  if (accuracy >= 60) return { label: "GOLD", color: "#FFD700" };
  if (accuracy >= 40) return { label: "SILVER", color: "#C0C0C0" };
  return { label: "BRONZE", color: "#CD7F32" };
}

function computeStats(history: PredictionHistoryItem[]) {
  const total = history.length;
  const totalScore = history.reduce((s, h) => s + (h.score ?? 0), 0);
  const perfect = history.filter((h) => (h.score ?? 0) >= 3).length;
  const accuracy = total > 0 ? Math.round((perfect / total) * 100) : 0;

  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if ((history[i].score ?? 0) > 0) streak++;
    else break;
  }

  return { total, totalScore, perfect, accuracy, streak };
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Animated counter
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
}

// Accuracy ring SVG
function AccuracyRing({ value }: { value: number }) {
  const [animated, setAnimated] = useState(0);
  const radius = 48;
  const circ = 2 * Math.PI * radius;

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 1400;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimated(Math.round(ease * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const offset = circ - (animated / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="absolute -rotate-90" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="#1a1a2e" strokeWidth="10" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="#E10600"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <span className="relative text-2xl font-black text-white">
        {animated}%
      </span>
    </div>
  );
}

// Skeleton loader
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded animate-pulse bg-[#12121c] ${className ?? ""}`}
      style={{ background: "linear-gradient(90deg,#12121c 25%,#1c1c2e 50%,#12121c 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }}
    />
  );
}

// Stat card
function StatCard({
  icon,
  title,
  value,
  sub,
  accent,
  delay,
  ring,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  sub?: string;
  accent: string;
  delay: number;
  ring?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl border p-6 flex flex-col gap-3"
      style={{
        background: "#0b0b12",
        borderColor: accent + "44",
        boxShadow: `0 0 24px ${accent}18`,
      }}
    >
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${accent}, transparent 70%)`,
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono tracking-widest uppercase" style={{ color: accent }}>
          {title}
        </span>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      {ring ? (
        <AccuracyRing value={value} />
      ) : (
        <span className="text-4xl font-black text-white font-mono">
          <AnimatedNumber value={value} />
        </span>
      )}
      {sub && <span className="text-xs text-zinc-500 font-mono">{sub}</span>}
    </motion.div>
  );
}

// Achievement badge
interface Badge {
  id: string;
  icon: string;
  label: string;
  desc: string;
  unlocked: boolean;
}

function BadgeTile({ badge, delay }: { badge: Badge; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay }}
      className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border text-center"
      style={{
        background: badge.unlocked ? "#0f0f1a" : "#090910",
        borderColor: badge.unlocked ? "#E10600aa" : "#2a2a3a",
        filter: badge.unlocked ? "none" : "grayscale(1) opacity(0.45)",
      }}
    >
      <span className="text-3xl">{badge.icon}</span>
      <span className="text-xs font-bold text-white tracking-wide">{badge.label}</span>
      <span className="text-[10px] text-zinc-500">{badge.desc}</span>
      {!badge.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
          <Lock size={16} className="text-zinc-600" />
        </div>
      )}
    </motion.div>
  );
}

// Score indicator
function ScoreIndicator({ score }: { score?: number }) {
  if (score === undefined || score === null)
    return <span className="text-zinc-600 font-mono text-sm">—</span>;
  if (score >= 3)
    return <span className="text-green-400 font-mono text-sm font-bold">✓ {score}pts</span>;
  if (score >= 1)
    return <span className="text-yellow-400 font-mono text-sm font-bold">~ {score}pt</span>;
  return <span className="text-red-500 font-mono text-sm font-bold">✗ 0pts</span>;
}

// Garage card
function GarageCard({
  type,
  value,
  onEdit,
}: {
  type: "driver" | "team";
  value?: string;
  onEdit: () => void;
}) {
  const isDriver = type === "driver";
  const teamColor =
    isDriver && value
      ? TEAM_COLORS[DRIVER_TEAMS[value]] ?? "#E10600"
      : value
      ? TEAM_COLORS[value] ?? "#E10600"
      : "#E10600";

  return (
    <motion.div
      initial={{ opacity: 0, x: isDriver ? -24 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl border p-6 flex flex-col gap-4 cursor-pointer group"
      style={{
        background: "#0b0b12",
        borderColor: teamColor + "66",
        boxShadow: `0 0 32px ${teamColor}18`,
      }}
      onClick={onEdit}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: teamColor }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono tracking-widest uppercase text-zinc-400">
          {isDriver ? "Favourite Driver" : "Favourite Constructor"}
        </span>
        <span className="text-zinc-500 group-hover:text-white transition-colors">
          {isDriver ? <Car size={16} /> : <Users size={16} />}
        </span>
      </div>
      {value ? (
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg font-mono"
            style={{ background: teamColor + "33", border: `2px solid ${teamColor}` }}
          >
            {isDriver ? value : value.slice(0, 3).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold text-xl">{value}</p>
            {isDriver && (
              <p className="text-xs font-mono" style={{ color: teamColor }}>
                {DRIVER_TEAMS[value] ?? ""}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-zinc-600 text-sm font-mono italic">Not set — tap to choose</p>
      )}
      <div className="flex items-center gap-1 text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors mt-auto">
        <Edit3 size={11} />
        <span>Click to change</span>
      </div>
    </motion.div>
  );
}

// Picker modal
function PickerModal({
  type,
  current,
  onSelect,
  onClose,
}: {
  type: "driver" | "team";
  current?: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  const list = type === "driver" ? ALL_DRIVERS : ALL_TEAMS;
  const [search, setSearch] = useState("");
  const filtered = list.filter((v) => v.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-md rounded-2xl border border-zinc-700 overflow-hidden"
        style={{ background: "#0d0d16" }}
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <span className="text-white font-bold text-lg tracking-wide">
            {type === "driver" ? "SELECT DRIVER" : "SELECT CONSTRUCTOR"}
          </span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={type === "driver" ? "Search driver code…" : "Search team…"}
            className="w-full rounded-lg px-4 py-2 text-sm font-mono text-white placeholder-zinc-600 outline-none border border-zinc-700 focus:border-red-600 transition-colors"
            style={{ background: "#12121e" }}
          />
        </div>
        <div className="max-h-72 overflow-y-auto px-4 pb-4 grid grid-cols-2 gap-2">
          {filtered.map((v) => {
            const color =
              type === "driver"
                ? TEAM_COLORS[DRIVER_TEAMS[v]] ?? "#E10600"
                : TEAM_COLORS[v] ?? "#E10600";
            const isSelected = v === current;
            return (
              <button
                key={v}
                onClick={() => { onSelect(v); onClose(); }}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-all"
                style={{
                  background: isSelected ? color + "22" : "#12121e",
                  border: `1px solid ${isSelected ? color : "#2a2a3a"}`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black font-mono text-white shrink-0"
                  style={{ background: color + "44", border: `1.5px solid ${color}` }}
                >
                  {type === "driver" ? v : v.slice(0, 3).toUpperCase()}
                </div>
                <span className="text-white text-xs font-mono truncate">{v}</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Loading skeleton layout ──────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#050508] px-4 py-8">
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-44 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Garage picker state
  const [pickerOpen, setPickerOpen] = useState<"driver" | "team" | null>(null);
  const [favoriteDriver, setFavoriteDriver] = useState<string | undefined>();
  const [favoriteTeam, setFavoriteTeam] = useState<string | undefined>();
  const [, setSavingPref] = useState(false);

  // Settings accordion
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // ── Fetch data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/auth/signin"); return; }

    const fetchAll = async () => {
      try {
        const [profileData, historyData] = await Promise.all([
          apiFetch("/profile"),
          apiFetch("/prediction-history").catch(() => []),
        ]);
        setUser(profileData);
        setFavoriteDriver(profileData.favorite_driver);
        setFavoriteTeam(profileData.favorite_team);
        setHistory(Array.isArray(historyData) ? historyData : []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [router]);

  const handleSavePref = async (type: "driver" | "team", value: string) => {
    if (type === "driver") setFavoriteDriver(value);
    else setFavoriteTeam(value);

    setSavingPref(true);
    try {
      const updated = await apiFetch("/update-preferences", {
        method: "PUT",
        body: JSON.stringify({
          favorite_driver: type === "driver" ? value : favoriteDriver,
          favorite_team: type === "team" ? value : favoriteTeam,
        }),
      });
      if (user) {
        setUser({
          ...user,
          favorite_driver: updated?.favorite_driver ?? (type === "driver" ? value : favoriteDriver),
          favorite_team: updated?.favorite_team ?? (type === "team" ? value : favoriteTeam),
        });
      }
    } catch {
      // optimistic update already applied
    } finally {
      setSavingPref(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  // ── Derived stats
  const stats = computeStats(history);
  const rank = getPilotRank(stats.accuracy);
  const initials = user ? getInitials(user.email) : "F1";
  const joinYear = 2025; // default since API doesn't return it

  // ── Achievement badges
  const badges: Badge[] = [
    {
      id: "first",
      icon: "🏆",
      label: "First Prediction",
      desc: "Make your first prediction",
      unlocked: stats.total >= 1,
    },
    {
      id: "perfect",
      icon: "🎯",
      label: "Perfect Podium",
      desc: "Predict all 3 positions correctly",
      unlocked: history.some((h) => (h.score ?? 0) >= 3),
    },
    {
      id: "onfire",
      icon: "🔥",
      label: "On Fire",
      desc: "3 correct predictions in a row",
      unlocked: stats.streak >= 3,
    },
    {
      id: "qualifier",
      icon: "⚡",
      label: "Qualifier",
      desc: "Make 10 predictions",
      unlocked: stats.total >= 10,
    },
    {
      id: "champion",
      icon: "🌟",
      label: "Champion",
      desc: "50%+ accuracy over 10+ predictions",
      unlocked: stats.total >= 10 && stats.accuracy >= 50,
    },
    {
      id: "raceready",
      icon: "🏎️",
      label: "Race Ready",
      desc: "Visit all sections",
      unlocked: false,
    },
  ];

  // ── Render
  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center gap-4">
        <Flag size={40} className="text-red-600" />
        <p className="text-white font-bold text-xl">Connection Error</p>
        <p className="text-zinc-500 text-sm">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
          className="mt-4 px-6 py-2 rounded-full bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 16px 4px #E1060066, 0 0 40px 8px #E1060022; }
          50% { box-shadow: 0 0 24px 8px #E10600aa, 0 0 60px 16px #E1060044; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>

      {/* Ambient scanline */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)",
          backgroundSize: "100% 4px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ── DRIVER PROFILE BANNER ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-zinc-800 p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10"
          style={{
            background: "linear-gradient(135deg, #0d0d14 0%, #110a0a 60%, #0a0a0f 100%)",
            backgroundImage:
              "linear-gradient(135deg, #0d0d14 0%, #110a0a 60%, #0a0a0f 100%), repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(225,6,0,0.02) 20px, rgba(225,6,0,0.02) 40px)",
          }}
        >
          {/* Carbon fiber texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(255,255,255,0.01) 1px,rgba(255,255,255,0.01) 2px),repeating-linear-gradient(90deg,transparent,transparent 1px,rgba(255,255,255,0.01) 1px,rgba(255,255,255,0.01) 2px)",
              backgroundSize: "4px 4px",
            }}
          />
          {/* Red stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-linear-to-r from-transparent via-red-600 to-transparent" />

          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-3xl md:text-4xl font-black font-mono text-white"
              style={{
                background: "linear-gradient(135deg, #1a0a0a, #2a0808)",
                animation: "neonPulse 3s ease-in-out infinite",
                border: "3px solid #E10600",
              }}
            >
              {initials}
            </div>
            {user?.plan === "PRO" && (
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-black text-xs font-black border-2 border-[#050508]">
                ★
              </div>
            )}
          </div>

          {/* Center info */}
          <div className="flex-1 flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <h1
              className="text-3xl md:text-5xl font-black italic tracking-tight text-white"
              style={{ textShadow: "0 0 32px rgba(225,6,0,0.4)" }}
            >
              {user?.email?.split("@")[0].toUpperCase() ?? "PILOT"}
            </h1>
            <p className="text-zinc-500 text-sm font-mono">{user?.email}</p>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {/* Pilot rank badge */}
              <span
                className="px-3 py-1 rounded-full text-xs font-black tracking-widest border font-mono"
                style={{
                  color: rank.color,
                  borderColor: rank.color + "66",
                  background: rank.color + "11",
                  textShadow: `0 0 8px ${rank.color}88`,
                }}
              >
                PILOT RANK: {rank.label}
              </span>

              {/* Plan badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-black tracking-widest border font-mono ${
                  user?.plan === "PRO"
                    ? "text-yellow-400 border-yellow-600 bg-yellow-900/20"
                    : "text-zinc-400 border-zinc-600 bg-zinc-900/40"
                }`}
              >
                {user?.plan ?? "FREE"} PLAN
              </span>

              {/* Member since */}
              <span className="text-zinc-600 text-xs font-mono">
                SINCE {joinYear}
              </span>
            </div>
          </div>

          {/* Accuracy speed display */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
              Overall Accuracy
            </span>
            <span
              className="text-6xl md:text-8xl font-black font-mono leading-none"
              style={{
                color: "#E10600",
                textShadow: "0 0 48px rgba(225,6,0,0.6), 0 0 80px rgba(225,6,0,0.3)",
              }}
            >
              <AnimatedNumber value={stats.accuracy} />
              <span className="text-3xl md:text-4xl text-zinc-400">%</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-600 tracking-widest">PREDICTION RATE</span>
          </div>
        </motion.div>

        {/* ── STATS GRID ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<BarChart2 size={18} />}
            title="Predictions Made"
            value={stats.total}
            sub="total races predicted"
            accent="#3b82f6"
            delay={0.1}
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            title="Correct Predictions"
            value={stats.perfect}
            sub="perfect podiums"
            accent="#22c55e"
            delay={0.2}
          />
          <StatCard
            icon={<Target size={18} />}
            title="Accuracy"
            value={stats.accuracy}
            sub="% prediction rate"
            accent="#E10600"
            delay={0.3}
            ring
          />
          <StatCard
            icon={
              stats.streak > 3 ? (
                <Flame size={18} className="text-orange-400" />
              ) : (
                <Zap size={18} />
              )
            }
            title={stats.streak > 3 ? "🔥 Streak" : "Current Streak"}
            value={stats.streak}
            sub="consecutive correct"
            accent={stats.streak > 3 ? "#f97316" : "#a855f7"}
            delay={0.4}
          />
        </div>

        {/* ── MY GARAGE ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader icon={<Car size={16} />} label="MY GARAGE" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GarageCard
              type="driver"
              value={favoriteDriver}
              onEdit={() => setPickerOpen("driver")}
            />
            <GarageCard
              type="team"
              value={favoriteTeam}
              onEdit={() => setPickerOpen("team")}
            />
          </div>
        </motion.div>

        {/* ── RACE TELEMETRY ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <SectionHeader icon={<Flag size={16} />} label="RACE TELEMETRY" sub="Prediction History" />
          <div
            className="rounded-2xl border border-zinc-800 overflow-hidden"
            style={{ background: "#0b0b12" }}
          >
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-600">
                <Flag size={36} className="opacity-30" />
                <p className="font-mono text-sm">No predictions yet — make your first prediction!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-mono tracking-widest">
                      <th className="text-left px-4 py-3">RACE</th>
                      <th className="text-center px-3 py-3">SEASON</th>
                      <th className="text-center px-3 py-3">PRED P1</th>
                      <th className="text-center px-3 py-3">PRED P2</th>
                      <th className="text-center px-3 py-3">PRED P3</th>
                      <th className="text-center px-3 py-3">SCORE</th>
                      <th className="text-right px-4 py-3">DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, i) => (
                      <motion.tr
                        key={`${item.season}-${item.round}-${i}`}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="border-b border-zinc-900 hover:bg-zinc-900/40 transition-colors"
                        style={{
                          borderLeft:
                            (item.score ?? 0) >= 3
                              ? "3px solid #22c55e"
                              : (item.score ?? 0) >= 1
                              ? "3px solid #eab308"
                              : item.score === 0
                              ? "3px solid #ef4444"
                              : "3px solid transparent",
                        }}
                      >
                        <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                          {item.race_name}
                        </td>
                        <td className="px-3 py-3 text-center text-zinc-500 font-mono">
                          {item.season}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <DriverChip code={item.predicted_p1} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <DriverChip code={item.predicted_p2} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <DriverChip code={item.predicted_p3} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <ScoreIndicator score={item.score} />
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-500 font-mono text-xs whitespace-nowrap">
                          {formatDate(item.created_at)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── TROPHIES CABINET ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <SectionHeader icon={<Trophy size={16} />} label="TROPHIES CABINET" sub="Achievements" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {badges.map((badge, i) => (
              <BadgeTile key={badge.id} badge={badge} delay={0.05 * i + 0.4} />
            ))}
          </div>
        </motion.div>

        {/* ── ACCOUNT SETTINGS ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl border border-zinc-800 hover:border-zinc-600 transition-colors"
            style={{ background: "#0b0b12" }}
          >
            <div className="flex items-center gap-3">
              <Star size={16} className="text-zinc-400" />
              <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
                Account Settings
              </span>
            </div>
            {settingsOpen ? (
              <ChevronUp size={16} className="text-zinc-500" />
            ) : (
              <ChevronDown size={16} className="text-zinc-500" />
            )}
          </button>

          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-2 rounded-2xl border border-zinc-800 p-6 space-y-5"
                  style={{ background: "#0b0b12" }}
                >
                  {/* Display name */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
                      Display Name
                    </label>
                    <div className="flex gap-3">
                      <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={user?.email?.split("@")[0] ?? "Enter display name"}
                        className="flex-1 rounded-xl px-4 py-2 text-sm font-mono text-white placeholder-zinc-600 outline-none border border-zinc-700 focus:border-red-600 transition-colors"
                        style={{ background: "#12121e" }}
                      />
                      <button
                        disabled={savingName || !displayName.trim()}
                        onClick={async () => {
                          setSavingName(true);
                          try {
                            await apiFetch("/update-preferences", {
                              method: "PUT",
                              body: JSON.stringify({ display_name: displayName }),
                            });
                          } catch { /* no-op */ } finally {
                            setSavingName(false);
                          }
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {savingName ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>

                  {/* Upgrade to Pro */}
                  {user?.plan !== "PRO" && (
                    <div className="flex items-center justify-between p-4 rounded-xl border border-yellow-900/50 bg-yellow-900/10">
                      <div>
                        <p className="text-yellow-400 font-bold text-sm">Upgrade to PRO</p>
                        <p className="text-zinc-500 text-xs font-mono mt-0.5">
                          Unlimited predictions, advanced analytics &amp; more
                        </p>
                      </div>
                      <button className="px-4 py-2 rounded-xl text-sm font-black text-black bg-yellow-400 hover:bg-yellow-300 transition-colors">
                        UPGRADE ★
                      </button>
                    </div>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-red-900 text-red-500 font-bold text-sm hover:bg-red-900/20 transition-colors"
                  >
                    <Power size={16} />
                    LOGOUT
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── GARAGE PICKER MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {pickerOpen && (
          <PickerModal
            type={pickerOpen}
            current={pickerOpen === "driver" ? favoriteDriver : favoriteTeam}
            onSelect={(v) => handleSavePref(pickerOpen, v)}
            onClose={() => setPickerOpen(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tiny shared components ───────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-red-900/30 border border-red-900/50 flex items-center justify-center text-red-500">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-black tracking-widest text-white font-mono">{label}</h2>
        {sub && <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">{sub}</p>}
      </div>
      <div className="flex-1 h-px bg-linear-to-r from-red-900/30 to-transparent ml-2" />
    </div>
  );
}

function DriverChip({ code }: { code: string }) {
  const team = DRIVER_TEAMS[code];
  const color = team ? TEAM_COLORS[team] ?? "#E10600" : "#555";
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[11px] font-black font-mono"
      style={{ background: color + "22", color, border: `1px solid ${color}44` }}
    >
      {code}
    </span>
  );
}
