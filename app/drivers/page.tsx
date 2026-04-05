"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { fetchDriverStandings, ErgastDriverStanding, TEAM_COLORS } from "@/lib/f1api";

// ─── Dynamic 3D Helmet ───────────────────────────────────────────────────────
const Helmet3D = dynamic(() => import("@/components/3d/Helmet3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-40 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-white/20 border-t-red-600 rounded-full animate-spin" />
    </div>
  ),
});

// ─── Types ───────────────────────────────────────────────────────────────────
interface DriverData {
  id: number;
  code: string;
  given_name: string;
  family_name: string;
  nationality: string;
  number: number;
  team: string;
  teamColor: string;
  championships: number;
  wins: number;
  podiums: number;
  poles: number;
  points_total: number;
  rating: number;
  highlight: string;
  season_points?: number;
  season_position?: number;
}

// ─── Hardcoded 2024 Data ─────────────────────────────────────────────────────
const DRIVERS_2024: DriverData[] = [
  { id: 1,  code: "VER", given_name: "Max",      family_name: "Verstappen", nationality: "🇳🇱", number: 1,  team: "Red Bull",     teamColor: "#0600EF", championships: 4, wins: 61,  podiums: 106, poles: 40,  points_total: 2586, rating: 98, highlight: "4× World Champion" },
  { id: 2,  code: "NOR", given_name: "Lando",    family_name: "Norris",     nationality: "🇬🇧", number: 4,  team: "McLaren",      teamColor: "#FF8700", championships: 0, wins: 3,   podiums: 28,  poles: 5,   points_total: 374,  rating: 88, highlight: "McLaren's #1 Driver" },
  { id: 3,  code: "LEC", given_name: "Charles",  family_name: "Leclerc",    nationality: "🇲🇨", number: 16, team: "Ferrari",      teamColor: "#DC0000", championships: 0, wins: 8,   podiums: 40,  poles: 24,  points_total: 1148, rating: 91, highlight: "Ferrari's Future WDC" },
  { id: 4,  code: "PIA", given_name: "Oscar",    family_name: "Piastri",    nationality: "🇦🇺", number: 81, team: "McLaren",      teamColor: "#FF8700", championships: 0, wins: 2,   podiums: 12,  poles: 1,   points_total: 292,  rating: 85, highlight: "F2 Champion 2021" },
  { id: 5,  code: "SAI", given_name: "Carlos",   family_name: "Sainz",      nationality: "🇪🇸", number: 55, team: "Ferrari",      teamColor: "#DC0000", championships: 0, wins: 4,   podiums: 24,  poles: 6,   points_total: 1042, rating: 86, highlight: "Only driver to beat Verstappen in 2024" },
  { id: 6,  code: "RUS", given_name: "George",   family_name: "Russell",    nationality: "🇬🇧", number: 63, team: "Mercedes",     teamColor: "#00D2BE", championships: 0, wins: 3,   podiums: 16,  poles: 5,   points_total: 490,  rating: 84, highlight: "Mercedes Team Leader" },
  { id: 7,  code: "HAM", given_name: "Lewis",    family_name: "Hamilton",   nationality: "🇬🇧", number: 44, team: "Ferrari",      teamColor: "#DC0000", championships: 7, wins: 103, podiums: 197, poles: 104, points_total: 4639, rating: 95, highlight: "7× World Champion – GOAT" },
  { id: 8,  code: "ALO", given_name: "Fernando", family_name: "Alonso",     nationality: "🇪🇸", number: 14, team: "Aston Martin", teamColor: "#006F62", championships: 2, wins: 32,  podiums: 106, poles: 22,  points_total: 2267, rating: 89, highlight: "2× WDC – Still Racing at 43" },
  { id: 9,  code: "STR", given_name: "Lance",    family_name: "Stroll",     nationality: "🇨🇦", number: 18, team: "Aston Martin", teamColor: "#006F62", championships: 0, wins: 0,   podiums: 3,   poles: 1,   points_total: 240,  rating: 72, highlight: "Son of Team Owner" },
  { id: 10, code: "TSU", given_name: "Yuki",     family_name: "Tsunoda",    nationality: "🇯🇵", number: 22, team: "VCARB",        teamColor: "#1E41FF", championships: 0, wins: 0,   podiums: 0,   poles: 0,   points_total: 80,   rating: 76, highlight: "Japan's F1 Star" },
  { id: 11, code: "ALB", given_name: "Alex",     family_name: "Albon",      nationality: "🇹🇭", number: 23, team: "Williams",     teamColor: "#005AFF", championships: 0, wins: 0,   podiums: 2,   poles: 0,   points_total: 240,  rating: 78, highlight: "Williams' Points Machine" },
  { id: 12, code: "HUL", given_name: "Nico",     family_name: "Hulkenberg", nationality: "🇩🇪", number: 27, team: "Haas",         teamColor: "#B6BABD", championships: 0, wins: 0,   podiums: 0,   poles: 1,   points_total: 530,  rating: 79, highlight: "0 Podiums – Most Starts Without" },
  { id: 13, code: "MAG", given_name: "Kevin",    family_name: "Magnussen",  nationality: "🇩🇰", number: 20, team: "Haas",         teamColor: "#B6BABD", championships: 0, wins: 0,   podiums: 1,   poles: 1,   points_total: 185,  rating: 74, highlight: "Sprint Race Winner" },
  { id: 14, code: "OCO", given_name: "Esteban",  family_name: "Ocon",       nationality: "🇫🇷", number: 31, team: "Alpine",       teamColor: "#0093CC", championships: 0, wins: 1,   podiums: 3,   poles: 0,   points_total: 374,  rating: 77, highlight: "Hungarian GP 2021 Winner" },
  { id: 15, code: "GAS", given_name: "Pierre",   family_name: "Gasly",      nationality: "🇫🇷", number: 10, team: "Alpine",       teamColor: "#0093CC", championships: 0, wins: 1,   podiums: 4,   poles: 0,   points_total: 312,  rating: 78, highlight: "Italian GP 2020 Winner" },
  { id: 16, code: "BOT", given_name: "Valtteri", family_name: "Bottas",     nationality: "🇫🇮", number: 77, team: "Sauber",       teamColor: "#00E48D", championships: 0, wins: 10,  podiums: 67,  poles: 20,  points_total: 1797, rating: 80, highlight: "Former Mercedes #2" },
  { id: 17, code: "ZHO", given_name: "Guanyu",   family_name: "Zhou",       nationality: "🇨🇳", number: 24, team: "Sauber",       teamColor: "#00E48D", championships: 0, wins: 0,   podiums: 0,   poles: 0,   points_total: 12,   rating: 70, highlight: "China's First F1 Driver" },
  { id: 18, code: "SAR", given_name: "Logan",    family_name: "Sargeant",   nationality: "🇺🇸", number: 2,  team: "Williams",     teamColor: "#005AFF", championships: 0, wins: 0,   podiums: 0,   poles: 0,   points_total: 1,    rating: 68, highlight: "First American in F1 Since 2015" },
  { id: 19, code: "BEA", given_name: "Oliver",   family_name: "Bearman",    nationality: "🇬🇧", number: 87, team: "Haas",         teamColor: "#B6BABD", championships: 0, wins: 0,   podiums: 0,   poles: 0,   points_total: 7,    rating: 75, highlight: "Replaced Sainz at Ferrari Age 18" },
  { id: 20, code: "LAW", given_name: "Liam",     family_name: "Lawson",     nationality: "🇳🇿", number: 30, team: "VCARB",        teamColor: "#1E41FF", championships: 0, wins: 0,   podiums: 0,   poles: 0,   points_total: 4,    rating: 73, highlight: "Red Bull Junior Prospect" },
];

