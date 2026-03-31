"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveRace, type LeaderboardEntry, type TireCompound } from "@/hooks/useLiveRace";

// ── Tire badge ────────────────────────────────────────────────────────────────
const TIRE_CONFIG: Record<TireCompound, { label: string; bg: string; text: string; border: string }> = {
  SOFT:  { label: "S", bg: "rgba(220,0,0,0.25)",    text: "#ff4444", border: "rgba(220,0,0,0.5)"    },
  MEDIUM:{ label: "M", bg: "rgba(255,180,0,0.2)",   text: "#ffcc00", border: "rgba(255,200,0,0.5)"  },
  HARD:  { label: "H", bg: "rgba(230,230,230,0.12)",text: "#e8e8e8", border: "rgba(220,220,220,0.4)"},
  INTER: { label: "I", bg: "rgba(0,160,0,0.2)",     text: "#22c55e", border: "rgba(0,200,0,0.5)"    },
  WET:   { label: "W", bg: "rgba(0,100,255,0.2)",   text: "#60a5fa", border: "rgba(0,120,255,0.5)"  },
};

function TireBadge({ compound }: { compound: TireCompound }) {
  const cfg = TIRE_CONFIG[compound];
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
      title={compound}
    >
      {cfg.label}
    </span>
  );
}

// ── Position medal colours ────────────────────────────────────────────────────
function posColor(pos: number): string {
  if (pos === 1) return "#FFD700"; // gold
  if (pos === 2) return "#C0C0C0"; // silver
  if (pos === 3) return "#CD7F32"; // bronze
  return "#6b7280";
}

function posShadow(pos: number): string {
  if (pos === 1) return "0 0 12px rgba(255,215,0,0.6)";
  if (pos === 2) return "0 0 10px rgba(192,192,192,0.5)";
  if (pos === 3) return "0 0 10px rgba(205,127,50,0.5)";
  return "none";
}

// ── Direction arrow for position change ──────────────────────────────────────
type Direction = "up" | "down" | "same";

function PositionArrow({ dir }: { dir: Direction }) {
  if (dir === "same") return <span className="w-3 inline-block" />;
  return (
    <motion.span
      key={dir}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-[10px] font-black"
      style={{ color: dir === "up" ? "#22c55e" : "#ef4444" }}
    >
      {dir === "up" ? "▲" : "▼"}
    </motion.span>
  );
}

// ── Individual leaderboard row ────────────────────────────────────────────────
interface RowProps {
  entry: LeaderboardEntry;
  prevPos: number | null;
  index: number;
}

