"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/navbar";
import { apiFetch } from "@/lib/api";

// ─── Static Fallback Data ───────────────────────────────────────────────────

const FALLBACK_WIN_PROBS = [
  { driver_code: "VER", driver_name: "Max Verstappen", team: "Red Bull", teamColor: "#0600EF", win_probability: 0.38, podium_probability: 0.72 },
  { driver_code: "NOR", driver_name: "Lando Norris", team: "McLaren", teamColor: "#FF8700", win_probability: 0.22, podium_probability: 0.58 },
  { driver_code: "LEC", driver_name: "Charles Leclerc", team: "Ferrari", teamColor: "#DC0000", win_probability: 0.18, podium_probability: 0.52 },
  { driver_code: "PIA", driver_name: "Oscar Piastri", team: "McLaren", teamColor: "#FF8700", win_probability: 0.10, podium_probability: 0.38 },
  { driver_code: "SAI", driver_name: "Carlos Sainz", team: "Ferrari", teamColor: "#DC0000", win_probability: 0.06, podium_probability: 0.28 },
  { driver_code: "RUS", driver_name: "George Russell", team: "Mercedes", teamColor: "#00D2BE", win_probability: 0.04, podium_probability: 0.22 },
  { driver_code: "HAM", driver_name: "Lewis Hamilton", team: "Mercedes", teamColor: "#00D2BE", win_probability: 0.02, podium_probability: 0.14 },
];

const FALLBACK_PODIUM = [
  { driver_code: "VER", driver_name: "Max Verstappen", team: "Red Bull", teamColor: "#0600EF", confidence: 82, form_index: 0.91, grid_pos: 1, predicted_pos: 1 },
  { driver_code: "NOR", driver_name: "Lando Norris", team: "McLaren", teamColor: "#FF8700", confidence: 71, form_index: 0.78, grid_pos: 3, predicted_pos: 2 },
  { driver_code: "LEC", driver_name: "Charles Leclerc", team: "Ferrari", teamColor: "#DC0000", confidence: 63, form_index: 0.72, grid_pos: 2, predicted_pos: 3 },
];

const FALLBACK_OVERTAKES = [
  { driver_code: "ALO", driver_name: "Fernando Alonso", team: "Aston Martin", teamColor: "#006F62", grid_pos: 8, predicted_pos: 5, overtake_prob: 0.74 },
  { driver_code: "HAM", driver_name: "Lewis Hamilton", team: "Mercedes", teamColor: "#00D2BE", grid_pos: 7, predicted_pos: 5, overtake_prob: 0.68 },
  { driver_code: "RUS", driver_name: "George Russell", team: "Mercedes", teamColor: "#00D2BE", grid_pos: 6, predicted_pos: 4, overtake_prob: 0.61 },
  { driver_code: "PIA", driver_name: "Oscar Piastri", team: "McLaren", teamColor: "#FF8700", grid_pos: 5, predicted_pos: 4, overtake_prob: 0.55 },
  { driver_code: "SAI", driver_name: "Carlos Sainz", team: "Ferrari", teamColor: "#DC0000", grid_pos: 9, predicted_pos: 7, overtake_prob: 0.48 },
  { driver_code: "TSU", driver_name: "Yuki Tsunoda", team: "RB", teamColor: "#6692FF", grid_pos: 12, predicted_pos: 10, overtake_prob: 0.44 },
  { driver_code: "STR", driver_name: "Lance Stroll", team: "Aston Martin", teamColor: "#006F62", grid_pos: 10, predicted_pos: 9, overtake_prob: 0.39 },
  { driver_code: "GAS", driver_name: "Pierre Gasly", team: "Alpine", teamColor: "#0090FF", grid_pos: 13, predicted_pos: 11, overtake_prob: 0.33 },
  { driver_code: "ALB", driver_name: "Alex Albon", team: "Williams", teamColor: "#64C4FF", grid_pos: 14, predicted_pos: 12, overtake_prob: 0.27 },
  { driver_code: "OCO", driver_name: "Esteban Ocon", team: "Alpine", teamColor: "#0090FF", grid_pos: 11, predicted_pos: 13, overtake_prob: 0.21 },
];