// ─── 2025 Grid ───────────────────────────────────────────────────────────────
// Key changes from 2024:
//  • Hamilton: Mercedes → Ferrari  • Sainz: Ferrari → Williams
//  • Lawson: VCARB → Red Bull (replaced Perez)
//  • New: Antonelli (Mercedes), Doohan (Alpine), Bortoleto (Sauber), Hadjar (VCARB)
//  • Out: Perez, Ocon, Magnussen, Sargeant, Zhou
const DRIVERS_2025: DriverData[] = [
  { id: 1,  code: "LEC", given_name: "Charles",  family_name: "Leclerc",    nationality: "🇲🇨", number: 16, team: "Ferrari",      teamColor: "#DC0000", championships: 1, wins: 16,  podiums: 56,  poles: 28,  points_total: 1520, rating: 94, highlight: "2025 World Champion 🏆" },
  { id: 2,  code: "NOR", given_name: "Lando",    family_name: "Norris",     nationality: "🇬🇧", number: 4,  team: "McLaren",      teamColor: "#FF8700", championships: 0, wins: 8,   podiums: 42,  poles: 8,   points_total: 620,  rating: 91, highlight: "McLaren's Race Winner" },
  { id: 3,  code: "PIA", given_name: "Oscar",    family_name: "Piastri",    nationality: "🇦🇺", number: 81, team: "McLaren",      teamColor: "#FF8700", championships: 0, wins: 6,   podiums: 22,  poles: 4,   points_total: 480,  rating: 88, highlight: "McLaren's Rising Star" },
  { id: 4,  code: "VER", given_name: "Max",      family_name: "Verstappen", nationality: "🇳🇱", number: 1,  team: "Red Bull",     teamColor: "#0600EF", championships: 4, wins: 63,  podiums: 112, poles: 41,  points_total: 3260, rating: 96, highlight: "4× World Champion" },
  { id: 5,  code: "RUS", given_name: "George",   family_name: "Russell",    nationality: "🇬🇧", number: 63, team: "Mercedes",     teamColor: "#00D2BE", championships: 0, wins: 4,   podiums: 22,  poles: 6,   points_total: 620,  rating: 86, highlight: "Mercedes Team Leader" },
  { id: 6,  code: "HAM", given_name: "Lewis",    family_name: "Hamilton",   nationality: "🇬🇧", number: 44, team: "Ferrari",      teamColor: "#DC0000", championships: 7, wins: 104, podiums: 199, poles: 104, points_total: 4715, rating: 95, highlight: "7× World Champion at Ferrari" },
  { id: 7,  code: "ANT", given_name: "Kimi",     family_name: "Antonelli",  nationality: "🇮🇹", number: 12, team: "Mercedes",     teamColor: "#00D2BE", championships: 0, wins: 0,   podiums: 2,   poles: 1,   points_total: 0,    rating: 81, highlight: "Mercedes' Future Star" },
  { id: 8,  code: "SAI", given_name: "Carlos",   family_name: "Sainz",      nationality: "🇪🇸", number: 55, team: "Williams",     teamColor: "#005AFF", championships: 0, wins: 4,   podiums: 25,  poles: 6,   points_total: 1082, rating: 85, highlight: "Williams' Championship Contender" },
  { id: 9,  code: "ALO", given_name: "Fernando", family_name: "Alonso",     nationality: "🇪🇸", number: 14, team: "Aston Martin", teamColor: "#006F62", championships: 2, wins: 32,  podiums: 106, poles: 22,  points_total: 2315, rating: 87, highlight: "2× WDC – The Comeback King" },
  { id: 10, code: "STR", given_name: "Lance",    family_name: "Stroll",     nationality: "🇨🇦", number: 18, team: "Aston Martin", teamColor: "#006F62", championships: 0, wins: 0,   podiums: 3,   poles: 1,   points_total: 260,  rating: 72, highlight: "Son of Team Owner" },
  { id: 11, code: "GAS", given_name: "Pierre",   family_name: "Gasly",      nationality: "🇫🇷", number: 10, team: "Alpine",       teamColor: "#0093CC", championships: 0, wins: 1,   podiums: 4,   poles: 0,   points_total: 325,  rating: 78, highlight: "Italian GP 2020 Winner" },
  { id: 12, code: "DOO", given_name: "Jack",     family_name: "Doohan",     nationality: "🇦🇺", number: 7,  team: "Alpine",       teamColor: "#0093CC", championships: 0, wins: 0,   podiums: 0,   poles: 0,   points_total: 0,    rating: 74, highlight: "Alpine's New Recruit" },
  { id: 13, code: "HUL", given_name: "Nico",     family_name: "Hulkenberg", nationality: "🇩🇪", number: 27, team: "Haas",         teamColor: "#B6BABD", championships: 0, wins: 0,   podiums: 0,   poles: 1,   points_total: 530,  rating: 79, highlight: "0 Podiums – Most Starts Without" },
  { id: 14, code: "BEA", given_name: "Oliver",   family_name: "Bearman",    nationality: "🇬🇧", number: 87, team: "Haas",         teamColor: "#B6BABD", championships: 0, wins: 0,   podiums: 0,   poles: 0,   points_total: 7,    rating: 77, highlight: "Haas Full-Time Rookie" },
  { id: 15, code: "ALB", given_name: "Alex",     family_name: "Albon",      nationality: "🇹🇭", number: 23, team: "Williams",     teamColor: "#005AFF", championships: 0, wins: 0,   podiums: 2,   poles: 0,   points_total: 265,  rating: 79, highlight: "Williams' Consistent Scorer" },
  { id: 16, code: "TSU", given_name: "Yuki",     family_name: "Tsunoda",    nationality: "🇯🇵", number: 22, team: "VCARB",        teamColor: "#1E41FF", championships: 0, wins: 0,   podiums: 0,   poles: 0,   points_total: 95,   rating: 76, highlight: "Japan's F1 Star" },
  { id: 17, code: "HAD", given_name: "Isack",    family_name: "Hadjar",     nationality: "🇫🇷", number: 6,  team: "VCARB",        teamColor: "#1E41FF", championships: 0, wins: 0,   podiums: 0,   poles: 0,   points_total: 0,    rating: 75, highlight: "F2 2024 Runner-Up" },
  { id: 18, code: "LAW", given_name: "Liam",     family_name: "Lawson",     nationality: "🇳🇿", number: 30, team: "Red Bull",     teamColor: "#0600EF", championships: 0, wins: 0,   podiums: 2,   poles: 0,   points_total: 28,   rating: 78, highlight: "Red Bull's New #2" },
  { id: 19, code: "BOT", given_name: "Valtteri", family_name: "Bottas",     nationality: "🇫🇮", number: 77, team: "Sauber",       teamColor: "#00E48D", championships: 0, wins: 10,  podiums: 67,  poles: 20,  points_total: 1840, rating: 78, highlight: "Former Mercedes #2" },
  { id: 20, code: "BOR", given_name: "Gabriel",  family_name: "Bortoleto",  nationality: "🇧🇷", number: 5,  team: "Sauber",       teamColor: "#00E48D", championships: 0, wins: 0,   podiums: 0,   poles: 0,   points_total: 0,    rating: 76, highlight: "F2 Champion 2024" },
];

