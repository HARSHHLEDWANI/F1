"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { searchDriverWikipedia } from "@/lib/wikipedia";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Trophy,
  ChevronLeft,
  Globe,
  Award,
  Flag,
  Star,
  Zap,
  Target,
} from "lucide-react";

// ── Dynamic 3D helmet import (no SSR) ────────────────────────────────────────
const Helmet3D = dynamic(() => import("@/components/3d/Helmet3D"), { ssr: false });

// ── Team color map ────────────────────────────────────────────────────────────
const TEAM_COLORS: Record<string, string> = {
  "Red Bull":    "#0600EF",
  "McLaren":     "#FF8700",
  "Ferrari":     "#DC0000",
  "Mercedes":    "#00D2BE",
  "Aston Martin":"#006F62",
  "Alpine":      "#0093CC",
  "Williams":    "#005AFF",
  "VCARB":       "#1E41FF",
  "Haas":        "#B6BABD",
  "Sauber":      "#00E48D",
};

function getTeamColor(team?: string): string {
  if (!team) return "#E10600";
  for (const key of Object.keys(TEAM_COLORS)) {
    if (team.toLowerCase().includes(key.toLowerCase())) return TEAM_COLORS[key];
  }
  return "#E10600";
}

// ── Nationality flag helper ───────────────────────────────────────────────────
const NATIONALITY_FLAGS: Record<string, string> = {
  Dutch: "🇳🇱", British: "🇬🇧", Monégasque: "🇲🇨", Australian: "🇦🇺",
  Spanish: "🇪🇸", German: "🇩🇪", Finnish: "🇫🇮", French: "🇫🇷",
  Mexican: "🇲🇽", Canadian: "🇨🇦", Japanese: "🇯🇵", Thai: "🇹🇭",
  American: "🇺🇸", Danish: "🇩🇰", Chinese: "🇨🇳", Italian: "🇮🇹",
  New Zealander: "🇳🇿",
};

function getNationalityFlag(nationality: string): string {
  return NATIONALITY_FLAGS[nationality] ?? "🏁";
}

