"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  LayoutGrid,
  List,
  GitCompare,
  ChevronDown,
  Star,
  Zap,
  Award,
  Flag,
  Timer,
  TrendingUp,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Dynamic F1Car3D import
// ─────────────────────────────────────────────────────────────
const F1Car3D = dynamic(() => import("@/components/3d/F1Car3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 animate-pulse bg-white/5 rounded-xl flex items-center justify-center">
      <span className="text-white/20 text-xs tracking-widest">LOADING CAR...</span>
    </div>
  ),
});

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const TEAMS_2024 = [
  { id: 1, name: "McLaren", short: "MCL", color: "#FF8700", secondColor: "#000000", position: 1, points: 666, wins: 6, podiums: 22, poles: 5, fastestLaps: 8, drivers: ["Lando Norris", "Oscar Piastri"], engine: "Mercedes", chassis: "MCL38", tires: "Pirelli", dnfRate: 4, avgFinish: 4.2, bestResult: "1st" },
  { id: 2, name: "Ferrari", short: "FER", color: "#DC0000", secondColor: "#FFFFFF", position: 2, points: 652, wins: 5, podiums: 18, poles: 12, fastestLaps: 6, drivers: ["Charles Leclerc", "Carlos Sainz"], engine: "Ferrari", chassis: "SF-24", tires: "Pirelli", dnfRate: 6, avgFinish: 4.8, bestResult: "1st" },
  { id: 3, name: "Red Bull", short: "RBR", color: "#0600EF", secondColor: "#CC1E4A", position: 3, points: 589, wins: 7, podiums: 15, poles: 6, fastestLaps: 4, drivers: ["Max Verstappen", "Sergio Perez"], engine: "Honda RBPT", chassis: "RB20", tires: "Pirelli", dnfRate: 5, avgFinish: 3.9, bestResult: "1st" },
  { id: 4, name: "Mercedes", short: "MER", color: "#00D2BE", secondColor: "#FFFFFF", position: 4, points: 468, wins: 4, podiums: 12, poles: 3, fastestLaps: 5, drivers: ["George Russell", "Lewis Hamilton"], engine: "Mercedes", chassis: "W15", tires: "Pirelli", dnfRate: 3, avgFinish: 5.1, bestResult: "1st" },
  { id: 5, name: "Aston Martin", short: "AMR", color: "#006F62", secondColor: "#CEDC00", position: 5, points: 94, wins: 0, podiums: 2, poles: 0, fastestLaps: 0, drivers: ["Fernando Alonso", "Lance Stroll"], engine: "Mercedes", chassis: "AMR24", tires: "Pirelli", dnfRate: 7, avgFinish: 9.2, bestResult: "2nd" },
  { id: 6, name: "Alpine", short: "ALP", color: "#0093CC", secondColor: "#FF0073", position: 6, points: 65, wins: 0, podiums: 0, poles: 0, fastestLaps: 1, drivers: ["Esteban Ocon", "Pierre Gasly"], engine: "Renault", chassis: "A524", tires: "Pirelli", dnfRate: 9, avgFinish: 11.3, bestResult: "5th" },
  { id: 7, name: "Haas", short: "HAA", color: "#B6BABD", secondColor: "#E8002D", position: 7, points: 58, wins: 0, podiums: 0, poles: 1, fastestLaps: 0, drivers: ["Nico Hulkenberg", "Kevin Magnussen"], engine: "Ferrari", chassis: "VF-24", tires: "Pirelli", dnfRate: 8, avgFinish: 12.1, bestResult: "5th" },
  { id: 8, name: "VCARB", short: "VCB", color: "#1E41FF", secondColor: "#FFFFFF", position: 8, points: 46, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, drivers: ["Yuki Tsunoda", "Liam Lawson"], engine: "Honda RBPT", chassis: "VCARB 01", tires: "Pirelli", dnfRate: 10, avgFinish: 13.4, bestResult: "7th" },
  { id: 9, name: "Williams", short: "WIL", color: "#005AFF", secondColor: "#FFFFFF", position: 9, points: 17, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, drivers: ["Alex Albon", "Logan Sargeant"], engine: "Mercedes", chassis: "FW46", tires: "Pirelli", dnfRate: 6, avgFinish: 14.8, bestResult: "6th" },
  { id: 10, name: "Sauber", short: "SAU", color: "#00E48D", secondColor: "#FFFFFF", position: 10, points: 4, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, drivers: ["Valtteri Bottas", "Guanyu Zhou"], engine: "Ferrari", chassis: "C44", tires: "Pirelli", dnfRate: 11, avgFinish: 16.2, bestResult: "9th" },
];