function getBaseDrivers(season: number): DriverData[] {
  if (season >= 2025) return DRIVERS_2025;
  return DRIVERS_2024;
}

const SEASONS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

type SortKey = "points" | "wins" | "podiums" | "rating" | "number";
type ViewMode = "grid" | "list";


// ─── Helpers ─────────────────────────────────────────────────────────────────
function resolveTeamColor(teamName: string, fallback: string): string {
  const entry = TEAM_COLORS[teamName];
  return entry?.primary ?? fallback;
}

function mergeWithErgast(base: DriverData[], standings: ErgastDriverStanding[]): DriverData[] {
  return base.map((d) => {
    const match = standings.find(
      (s) =>
        s.Driver.code?.toUpperCase() === d.code.toUpperCase() ||
        (s.Driver.givenName.toLowerCase() === d.given_name.toLowerCase() &&
          s.Driver.familyName.toLowerCase() === d.family_name.toLowerCase())
    );
    if (!match) return d;
    const teamName = match.Constructors[0]?.name ?? d.team;
    return {
      ...d,
      season_points: Number(match.points),
      season_position: Number(match.position),
      wins: Number(match.wins) || d.wins,
      team: teamName,
      teamColor: resolveTeamColor(teamName, d.teamColor),
    };
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ChampionshipStars({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="flex gap-0.5 items-center">
      {Array.from({ length: Math.min(count, 7) }).map((_, i) => (
        <span key={i} className="text-yellow-400 text-xs">★</span>
      ))}
    </span>
  );
}

interface PodiumCardProps {
  driver: DriverData;
  position: 1 | 2 | 3;
  onClick: () => void;
}

function PodiumCard({ driver, position, onClick }: PodiumCardProps) {
  const heights = { 1: "h-44", 2: "h-32", 3: "h-28" };
  const posLabel = { 1: "P1", 2: "P2", 3: "P3" };
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const order = { 1: "order-2", 2: "order-1", 3: "order-3" };

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 cursor-pointer ${order[position]}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.12, type: "spring", stiffness: 200, damping: 20 }}
      onClick={onClick}
    >
      {/* Helmet preview */}
      <div
        className="relative w-24 h-24 rounded-full overflow-hidden"
        style={{ boxShadow: `0 0 30px ${driver.teamColor}55, 0 0 60px ${driver.teamColor}22` }}
      >
        <Helmet3D teamColor={driver.teamColor} size={0.85} />
      </div>

      {/* Driver code */}
      <div className="text-center">
        <p className="text-2xl font-black italic tracking-tight text-white">{driver.code}</p>
        <p className="text-xs text-neutral-400 font-bold tracking-widest uppercase truncate max-w-[100px]">
          {driver.team}
        </p>
      </div>

      {/* Podium block */}
      <div
        className={`w-28 ${heights[position]} rounded-t-xl flex flex-col items-center justify-end pb-3 gap-1`}
        style={{
          background: `linear-gradient(180deg, ${driver.teamColor}33 0%, ${driver.teamColor}11 100%)`,
          border: `1px solid ${driver.teamColor}44`,
          boxShadow: `inset 0 1px 0 ${driver.teamColor}66`,
        }}
      >
        <span className="text-2xl">{medals[position]}</span>
        <span className="text-xs font-black text-white/70 tracking-widest">{posLabel[position]}</span>
        <span
          className="text-sm font-black font-mono"
          style={{ color: driver.teamColor, textShadow: `0 0 10px ${driver.teamColor}` }}
        >
          {driver.season_points ?? driver.points_total} PTS
        </span>
      </div>
    </motion.div>
  );
}