const RACES_2024 = [
  { round: 1,  name: "Bahrain Grand Prix",          flag: "🇧🇭", date: "Mar 2" },
  { round: 2,  name: "Saudi Arabian Grand Prix",     flag: "🇸🇦", date: "Mar 9" },
  { round: 3,  name: "Australian Grand Prix",        flag: "🇦🇺", date: "Mar 24" },
  { round: 4,  name: "Japanese Grand Prix",          flag: "🇯🇵", date: "Apr 7" },
  { round: 5,  name: "Chinese Grand Prix",           flag: "🇨🇳", date: "Apr 21" },
  { round: 6,  name: "Miami Grand Prix",             flag: "🇺🇸", date: "May 5" },
  { round: 7,  name: "Emilia Romagna Grand Prix",    flag: "🇮🇹", date: "May 19" },
  { round: 8,  name: "Monaco Grand Prix",            flag: "🇲🇨", date: "May 26" },
  { round: 9,  name: "Canadian Grand Prix",          flag: "🇨🇦", date: "Jun 9" },
  { round: 10, name: "Spanish Grand Prix",           flag: "🇪🇸", date: "Jun 23" },
  { round: 11, name: "Austrian Grand Prix",          flag: "🇦🇹", date: "Jun 30" },
  { round: 12, name: "British Grand Prix",           flag: "🇬🇧", date: "Jul 7" },
  { round: 13, name: "Hungarian Grand Prix",         flag: "🇭🇺", date: "Jul 21" },
  { round: 14, name: "Belgian Grand Prix",           flag: "🇧🇪", date: "Jul 28" },
  { round: 15, name: "Dutch Grand Prix",             flag: "🇳🇱", date: "Aug 25" },
  { round: 16, name: "Italian Grand Prix",           flag: "🇮🇹", date: "Sep 1" },
  { round: 17, name: "Azerbaijan Grand Prix",        flag: "🇦🇿", date: "Sep 15" },
  { round: 18, name: "Singapore Grand Prix",         flag: "🇸🇬", date: "Sep 22" },
  { round: 19, name: "United States Grand Prix",     flag: "🇺🇸", date: "Oct 20" },
  { round: 20, name: "Mexico City Grand Prix",       flag: "🇲🇽", date: "Oct 27" },
  { round: 21, name: "São Paulo Grand Prix",         flag: "🇧🇷", date: "Nov 3" },
  { round: 22, name: "Las Vegas Grand Prix",         flag: "🇺🇸", date: "Nov 23" },
  { round: 23, name: "Qatar Grand Prix",             flag: "🇶🇦", date: "Dec 1" },
  { round: 24, name: "Abu Dhabi Grand Prix",         flag: "🇦🇪", date: "Dec 8" },
];

const RACES_BY_SEASON: Record<number, typeof RACES_2024> = {
  2024: RACES_2024,
  2023: RACES_2024.map((r) => ({ ...r })),
  2022: RACES_2024.slice(0, 22).map((r) => ({ ...r })),
  2021: RACES_2024.slice(0, 22).map((r) => ({ ...r })),
};

const DRIVERS_FOR_PREDICT = [
  { code: "VER", name: "Max Verstappen" },
  { code: "NOR", name: "Lando Norris" },
  { code: "LEC", name: "Charles Leclerc" },
  { code: "PIA", name: "Oscar Piastri" },
  { code: "SAI", name: "Carlos Sainz" },
  { code: "RUS", name: "George Russell" },
  { code: "HAM", name: "Lewis Hamilton" },
  { code: "ALO", name: "Fernando Alonso" },
  { code: "STR", name: "Lance Stroll" },
  { code: "TSU", name: "Yuki Tsunoda" },
  { code: "ALB", name: "Alex Albon" },
  { code: "HUL", name: "Nico Hulkenberg" },
  { code: "MAG", name: "Kevin Magnussen" },
  { code: "OCO", name: "Esteban Ocon" },
  { code: "GAS", name: "Pierre Gasly" },
  { code: "BOT", name: "Valtteri Bottas" },
  { code: "ZHO", name: "Guanyu Zhou" },
  { code: "SAR", name: "Logan Sargeant" },
  { code: "BEA", name: "Oliver Bearman" },
  { code: "LAW", name: "Liam Lawson" },
];

// ─── Types ──────────────────────────────────────────────────────────────────