type ViewMode = "CARDS" | "STANDINGS" | "COMPARE";

// ─────────────────────────────────────────────────────────────
// Animated counter hook
// ─────────────────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1200, trigger = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);
  return value;
}

// ─────────────────────────────────────────────────────────────
// Animated bar component
// ─────────────────────────────────────────────────────────────
function AnimatedBar({
  value,
  max,
  color,
  animate,
}: {
  value: number;
  max: number;
  color: string;
  animate: boolean;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: animate ? `${pct}%` : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Driver initials avatar
// ─────────────────────────────────────────────────────────────
function DriverAvatar({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-black shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Position medal
// ─────────────────────────────────────────────────────────────
function PositionMedal({ pos }: { pos: number }) {
  const colors: Record<number, string> = {
    1: "#FFD700",
    2: "#C0C0C0",
    3: "#CD7F32",
  };
  const bg = colors[pos] ?? "#ffffff15";
  const text = pos <= 3 ? "#000" : "#fff";
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
      style={{ backgroundColor: bg, color: text }}
    >
      {pos}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stat pill
// ─────────────────────────────────────────────────────────────
function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg bg-white/5 border border-white/5 min-w-15">
      <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
        {label}
      </span>
      <span className="text-base font-black" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Team Card
// ─────────────────────────────────────────────────────────────
function TeamCard({
  team,
  index,
}: {
  team: (typeof TEAMS_2024)[number];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const pointsCount = useAnimatedCounter(team.points, 1000, true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: "easeOut" }}
      className="relative rounded-2xl overflow-hidden border border-white/5 cursor-pointer group"
      style={{ background: "#0d0d12" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top color banner */}
      <div
        className="h-2 w-full"
        style={{
          background: `linear-gradient(90deg, ${team.color}, ${team.secondColor === "#FFFFFF" ? team.color + "55" : team.secondColor})`,
        }}
      />

      {/* Position badge */}
      <div
        className="absolute top-4 right-4 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black"
        style={{
          background: team.color + "22",
          border: `1px solid ${team.color}55`,
          color: team.color,
        }}
      >
        P{team.position}
      </div>

      {/* 3D Car */}
      <div className="relative h-44 w-full overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `radial-gradient(ellipse at center, ${team.color}12 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 w-full h-full">
          <F1Car3D
            teamColor={team.color}
            accentColor={team.secondColor}
            interactive={false}
            size={0.85}
          />
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Team name */}
        <h2
          className="text-2xl font-black italic uppercase tracking-tight mb-1"
          style={{ color: team.color }}
        >
          {team.name}
        </h2>

        {/* Points counter */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-black text-white tabular-nums">
            {pointsCount}
          </span>
          <span className="text-xs font-bold text-white/30 tracking-widest uppercase">
            PTS
          </span>
        </div>

        {/* Key stats row */}
        <div className="flex gap-2 flex-wrap mb-4">
          <StatPill label="WINS" value={team.wins} color={team.color} />
          <StatPill label="PODS" value={team.podiums} color={team.color} />
          <StatPill label="POLES" value={team.poles} color={team.color} />
          <StatPill label="FL" value={team.fastestLaps} color={team.color} />
        </div>

        {/* Drivers */}
        <div className="flex flex-col gap-2 mb-4">
          {team.drivers.map((d) => (
            <div key={d} className="flex items-center gap-3">
              <DriverAvatar name={d} color={team.color} />
              <span className="text-sm font-semibold text-white/80">{d}</span>
            </div>
          ))}
        </div>

        {/* Car specs */}
        <div className="grid grid-cols-3 gap-2 text-[10px] border-t border-white/5 pt-3">
          <div>
            <p className="text-white/30 uppercase tracking-widest mb-0.5">Engine</p>
            <p className="font-bold text-white/70 truncate">{team.engine}</p>
          </div>
          <div>
            <p className="text-white/30 uppercase tracking-widest mb-0.5">Chassis</p>
            <p className="font-bold text-white/70 truncate">{team.chassis}</p>
          </div>
          <div>
            <p className="text-white/30 uppercase tracking-widest mb-0.5">Tires</p>
            <p className="font-bold text-white/70 truncate">{team.tires}</p>
          </div>
        </div>

        {/* Season best & podiums footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[11px]">
          <span className="text-white/30 uppercase tracking-widest">
            Best: <span className="text-white/60 font-bold">{team.bestResult}</span>
          </span>
          <span className="text-white/30 uppercase tracking-widest">
            Avg finish:{" "}
            <span className="font-bold" style={{ color: team.color }}>
              {team.avgFinish.toFixed(1)}
            </span>
          </span>
        </div>
      </div>

      {/* Hover overlay with detailed stats */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 rounded-2xl z-30 flex flex-col justify-end p-5"
            style={{
              background: `linear-gradient(160deg, ${team.color}cc 0%, #050508f5 55%)`,
            }}
          >
            <h3 className="text-xl font-black italic uppercase text-white mb-3">
              {team.name} — 2024
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: "Points", value: team.points },
                { label: "Race Wins", value: team.wins },
                { label: "Podiums", value: team.podiums },
                { label: "Pole Positions", value: team.poles },
                { label: "Fastest Laps", value: team.fastestLaps },
                { label: "DNF Rate", value: `${team.dnfRate}%` },
                { label: "Avg Finish", value: `P${team.avgFinish.toFixed(1)}` },
                { label: "Best Result", value: team.bestResult },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-1.5"
                >
                  <span className="text-white/50 text-[11px] uppercase tracking-wide">
                    {s.label}
                  </span>
                  <span className="font-black text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// STANDINGS VIEW
// ─────────────────────────────────────────────────────────────
function StandingsView() {
  const leader = TEAMS_2024[0].points;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/5 overflow-hidden"
      style={{ background: "#0d0d12" }}
    >
      {/* Table header */}
      <div className="grid grid-cols-[48px_1fr_100px_160px_80px_80px_100px] gap-2 px-5 py-3 border-b border-white/5 text-[10px] font-bold tracking-widest text-white/30 uppercase">
        <span>POS</span>
        <span>TEAM</span>
        <span className="text-right">PTS</span>
        <span className="pl-2">CHART</span>
        <span className="text-right">GAP</span>
        <span className="text-right">WINS</span>
        <span className="text-right">PTS/RACE</span>
      </div>

      {TEAMS_2024.map((team, i) => {
        const gap = team.points - leader;
        const ptsPerRace = (team.points / 24).toFixed(1);
        return (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.055, duration: 0.35 }}
            className="grid grid-cols-[48px_1fr_100px_160px_80px_80px_100px] gap-2 items-center px-5 py-4 border-b border-white/5 hover:bg-white/3 transition-colors group"
          >
            {/* Position */}
            <PositionMedal pos={team.position} />

            {/* Team name + color bar */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-1 h-8 rounded-full shrink-0"
                style={{ background: team.color }}
              />
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-black shrink-0"
                style={{ background: team.color + "22", color: team.color }}
              >
                {team.short}
              </div>
              <span className="font-bold text-white truncate group-hover:text-white transition-colors">
                {team.name}
              </span>
            </div>

            {/* Points */}
            <span className="text-right font-black text-white tabular-nums">
              {team.points}
            </span>

            {/* Bar chart */}
            <div className="px-2">
              <AnimatedBar
                value={team.points}
                max={leader}
                color={team.color}
                animate={true}
              />
            </div>

            {/* Gap */}
            <span className="text-right text-sm tabular-nums text-white/50 font-mono">
              {gap === 0 ? "—" : gap}
            </span>

            {/* Wins */}
            <span className="text-right font-bold text-white tabular-nums">
              {team.wins}
            </span>

            {/* Points per race */}
            <span className="text-right font-mono text-white/60 text-sm tabular-nums">
              {ptsPerRace}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPARE VIEW
// ─────────────────────────────────────────────────────────────
const COMPARE_STATS: { key: keyof (typeof TEAMS_2024)[0]; label: string; icon: React.ReactNode; higherIsBetter: boolean }[] = [
  { key: "points", label: "Points", icon: <Star size={13} />, higherIsBetter: true },
  { key: "wins", label: "Race Wins", icon: <Trophy size={13} />, higherIsBetter: true },
  { key: "podiums", label: "Podiums", icon: <Award size={13} />, higherIsBetter: true },
  { key: "poles", label: "Pole Positions", icon: <Flag size={13} />, higherIsBetter: true },
  { key: "fastestLaps", label: "Fastest Laps", icon: <Timer size={13} />, higherIsBetter: true },
  { key: "dnfRate", label: "DNF Rate (%)", icon: <Zap size={13} />, higherIsBetter: false },
  { key: "avgFinish", label: "Avg Finish Pos", icon: <TrendingUp size={13} />, higherIsBetter: false },
];

function CompareView() {
  const [teamAId, setTeamAId] = useState(TEAMS_2024[0].id);
  const [teamBId, setTeamBId] = useState(TEAMS_2024[1].id);
  const [animated, setAnimated] = useState(false);

  const teamA = TEAMS_2024.find((t) => t.id === teamAId)!;
  const teamB = TEAMS_2024.find((t) => t.id === teamBId)!;

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, [teamAId, teamBId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { team: teamA, setId: setTeamAId, other: teamBId },
          { team: teamB, setId: setTeamBId, other: teamAId },
        ].map(({ team, setId, other }, idx) => (
          <div key={idx} className="relative">
            <div
              className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer"
              style={{
                background: team.color + "18",
                borderColor: team.color + "55",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black"
                style={{ background: team.color, color: "#000" }}
              >
                {team.short}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black italic uppercase text-white text-lg leading-tight">
                  {team.name}
                </p>
                <p className="text-xs text-white/40">P{team.position} — {team.points} pts</p>
              </div>
              <ChevronDown size={16} className="text-white/40" />
              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={team.id}
                onChange={(e) => setId(Number(e.target.value))}
              >
                {TEAMS_2024.filter((t) => t.id !== other).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* 3D cars side by side */}
      <div className="grid grid-cols-2 gap-4">
        {[teamA, teamB].map((team) => (
          <div
            key={team.id}
            className="h-44 rounded-xl overflow-hidden relative"
            style={{ background: `radial-gradient(ellipse, ${team.color}18, #050508)` }}
          >
            <F1Car3D
              teamColor={team.color}
              accentColor={team.secondColor}
              interactive={false}
              size={0.8}
            />
          </div>
        ))}
      </div>

      {/* Stat comparison bars */}
      <div
        className="rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5"
        style={{ background: "#0d0d12" }}
      >
        {COMPARE_STATS.map(({ key, label, icon, higherIsBetter }) => {
          const valA = teamA[key] as number;
          const valB = teamB[key] as number;
          const maxVal = Math.max(valA, valB, 1);
          const winnerA = higherIsBetter ? valA > valB : valA < valB;
          const winnerB = higherIsBetter ? valB > valA : valB < valA;

          return (
            <div key={key} className="px-5 py-4">
              <div className="flex items-center justify-center gap-2 mb-3 text-[11px] font-bold tracking-widest text-white/40 uppercase">
                <span>{icon}</span>
                {label}
              </div>
              <div className="grid grid-cols-[1fr_80px_1fr] items-center gap-3">
                {/* Team A bar (RTL) */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    {winnerA && (
                      <Star
                        size={12}
                        className="fill-current"
                        style={{ color: teamA.color }}
                      />
                    )}
                    <span
                      className="text-lg font-black tabular-nums"
                      style={{ color: winnerA ? teamA.color : "rgba(255,255,255,0.5)" }}
                    >
                      {valA}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex justify-end">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: teamA.color }}
                      initial={{ width: 0 }}
                      animate={{ width: animated ? `${(valA / maxVal) * 100}%` : 0 }}
                      transition={{ duration: 0.75, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Center labels */}
                <div className="text-center">
                  <span
                    className="text-[9px] font-bold tracking-widest block truncate"
                    style={{ color: teamA.color }}
                  >
                    {teamA.short}
                  </span>
                  <span className="text-white/20 text-xs">vs</span>
                  <span
                    className="text-[9px] font-bold tracking-widest block truncate"
                    style={{ color: teamB.color }}
                  >
                    {teamB.short}
                  </span>
                </div>

                {/* Team B bar (LTR) */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg font-black tabular-nums"
                      style={{ color: winnerB ? teamB.color : "rgba(255,255,255,0.5)" }}
                    >
                      {valB}
                    </span>
                    {winnerB && (
                      <Star
                        size={12}
                        className="fill-current"
                        style={{ color: teamB.color }}
                      />
                    )}
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: teamB.color }}
                      initial={{ width: 0 }}
                      animate={{ width: animated ? `${(valB / maxVal) * 100}%` : 0 }}
                      transition={{ duration: 0.75, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export default function TeamsPage() {
  const [view, setView] = useState<ViewMode>("CARDS");
  const [season, setSeason] = useState(2024);
  const seasons = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  const views: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: "CARDS", icon: <LayoutGrid size={14} />, label: "CARDS" },
    { mode: "STANDINGS", icon: <List size={14} />, label: "STANDINGS" },
    { mode: "COMPARE", icon: <GitCompare size={14} />, label: "COMPARE" },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#050508",
        backgroundImage: `
          radial-gradient(ellipse 80% 40% at 50% -10%, #E1060015 0%, transparent 60%),
          repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.02) 40px),
          repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.02) 40px)
        `,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* ── PAGE HEADER ── */}
        <header className="mb-10">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E10600]/10 border border-[#E10600]/30">
                <Trophy size={28} className="text-[#E10600]" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase mb-1">
                  Formula 1 · 2024
                </p>
                <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white leading-none">
                  CONSTRUCTORS
                </h1>
              </div>
            </div>

            {/* Season selector */}
            <div className="relative shrink-0">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm">
                <span className="text-white/40 text-xs tracking-widest uppercase">Season</span>
                <span>{season}</span>
                <ChevronDown size={14} className="text-white/40" />
              </div>
              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
              >
                {seasons.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
            {views.map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-widest transition-all duration-200"
                style={{
                  color: view === mode ? "#fff" : "rgba(255,255,255,0.3)",
                }}
              >
                {view === mode && (
                  <motion.div
                    layoutId="active-view-bg"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "#E10600" }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {icon}
                  {label}
                </span>
              </button>
            ))}
          </div>
        </header>

        {/* ── VIEW CONTENT ── */}
        <AnimatePresence mode="wait">
          {view === "CARDS" && (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {TEAMS_2024.map((team, i) => (
                <TeamCard key={team.id} team={team} index={i} />
              ))}
            </motion.div>
          )}

          {view === "STANDINGS" && (
            <motion.div
              key="standings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <StandingsView />
            </motion.div>
          )}

          {view === "COMPARE" && (
            <motion.div
              key="compare"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <CompareView />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer note */}
        <p className="text-center text-white/15 text-xs tracking-widest mt-12 uppercase">
          2024 Constructor Championship · Data as of season end
        </p>
      </div>
    </div>
  );
}