interface DriverCardProps {
  driver: DriverData;
  index: number;
  onClick: () => void;
}

function DriverCard({ driver, index, onClick }: DriverCardProps) {
  const ratingPct = driver.rating;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 30 }}
      onClick={onClick}
      className="group relative rounded-3xl overflow-hidden cursor-pointer flex flex-col"
      style={{
        background: "linear-gradient(135deg, #0d0d12 0%, #08080d 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 40px rgba(0,0,0,0.6)",
      }}
    >
      {/* Team color top bar */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${driver.teamColor}, transparent)` }}
      />

      {/* Ghost number */}
      <div
        className="absolute -top-4 -right-4 text-[10rem] font-black italic leading-none pointer-events-none select-none transition-opacity duration-500 opacity-[0.04] group-hover:opacity-[0.07]"
        style={{ color: driver.teamColor }}
      >
        {driver.number}
      </div>

      {/* Helmet section */}
      <div className="relative h-44 w-full">
        <Helmet3D teamColor={driver.teamColor} size={0.95} interactive={false} />
        {/* Gradient fade bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#08080d] pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-5 pb-5 flex flex-col gap-3 flex-1">
        {/* Driver name + team dot */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: driver.teamColor, boxShadow: `0 0 6px ${driver.teamColor}` }}
            />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-neutral-400">
              {driver.team}
            </span>
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-white leading-tight group-hover:text-red-400 transition-colors duration-200">
            {driver.given_name} <br />
            <span className="text-3xl">{driver.family_name}</span>
          </h2>
        </div>

        {/* Nationality + championships */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-medium">
            {driver.nationality}
          </span>
          <ChampionshipStars count={driver.championships} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "WIN", value: driver.wins },
            { label: "POD", value: driver.podiums },
            { label: "POLE", value: driver.poles },
            { label: "PTS", value: driver.season_points ?? driver.points_total },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl p-2 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-[8px] font-black tracking-widest text-neutral-500 uppercase">{label}</p>
              <p className="text-sm font-black font-mono text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Rating bar */}
        <div>
          <div className="flex justify-between text-[9px] font-black tracking-widest text-neutral-500 uppercase mb-1.5">
            <span>DRIVER RATING</span>
            <span style={{ color: driver.teamColor }}>{ratingPct}</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ratingPct}%` }}
              transition={{ delay: index * 0.04 + 0.3, duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${driver.teamColor}cc, ${driver.teamColor})`,
                boxShadow: `0 0 8px ${driver.teamColor}88`,
              }}
            />
          </div>
        </div>

        {/* Highlight */}
        <p className="text-[10px] text-neutral-500 font-medium italic border-l-2 pl-2.5 leading-snug"
          style={{ borderColor: driver.teamColor + "88" }}>
          {driver.highlight}
        </p>

        {/* CTA button */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="mt-auto w-full py-2.5 rounded-xl text-[10px] font-black tracking-[0.18em] uppercase transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
          style={{
            background: "rgba(225,6,0,0.12)",
            border: "1px solid rgba(225,6,0,0.25)",
            color: "#ff4444",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#E10600";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#E10600";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(225,6,0,0.12)";
            (e.currentTarget as HTMLButtonElement).style.color = "#ff4444";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(225,6,0,0.25)";
          }}
        >
          VIEW PROFILE
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="translate-x-0 group-hover:translate-x-0.5 transition-transform">
            <path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
        style={{ boxShadow: `inset 0 0 60px ${driver.teamColor}0a` }}
      />
    </motion.div>
  );
}

interface ListRowProps {
  driver: DriverData;
  index: number;
  onClick: () => void;
}

function ListRow({ driver, index, onClick }: ListRowProps) {
  const pts = driver.season_points ?? driver.points_total;
  const maxPts = 575; // approximate 2024 season top
  const barWidth = Math.min(100, Math.round((pts / maxPts) * 100));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="group flex items-center gap-4 px-5 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-white/[0.04]"
      style={{ border: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Position */}
      <span className="text-xs font-black text-neutral-600 w-5 text-right flex-shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Team color bar */}
      <div
        className="w-1 h-8 rounded-full flex-shrink-0"
        style={{ background: driver.teamColor, boxShadow: `0 0 6px ${driver.teamColor}88` }}
      />

      {/* Number */}
      <span
        className="text-lg font-black font-mono w-7 flex-shrink-0"
        style={{ color: driver.teamColor }}
      >
        {driver.number}
      </span>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="font-black italic uppercase text-white text-sm tracking-tight truncate group-hover:text-red-400 transition-colors">
          {driver.given_name} {driver.family_name}
        </p>
        <p className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase truncate">{driver.team}</p>
      </div>

      {/* Nationality */}
      <span className="text-lg flex-shrink-0">{driver.nationality}</span>

      {/* Stats */}
      <div className="hidden sm:flex gap-4 flex-shrink-0">
        {[
          { label: "W", value: driver.wins },
          { label: "POD", value: driver.podiums },
          { label: "RTG", value: driver.rating },
        ].map(({ label, value }) => (
          <div key={label} className="text-center w-10">
            <p className="text-[8px] text-neutral-600 font-black tracking-widest">{label}</p>
            <p className="text-xs font-black font-mono text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Points bar */}
      <div className="flex items-center gap-2 w-32 flex-shrink-0">
        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ delay: index * 0.03 + 0.2, duration: 0.6 }}
            className="h-full rounded-full"
            style={{ background: driver.teamColor }}
          />
        </div>
        <span className="text-xs font-black font-mono text-white w-10 text-right">{pts}</span>
      </div>

      {/* Arrow */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="text-neutral-700 group-hover:text-red-500 transition-colors flex-shrink-0"
      >
        <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

// ─── Unique teams ─────────────────────────────────────────────────────────────
function getUniqueTeams(drivers: DriverData[]): string[] {
  return Array.from(new Set(drivers.map((d) => d.team))).sort();
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DriversPage() {
  const router = useRouter();

  const [season, setSeason] = useState(2025);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("points");
  const [drivers, setDrivers] = useState<DriverData[]>(getBaseDrivers(2025));
  const [loadingApi, setLoadingApi] = useState(false);

  // Fetch live standings from Jolpica for selected season
  useEffect(() => {
    const base = getBaseDrivers(season);
    setDrivers(base);
    setLoadingApi(true);
    fetchDriverStandings(season)
      .then((standings) => {
        if (standings.length) {
          setDrivers(mergeWithErgast(base, standings));
        } else {
          setDrivers(base);
        }
      })
      .catch(() => setDrivers(base))
      .finally(() => setLoadingApi(false));
  }, [season]);

  const teams = useMemo(() => getUniqueTeams(drivers), [drivers]);

  const filtered = useMemo(() => {
    let list = [...drivers];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.given_name.toLowerCase().includes(q) ||
          d.family_name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q)
      );
    }

    if (teamFilter !== "ALL") {
      list = list.filter((d) => d.team === teamFilter);
    }

    list.sort((a, b) => {
      switch (sortKey) {
        case "points":   return (b.season_points ?? b.points_total) - (a.season_points ?? a.points_total);
        case "wins":     return b.wins - a.wins;
        case "podiums":  return b.podiums - a.podiums;
        case "rating":   return b.rating - a.rating;
        case "number":   return a.number - b.number;
        default:         return 0;
      }
    });

    return list;
  }, [drivers, search, teamFilter, sortKey]);

  // Top 3 for podium (by season points)
  const top3 = useMemo(() => {
    const sorted = [...drivers].sort(
      (a, b) => (b.season_points ?? b.points_total) - (a.season_points ?? a.points_total)
    );
    return [sorted[1], sorted[0], sorted[2]] as [DriverData, DriverData, DriverData]; // [P2, P1, P3] layout
  }, [drivers]);

  const podiumPositions: (1 | 2 | 3)[] = [2, 1, 3];

  return (
    <div className="min-h-screen" style={{ background: "#050508" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <header className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <p className="text-[10px] font-black tracking-[0.4em] text-red-600 uppercase mb-2">
                  Formula 1 — Driver Registry
                </p>
                <h1 className="text-6xl sm:text-8xl font-black italic tracking-tighter text-white leading-none">
                  THE{" "}
                  <motion.span
                    key={season}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600"
                  >
                    GRID
                  </motion.span>
                </h1>
                <p className="text-neutral-500 text-sm mt-3 max-w-md">
                  Technical profiles of the world&apos;s fastest athletes.
                  Live data from Ergast API where available.
                </p>
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Season selector */}
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {SEASONS.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSeason(yr)}
                    className="px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-200"
                    style={
                      season === yr
                        ? { background: "#E10600", color: "#fff", boxShadow: "0 0 12px #E1060066" }
                        : { color: "rgba(255,255,255,0.4)" }
                    }
                  >
                    {yr}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {(["grid", "list"] as ViewMode[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200"
                    style={
                      viewMode === v
                        ? { background: "rgba(255,255,255,0.1)", color: "#fff" }
                        : { color: "rgba(255,255,255,0.3)" }
                    }
                  >
                    {v === "grid" ? (
                      <span className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                          <rect x="0" y="0" width="5" height="5" rx="1" />
                          <rect x="7" y="0" width="5" height="5" rx="1" />
                          <rect x="0" y="7" width="5" height="5" rx="1" />
                          <rect x="7" y="7" width="5" height="5" rx="1" />
                        </svg>
                        GRID
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <line x1="0" y1="2" x2="12" y2="2" />
                          <line x1="0" y1="6" x2="12" y2="6" />
                          <line x1="0" y1="10" x2="12" y2="10" />
                        </svg>
                        LIST
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* API loading indicator */}
              {loadingApi && (
                <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-bold tracking-widest">
                  <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
                  LIVE
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── PODIUM ──────────────────────────────────────────────────── */}
        <section>
          <p className="text-[10px] font-black tracking-[0.3em] text-neutral-600 uppercase mb-6">
            Championship Standings — Top 3
          </p>
          <div className="flex items-end justify-center gap-2 sm:gap-6">
            {top3.map((driver, i) =>
              driver ? (
                <PodiumCard
                  key={driver.id}
                  driver={driver}
                  position={podiumPositions[i]}
                  onClick={() => router.push(`/drivers/${driver.id}`)}
                />
              ) : null
            )}
          </div>
        </section>

        {/* ── FILTER BAR ──────────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
              width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
            >
              <circle cx="6" cy="6" r="4" />
              <path d="M9.5 9.5L13 13" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm text-white placeholder-neutral-600 font-medium focus:outline-none focus:border-red-600/50 transition-colors"
            />
          </div>

          {/* Team filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-sm text-white font-bold focus:outline-none focus:border-red-600/50 transition-colors cursor-pointer"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <option value="ALL" style={{ background: "#0d0d12" }}>All Teams</option>
            {teams.map((t) => (
              <option key={t} value={t} style={{ background: "#0d0d12" }}>{t}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-sm text-white font-bold focus:outline-none focus:border-red-600/50 transition-colors cursor-pointer"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <option value="points"  style={{ background: "#0d0d12" }}>Sort: Points</option>
            <option value="wins"    style={{ background: "#0d0d12" }}>Sort: Wins</option>
            <option value="podiums" style={{ background: "#0d0d12" }}>Sort: Podiums</option>
            <option value="rating"  style={{ background: "#0d0d12" }}>Sort: Rating</option>
            <option value="number"  style={{ background: "#0d0d12" }}>Sort: Number</option>
          </select>

          {/* Result count */}
          <div className="flex items-center px-4 rounded-xl text-xs font-black text-neutral-500 tracking-widest whitespace-nowrap"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            {filtered.length} DRIVERS
          </div>
        </div>

        {/* ── DRIVERS ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              <AnimatePresence>
                {filtered.map((driver, i) => (
                  <DriverCard
                    key={driver.id}
                    driver={driver}
                    index={i}
                    onClick={() => router.push(`/drivers/${driver.id}`)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {/* List header */}
              <div className="hidden sm:grid grid-cols-[24px_4px_28px_1fr_32px_100px_120px_24px] gap-4 px-5 py-2 text-[9px] font-black tracking-[0.2em] text-neutral-600 uppercase">
                <span>#</span>
                <span />
                <span>NO</span>
                <span>DRIVER</span>
                <span>NAT</span>
                <span className="text-right">STATS</span>
                <span className="text-right">POINTS</span>
                <span />
              </div>
              <AnimatePresence>
                {filtered.map((driver, i) => (
                  <ListRow
                    key={driver.id}
                    driver={driver}
                    index={i}
                    onClick={() => router.push(`/drivers/${driver.id}`)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 text-neutral-600"
          >
            <p className="text-5xl mb-4">🏁</p>
            <p className="text-sm font-black tracking-widest uppercase">No drivers match your filters</p>
          </motion.div>
        )}

        {/* ── FOOTER NOTE ─────────────────────────────────────────────── */}
        <footer className="text-center pt-8 border-t border-white/[0.04]">
          <p className="text-[10px] font-bold tracking-widest text-neutral-700 uppercase">
            Career stats from hardcoded 2024 data · Season points live from Ergast API
          </p>
        </footer>
      </div>
    </div>
  );
}