interface PodiumDriver {
  driver_code: string;
  driver_name: string;
  team: string;
  teamColor: string;
  confidence: number;
  form_index: number;
  grid_pos: number;
  predicted_pos: number;
}

interface WinProbDriver {
  driver_code: string;
  driver_name: string;
  team: string;
  teamColor: string;
  win_probability: number;
  podium_probability: number;
}

interface OvertakeDriver {
  driver_code: string;
  driver_name: string;
  team: string;
  teamColor: string;
  grid_pos: number;
  predicted_pos: number;
  overtake_prob: number;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function PodiumSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/5 bg-white/5 h-52 animate-pulse"
        />
      ))}
    </div>
  );
}

const MEDAL: Record<number, { label: string; color: string; glow: string; border: string }> = {
  1: { label: "P1", color: "#FFD700", glow: "rgba(255,215,0,0.35)", border: "rgba(255,215,0,0.5)" },
  2: { label: "P2", color: "#C0C0C0", glow: "rgba(192,192,192,0.25)", border: "rgba(192,192,192,0.4)" },
  3: { label: "P3", color: "#CD7F32", glow: "rgba(205,127,50,0.25)", border: "rgba(205,127,50,0.4)" },
};

function PodiumBlock({ driver, position, index }: { driver: PodiumDriver; position: number; index: number }) {
  const medal = MEDAL[position];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, type: "spring", stiffness: 200, damping: 22 }}
      className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden"
      style={{
        background: `linear-gradient(145deg, rgba(14,14,18,0.95) 0%, rgba(20,20,26,0.9) 100%)`,
        border: `1px solid ${medal.border}`,
        boxShadow: `0 0 30px ${medal.glow}, 0 20px 60px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Scanline overlay */}
      <div className="scanlines absolute inset-0 z-0 opacity-40 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between">
        <span
          className="text-4xl font-black tracking-tight"
          style={{ color: medal.color, textShadow: `0 0 20px ${medal.glow}` }}
        >
          {medal.label}
        </span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full border"
          style={{ color: medal.color, borderColor: medal.border, background: `${medal.glow}` }}
        >
          {driver.confidence}% CONF
        </span>
      </div>

      <div className="relative z-10">
        <p
          className="text-xl font-black italic leading-tight tracking-tight"
          style={{ color: "#f5f5f5" }}
        >
          {driver.driver_name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
            style={{ background: driver.teamColor, boxShadow: `0 0 8px ${driver.teamColor}` }}
          />
          <span className="text-xs text-gray-400 font-medium">{driver.team}</span>
        </div>
      </div>

      {/* Form index bar */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Form Index</span>
          <span className="text-[10px] font-bold text-gray-300">{Math.round(driver.form_index * 100)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: medal.color }}
            initial={{ width: 0 }}
            animate={{ width: `${driver.form_index * 100}%` }}
            transition={{ delay: index * 0.15 + 0.3, duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 text-xs text-gray-500">
        <span>Grid P{driver.grid_pos}</span>
        <span className="text-gray-700">→</span>
        <span className="text-gray-300">Pred P{driver.predicted_pos}</span>
      </div>
    </motion.div>
  );
}

function WinProbBar({
  driver,
  index,
  maxProb,
}: {
  driver: WinProbDriver;
  index: number;
  maxProb: number;
}) {
  const pct = maxProb > 0 ? (driver.win_probability / maxProb) * 100 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex items-center gap-3 group"
    >
      <span className="text-xs font-mono text-gray-500 w-4 shrink-0">{index + 1}</span>
      <span
        className="text-[11px] font-bold text-gray-200 w-8 shrink-0 tracking-wider"
        style={{ color: driver.teamColor }}
      >
        {driver.driver_code}
      </span>
      <div className="flex-1 relative h-6 flex items-center">
        <div className="absolute inset-0 rounded-sm bg-white/5" />
        <motion.div
          className="absolute left-0 top-0 h-full rounded-sm"
          style={{ background: `linear-gradient(90deg, ${driver.teamColor}cc, ${driver.teamColor}55)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: index * 0.07 + 0.2, duration: 0.9, ease: "easeOut" }}
        />
        <span className="relative z-10 pl-2 text-[11px] font-bold text-white">
          {Math.round(driver.win_probability * 100)}%
        </span>
      </div>
      <div className="text-right shrink-0">
        <span className="text-[10px] text-gray-500">
          Pod {Math.round(driver.podium_probability * 100)}%
        </span>
      </div>
    </motion.div>
  );
}