function LeaderboardRow({ entry, prevPos, index }: RowProps) {
  const [flash, setFlash] = useState<"fastest" | "pit" | "pos" | null>(null);
  const prevPosRef = useRef<number | null>(prevPos);

  // Detect position change → flash
  useEffect(() => {
    if (prevPosRef.current !== null && prevPosRef.current !== entry.position) {
      setFlash("pos");
      const t = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(t);
    }
    prevPosRef.current = entry.position;
  }, [entry.position]);

  // Fastest lap flash (purple)
  const prevFastest = useRef(entry.isFastest);
  useEffect(() => {
    if (!prevFastest.current && entry.isFastest) {
      setFlash("fastest");
      const t = setTimeout(() => setFlash(null), 1200);
      return () => clearTimeout(t);
    }
    prevFastest.current = entry.isFastest ?? false;
  }, [entry.isFastest]);

  // Pit flash
  const prevPit = useRef(entry.pit);
  useEffect(() => {
    if (!prevPit.current && entry.pit) {
      setFlash("pit");
    }
    prevPit.current = entry.pit;
  }, [entry.pit]);

  const dir: Direction =
    prevPos === null || prevPos === entry.position
      ? "same"
      : prevPos > entry.position
      ? "up"
      : "down";

  let rowBg = "rgba(14,14,18,0.0)";
  if (flash === "fastest") rowBg = "rgba(168,85,247,0.18)";
  if (flash === "pit")     rowBg = "rgba(250,204,21,0.08)";
  if (flash === "pos")     rowBg = dir === "up" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.10)";
  if (entry.pit && flash !== "pos") rowBg = "rgba(10,10,14,0.6)";

  return (
    <motion.div
      layout
      layoutId={entry.driverCode}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: entry.pit ? 0.65 : 1, x: 0 }}
      className="relative flex items-center gap-2 px-3 py-[7px] rounded-xl border border-transparent group cursor-default select-none"
      style={{
        background: rowBg,
        transition: "background 0.4s ease",
        borderColor: entry.isFastest ? "rgba(168,85,247,0.35)" : "transparent",
      }}
    >
      {/* Fastest lap purple left bar */}
      {entry.isFastest && (
        <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full bg-purple-500" />
      )}

      {/* Team color left bar */}
      <div
        className="w-[3px] h-7 rounded-full flex-shrink-0"
        style={{ backgroundColor: entry.teamColor }}
      />

      {/* Position number */}
      <div className="w-6 flex-shrink-0 flex items-center justify-center">
        <span
          className="text-xs font-black tabular-nums"
          style={{
            color: posColor(entry.position),
            textShadow: posShadow(entry.position),
          }}
        >
          {entry.position}
        </span>
      </div>

      {/* Position change arrow */}
      <div className="w-3 flex-shrink-0 flex items-center justify-center">
        <PositionArrow dir={dir} />
      </div>

      {/* Driver code */}
      <span className="w-8 text-xs font-black tracking-wider text-white flex-shrink-0">
        {entry.driverCode}
      </span>

      {/* Team name (hidden on small) */}
      <span className="hidden lg:block text-[10px] text-neutral-600 w-20 truncate flex-shrink-0">
        {entry.team}
      </span>

      {/* Gap */}
      <span
        className="text-[10px] font-mono w-14 flex-shrink-0"
        style={{ color: entry.gap === "LEADER" ? "#E10600" : "#a1a1aa" }}
      >
        {entry.gap}
      </span>

      {/* Last lap */}
      <span
        className="text-[10px] font-mono w-20 flex-shrink-0"
        style={{ color: entry.isFastest ? "#c084fc" : "#71717a" }}
      >
        {entry.lastLap}
      </span>

      {/* Tire */}
      <div className="flex-shrink-0">
        <TireBadge compound={entry.tire} />
      </div>

      {/* Badges strip */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
        {entry.pit && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="text-[8px] font-black px-1.5 py-0.5 rounded"
            style={{ background: "rgba(250,204,21,0.2)", color: "#facc15", border: "1px solid rgba(250,204,21,0.4)" }}
          >
            PIT IN
          </motion.span>
        )}
        {entry.drs && !entry.pit && (
          <span
            className="text-[8px] font-black px-1.5 py-0.5 rounded"
            style={{ background: "rgba(6,182,212,0.15)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.35)" }}
          >
            DRS+
          </span>
        )}
        {entry.isFastest && (
          <span
            className="text-[8px] font-black px-1.5 py-0.5 rounded"
            style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.4)" }}
          >
            FL
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Table header ──────────────────────────────────────────────────────────────
function TableHeader() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 mb-1 border-b border-white/5">
      <div className="w-[3px] flex-shrink-0" />
      <span className="w-6 text-[9px] text-neutral-600 uppercase tracking-widest flex-shrink-0 text-center">P</span>
      <div className="w-3 flex-shrink-0" />
      <span className="w-8 text-[9px] text-neutral-600 uppercase tracking-widest flex-shrink-0">DRV</span>
      <span className="hidden lg:block w-20 text-[9px] text-neutral-600 uppercase tracking-widest flex-shrink-0">Team</span>
      <span className="w-14 text-[9px] text-neutral-600 uppercase tracking-widest flex-shrink-0">Gap</span>
      <span className="w-20 text-[9px] text-neutral-600 uppercase tracking-widest flex-shrink-0">Last Lap</span>
      <span className="text-[9px] text-neutral-600 uppercase tracking-widest flex-shrink-0">Tyre</span>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function LeaderboardSkeleton() {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 py-[7px] rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <div className="w-[3px] h-7 rounded-full bg-white/10 flex-shrink-0" />
          <div className="h-3 w-3 rounded-full bg-white/10 flex-shrink-0" />
          <div className="h-3 w-3 rounded bg-white/8 flex-shrink-0" />
          <div className="h-3 w-6 rounded bg-white/10 flex-shrink-0" />
          <div className="h-2 w-16 rounded bg-white/6 flex-shrink-0" />
          <div className="h-2 w-10 rounded bg-white/6 flex-shrink-0" />
          <div className="h-2 w-16 rounded bg-white/6 flex-shrink-0" />
          <div className="h-4 w-4 rounded-full bg-white/8 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LiveLeaderboard() {
  const { leaderboard, isLive, isSimulation, sessionStatus, lap, totalLaps } = useLiveRace();

  // Track previous positions for change indicators
  const prevPositions = useRef<Record<string, number>>({});
  const [prevPos, setPrevPos] = useState<Record<string, number>>({});

  useEffect(() => {
    if (leaderboard.length === 0) return;
    // Snapshot previous, then update
    setPrevPos({ ...prevPositions.current });
    const next: Record<string, number> = {};
    for (const e of leaderboard) next[e.driverCode] = e.position;
    prevPositions.current = next;
  }, [leaderboard]);

  // Race / circuit name from simulation
  const raceName    = "Monaco Grand Prix";
  const circuitName = "Circuit de Monaco";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(10,10,14,0.92)",
        border: isLive
          ? "1px solid rgba(225,6,0,0.35)"
          : isSimulation
          ? "1px solid rgba(250,204,21,0.25)"
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isLive
          ? "0 0 40px rgba(225,6,0,0.08), 0 20px 60px rgba(0,0,0,0.7)"
          : "0 20px 60px rgba(0,0,0,0.7)",
      }}
    >
      {/* ── Header bar ───────────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: isLive
            ? "rgba(225,6,0,0.06)"
            : isSimulation
            ? "rgba(250,204,21,0.04)"
            : "transparent",
        }}
      >
        {/* Left: title + status badge */}
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            Live Timing
          </h3>

          <AnimatePresence mode="wait">
            {isLive && (
              <motion.div
                key="live-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(225,6,0,0.2)", border: "1px solid rgba(225,6,0,0.5)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] pulse-red" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#E10600]">Live</span>
              </motion.div>
            )}
            {isSimulation && (
              <motion.div
                key="sim-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.4)" }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="text-[9px]"
                >
                  ◉
                </motion.span>
                <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">
                  Simulation
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: lap counter + race info */}
        <div className="flex items-center gap-4">
          {/* Lap counter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Lap</span>
            <span className="font-mono font-black text-white text-sm tabular-nums">
              {lap}
            </span>
            <span className="text-[9px] text-neutral-600">/ {totalLaps}</span>
          </div>

          {/* Lap progress bar */}
          <div className="w-20 h-1 rounded-full bg-white/8 overflow-hidden hidden sm:block">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isLive
                  ? "linear-gradient(90deg,#E10600,#ff6b35)"
                  : "linear-gradient(90deg,#facc15,#f59e0b)",
              }}
              animate={{ width: `${Math.round((lap / totalLaps) * 100)}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* Race name */}
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-black text-white leading-none">{raceName}</p>
            <p className="text-[9px] text-neutral-600 leading-none mt-0.5">{circuitName}</p>
          </div>
        </div>
      </div>

      {/* ── Simulation notice bar ─────────────────────────────────────────── */}
      {isSimulation && (
        <div
          className="px-5 py-2 text-center"
          style={{ background: "rgba(250,204,21,0.06)", borderBottom: "1px solid rgba(250,204,21,0.12)" }}
        >
          <p className="text-[9px] font-bold text-yellow-500/80 uppercase tracking-widest">
            Simulation Mode — Race Simulator Active · No live session detected
          </p>
        </div>
      )}

      {/* ── Leaderboard body ──────────────────────────────────────────────── */}
      <div className="p-3">
        {leaderboard.length === 0 ? (
          <LeaderboardSkeleton />
        ) : (
          <>
            <TableHeader />
            <div className="space-y-0.5">
              <AnimatePresence initial={false}>
                {leaderboard.map((entry) => (
                  <LeaderboardRow
                    key={entry.driverCode}
                    entry={entry}
                    prevPos={prevPos[entry.driverCode] ?? null}
                    index={entry.position - 1}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-3 text-[9px] text-neutral-600">
          <span>
            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: "#c084fc" }} />
            Fastest Lap
          </span>
          <span>
            <span className="inline-block w-2 h-2 rounded-full mr-1 bg-yellow-400" />
            PIT IN
          </span>
          <span>
            <span className="inline-block w-2 h-2 rounded-full mr-1 bg-cyan-400" />
            DRS Active
          </span>
        </div>
        <span className="text-[9px] text-neutral-700 font-mono uppercase tracking-widest">
          {sessionStatus}
        </span>
      </div>
    </div>
  );
}