// ── Circular rating gauge ─────────────────────────────────────────────────────
function RatingGauge({ value, color }: { value: number; color: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={128} height={128} className="-rotate-90">
        {/* Track */}
        <circle
          cx={64} cy={64} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth={10}
        />
        {/* Progress */}
        <motion.circle
          cx={64} cy={64} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{value}</span>
        <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Rating</span>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, unit, icon: Icon, accent,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group"
    >
      {/* Accent glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(ellipse at top left, ${accent}18, transparent 60%)` }}
      />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}20`, boxShadow: `0 0 12px ${accent}30` }}
        >
          <Icon size={16} style={{ color: accent }} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-white">{value}</span>
        {unit && <span className="text-xs text-neutral-500 font-bold">{unit}</span>}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mt-1">{label}</p>
    </motion.div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Driver {
  id: number;
  given_name: string;
  family_name: string;
  nationality: string;
  number?: number;
  team?: string;
  championships: number;
  wins: number;
  podiums: number;
  poles: number;
  points_total: number;
  rating: number;
  image_url?: string;
}

interface WikipediaData {
  title: string;
  extract: string;
  image?: { source: string };
  url?: string;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DriverDetailPage() {
  const { loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const driverId = params?.id as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [wikipediaData, setWikipediaData] = useState<WikipediaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDriverData = async () => {
      try {
        setLoading(true);
        setError(null);

        const driversResponse = await apiFetch("/drivers");
        const driverList = Array.isArray(driversResponse) ? driversResponse : [driversResponse];
        const selectedDriver = driverList.find((d: Driver) => d.id === parseInt(driverId));

        if (!selectedDriver) {
          setError("Driver not found");
          return;
        }

        setDriver(selectedDriver);

        const wikiData = await searchDriverWikipedia(
          selectedDriver.given_name,
          selectedDriver.family_name
        );

        if (wikiData) {
          const wikiUrl =
            wikiData.content_urls?.desktop?.page ||
            `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiData.title.replace(/ /g, "_"))}`;
          setWikipediaData({
            title: wikiData.title,
            extract: wikiData.extract || "",
            image: wikiData.image,
            url: wikiUrl,
          });
        }
      } catch (err) {
        console.error("[Driver] Error:", err);
        setError("Failed to load driver information");
      } finally {
        setLoading(false);
      }
    };

    if (driverId) loadDriverData();
  }, [driverId]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Loading Driver</p>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">{error || "Driver not found"}</h1>
          <button
            onClick={() => router.back()}
            className="btn-tactile px-6 py-3 rounded-2xl bg-white text-black font-black uppercase flex items-center gap-2 justify-center mx-auto hover:bg-red-600 hover:text-white transition-all"
          >
            <ChevronLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const teamColor = getTeamColor(driver.team);
  const flag = getNationalityFlag(driver.nationality);

  return (
    <div className="min-h-screen bg-[#050508]">

      {/* ── HERO BANNER ────────────────────────────────────────────────────────── */}
      <div className="relative w-full min-h-120 overflow-hidden">
        {/* Carbon fiber texture + team gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(135deg, ${teamColor}30 0%, transparent 50%, ${teamColor}18 100%),
              repeating-linear-gradient(
                45deg,
                rgba(255,255,255,0.015) 0px,
                rgba(255,255,255,0.015) 1px,
                transparent 1px,
                transparent 8px
              ),
              repeating-linear-gradient(
                -45deg,
                rgba(255,255,255,0.015) 0px,
                rgba(255,255,255,0.015) 1px,
                transparent 1px,
                transparent 8px
              )
            `,
            backgroundColor: "#0d0d14",
          }}
        />
        {/* Bottom fade to page */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-[#050508] to-transparent z-10" />
        {/* Team color glow at bottom */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 z-10 blur-3xl"
          style={{ background: `${teamColor}25` }}
        />

        {/* Driver number ghost */}
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center pr-8 z-0 select-none pointer-events-none"
          style={{
            fontSize: "clamp(200px, 28vw, 380px)",
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: `1px ${teamColor}22`,
            letterSpacing: "-0.05em",
          }}
        >
          {driver.number ?? "0"}
        </div>

        {/* Driver image */}
        {driver.image_url && (
          <div className="absolute inset-0 flex items-end justify-center z-5">
            <img
              src={driver.image_url}
              alt={`${driver.given_name} ${driver.family_name}`}
              className="h-[90%] max-h-105 object-contain object-bottom"
              style={{ filter: "drop-shadow(0 0 60px rgba(0,0,0,0.8))" }}
            />
          </div>
        )}

        {/* Back button */}
        <div className="absolute top-24 left-6 z-20">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-all group bg-black/30 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back</span>
          </button>
        </div>

        {/* Driver identity overlay */}
        <div className="absolute bottom-16 left-6 md:left-12 z-20 max-w-xl">
          {/* Team badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[10px] font-black uppercase tracking-widest"
            style={{
              background: `${teamColor}25`,
              border: `1px solid ${teamColor}60`,
              color: teamColor,
              boxShadow: `0 0 20px ${teamColor}30`,
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: teamColor }} />
            {driver.team || "Formula 1"}
          </div>

          {/* Driver name */}
          <h1
            className="font-black italic uppercase leading-none tracking-tighter"
            style={{ fontSize: "clamp(40px, 8vw, 96px)" }}
          >
            <span className="text-white block">{driver.given_name}</span>
            <span className="block" style={{ color: teamColor, textShadow: `0 0 40px ${teamColor}80` }}>
              {driver.family_name}
            </span>
          </h1>

          {/* Nationality + championships */}
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm font-bold text-neutral-300 flex items-center gap-2">
              <span className="text-xl">{flag}</span> {driver.nationality}
            </span>
            {driver.championships > 0 && (
              <div className="flex items-center gap-1">
                {[...Array(Math.min(driver.championships, 7))].map((_, i) => (
                  <Trophy key={i} size={16} fill="#facc15" className="text-yellow-400" />
                ))}
                <span className="text-xs text-yellow-400 font-bold ml-1">
                  {driver.championships}× CHAMPION
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16 space-y-10 mt-8">

        {/* ── STATS GRID ── */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-black mb-5 flex items-center gap-2">
            <Award size={13} className="text-[#E10600]" />
            Career Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              label="Championships"
              value={driver.championships}
              icon={Trophy}
              accent="#facc15"
            />
            <StatCard
              label="Career Wins"
              value={driver.wins}
              unit="races"
              icon={Flag}
              accent={teamColor}
            />
            <StatCard
              label="Total Podiums"
              value={driver.podiums}
              unit="total"
              icon={Award}
              accent="#E10600"
            />
            <StatCard
              label="Pole Positions"
              value={driver.poles}
              unit="poles"
              icon={Zap}
              accent="#a855f7"
            />
          </div>
        </section>

        {/* ── PERFORMANCE + HELMET ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-4xl p-7 border border-white/5 md:col-span-2 space-y-6"
          >
            <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400 font-black flex items-center gap-2">
              <Target size={13} className="text-[#E10600]" />
              Performance Profile
            </h2>

            <div className="flex items-center gap-8">
              <RatingGauge value={driver.rating} color={teamColor} />

              <div className="flex-1 space-y-4">
                {/* Form bar */}
                <div>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-black mb-2">
                    <span className="text-neutral-500">Performance Score</span>
                    <span style={{ color: teamColor }}>{driver.rating}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${driver.rating}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${teamColor}, ${teamColor}aa)`,
                        boxShadow: `0 0 12px ${teamColor}60`,
                      }}
                    />
                  </div>
                </div>

                {/* Career points */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="glass-card rounded-xl p-4 border border-white/5 flex-1 text-center">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-black mb-1">
                      Career Points
                    </p>
                    <p className="text-2xl font-black text-white">{driver.points_total}</p>
                  </div>
                  <div className="glass-card rounded-xl p-4 border border-white/5 flex-1 text-center">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-black mb-1">
                      Race Number
                    </p>
                    <p className="text-2xl font-black" style={{ color: teamColor }}>
                      #{driver.number ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3D Helmet */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-4xl border border-white/5 overflow-hidden relative"
            style={{ minHeight: 260 }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(ellipse at center, ${teamColor}30, transparent 70%)`,
              }}
            />
            <div className="absolute top-4 left-4 z-10">
              <span className="text-[9px] uppercase tracking-widest font-black text-neutral-500 bg-black/40 backdrop-blur px-2 py-1 rounded-lg">
                3D Helmet
              </span>
            </div>
            <div className="w-full h-full" style={{ minHeight: 260 }}>
              <Helmet3D teamColor={teamColor} size={1.1} interactive />
            </div>
          </motion.div>
        </section>

        {/* ── WIKIPEDIA BIO ── */}
        {wikipediaData && wikipediaData.extract ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-card rounded-4xl p-7 border border-white/5 relative overflow-hidden">
              {/* Quote decoration */}
              <div
                className="absolute top-6 right-8 text-[120px] font-black leading-none select-none pointer-events-none"
                style={{ color: `${teamColor}12`, fontFamily: "Georgia, serif" }}
              >
                "
              </div>

              <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400 font-black flex items-center gap-2 mb-6">
                <Globe size={13} className="text-[#E10600]" />
                Biography
              </h2>

              {wikipediaData.image && (
                <img
                  src={wikipediaData.image.source}
                  alt={driver.family_name}
                  className="w-full max-h-72 object-cover rounded-2xl mb-6 border border-white/5"
                />
              )}

              <p className="text-neutral-300 leading-relaxed text-base relative z-10 mb-6">
                {wikipediaData.extract}
              </p>

              <a
                href={wikipediaData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all hover:opacity-80"
                style={{
                  background: `${teamColor}20`,
                  border: `1px solid ${teamColor}40`,
                  color: teamColor,
                }}
              >
                Read Full Article <Globe size={12} />
              </a>
            </div>
          </motion.section>
        ) : !wikipediaData ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-card rounded-4xl p-7 border border-white/5">
              <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400 font-black flex items-center gap-2 mb-4">
                <Globe size={13} className="text-[#E10600]" />
                Biography
              </h2>
              <div className="flex items-center gap-3 text-neutral-500">
                <div className="w-4 h-4 border border-neutral-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-sm">Loading biography from Wikipedia…</span>
              </div>
            </div>
          </motion.section>
        ) : null}
      </div>
    </div>
  );
}