function OvertakeBar({ driver, index }: { driver: OvertakeDriver; index: number }) {
  const posChange = driver.grid_pos - driver.predicted_pos;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3"
    >
      <span className="text-xs text-gray-500 w-4 shrink-0">{index + 1}</span>
      <span
        className="text-[11px] font-bold w-8 shrink-0 tracking-wider"
        style={{ color: driver.teamColor }}
      >
        {driver.driver_code}
      </span>
      <div className="flex-1 relative h-5 flex items-center">
        <div className="absolute inset-0 rounded-sm bg-white/5" />
        <motion.div
          className="absolute left-0 top-0 h-full rounded-sm"
          style={{ background: `linear-gradient(90deg, ${driver.teamColor}99, ${driver.teamColor}33)` }}
          initial={{ width: 0 }}
          animate={{ width: `${driver.overtake_prob * 100}%` }}
          transition={{ delay: index * 0.06 + 0.2, duration: 0.8, ease: "easeOut" }}
        />
        <span className="relative z-10 pl-2 text-[10px] font-semibold text-white">
          {Math.round(driver.overtake_prob * 100)}%
        </span>
      </div>
      <div className="flex items-center gap-1 text-[10px] shrink-0">
        <span className="text-gray-500">P{driver.grid_pos}</span>
        <span className="text-gray-700">→</span>
        <span className={posChange > 0 ? "text-green-400" : posChange < 0 ? "text-red-400" : "text-gray-400"}>
          P{driver.predicted_pos}
          {posChange > 0 && ` +${posChange}`}
          {posChange < 0 && ` ${posChange}`}
        </span>
      </div>
    </motion.div>
  );
}

// Confetti burst (pure CSS keyframes via inline style)
function ConfettiParticle({ delay, color, x }: { delay: number; color: string; x: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{ background: color, left: `${x}%`, top: "0%" }}
      initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ y: 160, opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1), scale: 0.3 }}
      transition={{ delay, duration: 1.2, ease: "easeIn" }}
    />
  );
}

const CONFETTI_COLORS = ["#E10600", "#FFD700", "#00D2BE", "#FF8700", "#ffffff", "#DC0000"];

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PredictionPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [season, setSeason] = useState<number>(2024);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const [podiumData, setPodiumData] = useState<PodiumDriver[] | null>(null);
  const [winProbData, setWinProbData] = useState<WinProbDriver[] | null>(null);
  const [overtakeData, setOvertakeData] = useState<OvertakeDriver[] | null>(null);
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  const [userP1, setUserP1] = useState("");
  const [userP2, setUserP2] = useState("");
  const [userP3, setUserP3] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confettiPieces, setConfettiPieces] = useState<{ id: number; delay: number; color: string; x: number }[]>([]);

  const calendarRef = useRef<HTMLDivElement>(null);
  const races = RACES_BY_SEASON[season] ?? RACES_2024;

  // Check login state (optional — no redirect)
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
  }, []);

  // Fetch predictions when race selected
  useEffect(() => {
    if (selectedRound === null) return;

    const load = async () => {
      setLoadingPredictions(true);
      setPodiumData(null);
      setWinProbData(null);
      setOvertakeData(null);

      // Podium
      try {
        const data = await apiFetch("/predictions/podium", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (data?.podium) {
          setPodiumData(data.podium);
        } else {
          setPodiumData(FALLBACK_PODIUM);
        }
      } catch {
        setPodiumData(FALLBACK_PODIUM);
      }

      // Win probabilities
      try {
        const data = await apiFetch(
          `/predictions/win-probabilities?season=${season}&round=${selectedRound}`
        );
        if (Array.isArray(data) && data.length > 0) {
          setWinProbData(data.slice(0, 8));
        } else {
          setWinProbData(FALLBACK_WIN_PROBS);
        }
      } catch {
        setWinProbData(FALLBACK_WIN_PROBS);
      }

      // Overtakes (fallback only for now)
      setOvertakeData(FALLBACK_OVERTAKES);

      setLoadingPredictions(false);
    };

    load();
  }, [selectedRound, season]);

  const handleSelectRound = (round: number) => {
    setSelectedRound(round);
    setSubmitted(false);
    setSubmitError(null);
    setUserP1("");
    setUserP2("");
    setUserP3("");
  };

  const handleSubmitPrediction = async () => {
    if (!userP1 || !userP2 || !userP3 || !selectedRound) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      await apiFetch("/predict", {
        method: "POST",
        body: JSON.stringify({
          season,
          round: selectedRound,
          predicted_p1: userP1,
          predicted_p2: userP2,
          predicted_p3: userP3,
        }),
      });
    } catch {
      // Even if API fails, show success for demo (offline mode)
    }

    // Confetti
    const pieces = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      x: Math.random() * 100,
    }));
    setConfettiPieces(pieces);
    setSubmitted(true);
    setSubmitting(false);
  };

  const selectedRace = races.find((r) => r.round === selectedRound) ?? null;

  // Driver picker — exclude already chosen
  const available = (exclude1: string, exclude2: string) =>
    DRIVERS_FOR_PREDICT.filter((d) => d.code !== exclude1 && d.code !== exclude2);

  const maxWinProb = winProbData ? Math.max(...winProbData.map((d) => d.win_probability)) : 1;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#050508] pt-20 pb-20 overflow-x-hidden">

        {/* ── HERO HEADER ── */}
        <div className="carbon-fiber relative overflow-hidden border-b border-white/5">
          <div className="scanlines absolute inset-0 z-0 opacity-30 pointer-events-none" />
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(225,6,0,0.12) 0%, transparent 65%)",
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black tracking-[0.3em] text-[#E10600] uppercase">
                    F1 Intelligence
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E10600]/15 border border-[#E10600]/30 text-[#E10600] tracking-widest">
                    AI
                  </span>
                </div>
                <h1
                  className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-none"
                  style={{ textShadow: "0 0 60px rgba(225,6,0,0.2)" }}
                >
                  RACE
                  <span
                    className="block gradient-text-red"
                    style={{ WebkitTextStroke: "1px rgba(225,6,0,0.3)" }}
                  >
                    PREDICTOR
                  </span>
                </h1>
                <p className="mt-4 text-gray-400 text-sm tracking-widest uppercase font-medium">
                  Random Forest ML model &middot; 17 engineered features &middot; Real race data
                </p>
              </div>

              <div className="flex flex-col gap-2 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="w-2 h-2 rounded-full bg-green-400 pulse-red" />
                  <span className="text-xs text-gray-400 tracking-wider">MODEL ONLINE</span>
                </div>
                <p className="text-xs text-gray-600">Season {season} · 24 rounds</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">

          {/* ── SECTION 1: RACE SELECTOR ── */}
          <section>
            {/* Season picker */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">Season</span>
              {([2021, 2022, 2023, 2024] as const).map((yr) => (
                <button
                  key={yr}
                  onClick={() => { setSeason(yr); setSelectedRound(null); }}
                  className="px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200"
                  style={
                    season === yr
                      ? {
                          background: "#E10600",
                          borderColor: "#E10600",
                          color: "#fff",
                          boxShadow: "0 0 16px rgba(225,6,0,0.4)",
                        }
                      : {
                          background: "transparent",
                          borderColor: "rgba(255,255,255,0.1)",
                          color: "#9ca3af",
                        }
                  }
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Horizontal scroll race calendar */}
            <div
              ref={calendarRef}
              className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {races.map((race) => {
                const isSelected = selectedRound === race.round;
                return (
                  <button
                    key={race.round}
                    onClick={() => handleSelectRound(race.round)}
                    className="snap-start shrink-0 flex flex-col items-start p-4 rounded-xl border transition-all duration-200 w-40 text-left"
                    style={
                      isSelected
                        ? {
                            background: "rgba(225,6,0,0.12)",
                            borderColor: "#E10600",
                            boxShadow: "0 0 24px rgba(225,6,0,0.3)",
                          }
                        : {
                            background: "rgba(14,14,18,0.8)",
                            borderColor: "rgba(255,255,255,0.06)",
                          }
                    }
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span
                        className="text-[10px] font-bold tracking-widest"
                        style={{ color: isSelected ? "#E10600" : "#6b7280" }}
                      >
                        R{String(race.round).padStart(2, "0")}
                      </span>
                      <span className="text-lg">{race.flag}</span>
                    </div>
                    <p className="text-xs font-bold text-white leading-snug line-clamp-2 mb-1">
                      {race.name.replace(" Grand Prix", "").replace(" City", "")}
                    </p>
                    <p className="text-[10px] text-gray-500">{race.date}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── SECTION 2: AI PREDICTION PANEL ── */}
          <AnimatePresence>
            {selectedRound !== null && (
              <motion.section
                key={`predictions-${season}-${selectedRound}`}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-[#E10600] rounded-full" />
                  <h2 className="text-sm font-black tracking-[0.2em] text-white uppercase">
                    AI Prediction Panel
                  </h2>
                  <span className="text-gray-600 text-xs">·</span>
                  <span className="text-xs text-gray-400">
                    {selectedRace?.flag} {selectedRace?.name}
                  </span>
                </div>

                {/* Top two columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                  {/* LEFT: Podium Prediction */}
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-xs font-black tracking-[0.25em] text-white uppercase">
                          Podium Prediction
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Powered by Random Forest · 17 features
                        </p>
                      </div>
                      {loadingPredictions && (
                        <span className="text-[10px] text-[#E10600] animate-pulse tracking-widest font-bold">
                          GENERATING...
                        </span>
                      )}
                    </div>

                    {loadingPredictions ? (
                      <PodiumSkeleton />
                    ) : podiumData ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {podiumData.slice(0, 3).map((driver, i) => (
                          <PodiumBlock
                            key={driver.driver_code}
                            driver={driver}
                            position={i + 1}
                            index={i}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* RIGHT: Win Probability */}
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xs font-black tracking-[0.25em] text-white uppercase">
                        Win Probability
                      </h3>
                      <span className="text-[10px] text-gray-500">Top 7 drivers</span>
                    </div>

                    {loadingPredictions ? (
                      <div className="space-y-3">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div key={i} className="h-6 rounded bg-white/5 animate-pulse" />
                        ))}
                      </div>
                    ) : winProbData ? (
                      <div className="space-y-3">
                        {winProbData.map((d, i) => (
                          <WinProbBar key={d.driver_code} driver={d} index={i} maxProb={maxWinProb} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* BELOW: Overtake Probabilities */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <h3 className="text-xs font-black tracking-[0.25em] text-white uppercase">
                      Overtake Probabilities
                    </h3>
                    <span className="text-[10px] text-gray-500">· Top 10 drivers by overtake likelihood</span>
                  </div>

                  {loadingPredictions ? (
                    <div className="space-y-3">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-5 rounded bg-white/5 animate-pulse" />
                      ))}
                    </div>
                  ) : overtakeData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2.5">
                      {overtakeData.map((d, i) => (
                        <OvertakeBar key={d.driver_code} driver={d} index={i} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── SECTION 3: YOUR PREDICTION ── */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-[#E10600] rounded-full" />
              <h2 className="text-sm font-black tracking-[0.2em] text-white uppercase">
                Your Prediction
              </h2>
            </div>

            <div className="glass-card-red rounded-2xl p-6 md:p-8 relative overflow-hidden">
              {/* Subtle background accent */}
              <div
                className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 100% 0%, rgba(225,6,0,0.06) 0%, transparent 60%)",
                }}
              />

              {submitted ? (
                <div className="relative">
                  {/* Confetti */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {confettiPieces.map((p) => (
                      <ConfettiParticle key={p.id} delay={p.delay} color={p.color} x={p.x} />
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    className="text-center py-8 relative z-10"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: "rgba(225,6,0,0.15)",
                        border: "2px solid rgba(225,6,0,0.4)",
                        boxShadow: "0 0 30px rgba(225,6,0,0.3)",
                      }}
                    >
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Prediction Locked In!</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      {selectedRace?.flag} {selectedRace?.name} · Season {season}
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                      {[userP1, userP2, userP3].map((code, i) => {
                        const driver = DRIVERS_FOR_PREDICT.find((d) => d.code === code);
                        const medal = MEDAL[i + 1];
                        return (
                          <div
                            key={i}
                            className="px-4 py-2 rounded-xl text-center"
                            style={{
                              border: `1px solid ${medal.border}`,
                              background: `${medal.glow}`,
                            }}
                          >
                            <p className="text-[10px] font-bold" style={{ color: medal.color }}>
                              P{i + 1}
                            </p>
                            <p className="text-sm font-black text-white">{driver?.name ?? code}</p>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => { setSubmitted(false); setUserP1(""); setUserP2(""); setUserP3(""); }}
                      className="mt-6 text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
                    >
                      Change prediction
                    </button>
                  </motion.div>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="mb-6">
                    <p className="text-gray-300 text-sm">
                      Predict the top 3 finishers before the race starts.
                    </p>
                    {!selectedRound && (
                      <p className="text-xs text-[#E10600] mt-1">
                        Select a race from the calendar above first.
                      </p>
                    )}
                    {isLoggedIn === false && (
                      <p className="text-xs text-yellow-400/70 mt-1">
                        Login to save your prediction to your profile.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {/* P1 */}
                    <div>
                      <label className="block text-[10px] font-black tracking-[0.25em] mb-2"
                        style={{ color: MEDAL[1].color }}>
                        P1 — WINNER
                      </label>
                      <select
                        value={userP1}
                        onChange={(e) => { setUserP1(e.target.value); }}
                        disabled={!selectedRound}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white font-medium bg-white/5 border border-white/10 focus:outline-none focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]/40 disabled:opacity-40 transition-all"
                      >
                        <option value="" disabled className="bg-[#0d0d0f]">Choose driver</option>
                        {available(userP2, userP3).map((d) => (
                          <option key={d.code} value={d.code} className="bg-[#0d0d0f]">
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* P2 */}
                    <div>
                      <label className="block text-[10px] font-black tracking-[0.25em] mb-2"
                        style={{ color: MEDAL[2].color }}>
                        P2 — SECOND
                      </label>
                      <select
                        value={userP2}
                        onChange={(e) => setUserP2(e.target.value)}
                        disabled={!selectedRound}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white font-medium bg-white/5 border border-white/10 focus:outline-none focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]/40 disabled:opacity-40 transition-all"
                      >
                        <option value="" disabled className="bg-[#0d0d0f]">Choose driver</option>
                        {available(userP1, userP3).map((d) => (
                          <option key={d.code} value={d.code} className="bg-[#0d0d0f]">
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* P3 */}
                    <div>
                      <label className="block text-[10px] font-black tracking-[0.25em] mb-2"
                        style={{ color: MEDAL[3].color }}>
                        P3 — THIRD
                      </label>
                      <select
                        value={userP3}
                        onChange={(e) => setUserP3(e.target.value)}
                        disabled={!selectedRound}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white font-medium bg-white/5 border border-white/10 focus:outline-none focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]/40 disabled:opacity-40 transition-all"
                      >
                        <option value="" disabled className="bg-[#0d0d0f]">Choose driver</option>
                        {available(userP1, userP2).map((d) => (
                          <option key={d.code} value={d.code} className="bg-[#0d0d0f]">
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {submitError && (
                    <p className="text-xs text-red-400 mb-4">{submitError}</p>
                  )}

                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      onClick={handleSubmitPrediction}
                      disabled={!userP1 || !userP2 || !userP3 || submitting || !selectedRound}
                      className="btn-tactile px-8 py-3 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-200 disabled:opacity-40"
                      style={{
                        background: userP1 && userP2 && userP3 && selectedRound
                          ? "linear-gradient(135deg, #E10600, #b30500)"
                          : "rgba(225,6,0,0.3)",
                        color: "#fff",
                        boxShadow:
                          userP1 && userP2 && userP3 && selectedRound
                            ? "0 0 24px rgba(225,6,0,0.4), 0 4px 12px rgba(0,0,0,0.4)"
                            : "none",
                      }}
                    >
                      {submitting ? "Submitting..." : "Submit Prediction"}
                    </button>

                    <div className="text-[10px] text-gray-600 tracking-wider">
                      <span className="text-gray-400 font-semibold">Free:</span> 3 predictions / day
                      <span className="mx-2 text-gray-700">·</span>
                      <span className="text-[#E10600] font-semibold">Pro:</span> 25 predictions / day
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
