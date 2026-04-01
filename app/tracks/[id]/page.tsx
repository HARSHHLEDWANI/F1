"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { searchTrackWikipedia } from "@/lib/wikipedia";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  MapPin,
  ChevronLeft,
  Globe,
  Gauge,
  Zap,
  Flag,
  Clock,
  BarChart2,
  Activity,
} from "lucide-react";

// ── Dynamic circuit minimap (no SSR — uses SVG path APIs) ────────────────────
const CircuitMinimap = dynamic(() => import("@/components/3d/CircuitMinimap"), { ssr: false });

// ── Default oval path for tracks without a specific path ─────────────────────
const DEFAULT_CIRCUIT_PATH =
  "M 60 160 Q 60 40 160 40 L 260 40 Q 360 40 360 100 L 360 160 Q 360 220 260 220 L 160 220 Q 60 220 60 160 Z";

// ── Country flags ─────────────────────────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
  Australia: "🇦🇺", Bahrain: "🇧🇭", "Saudi Arabia": "🇸🇦", Japan: "🇯🇵",
  China: "🇨🇳", USA: "🇺🇸", "United States": "🇺🇸", Italy: "🇮🇹",
  Monaco: "🇲🇨", Canada: "🇨🇦", Spain: "🇪🇸", Austria: "🇦🇹",
  "United Kingdom": "🇬🇧", Hungary: "🇭🇺", Belgium: "🇧🇪", Netherlands: "🇳🇱",
  Azerbaijan: "🇦🇿", Singapore: "🇸🇬", Mexico: "🇲🇽", Brazil: "🇧🇷",
  "Abu Dhabi": "🇦🇪", UAE: "🇦🇪", Qatar: "🇶🇦", "Las Vegas": "🇺🇸",
  Miami: "🇺🇸",
};

function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? "🏁";
}

// ── Difficulty helpers ────────────────────────────────────────────────────────
function getDifficultyLabel(d: number): "Easy" | "Medium" | "Hard" {
  if (d <= 33) return "Easy";
  if (d <= 66) return "Medium";
  return "Hard";
}

function getDifficultyColor(label: "Easy" | "Medium" | "Hard"): string {
  return label === "Easy" ? "#22c55e" : label === "Medium" ? "#eab308" : "#ef4444";
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, unit, sub, icon: Icon, accent,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group"
    >
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
        <span className="text-2xl font-black text-white">{value}</span>
        {unit && <span className="text-xs text-neutral-500 font-bold">{unit}</span>}
      </div>
      {sub && <p className="text-[10px] text-neutral-500 font-bold mt-0.5">{sub}</p>}
      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mt-1">{label}</p>
    </motion.div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Track {
  id: number;
  name: string;
  locality: string;
  country: string;
  lat?: number;
  lng?: number;
  lap_distance?: number;
  laps?: number;
  lap_record_time?: string;
  lap_record_holder?: string;
  lap_record_year?: number;
  track_type?: string;
  drs_zones?: number;
  image_url?: string;
  difficulty?: number;
}

interface WikipediaData {
  title: string;
  extract: string;
  image?: { source: string };
  url?: string;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TrackDetailPage() {
  const { loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const trackId = params?.id as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [wikipediaData, setWikipediaData] = useState<WikipediaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrackData = async () => {
      try {
        setLoading(true);
        setError(null);

        let selectedTrack;
        try {
          selectedTrack = await apiFetch(`/tracks/${trackId}`);
        } catch {
          const tracksResponse = await apiFetch("/tracks");
          const trackList = Array.isArray(tracksResponse) ? tracksResponse : [tracksResponse];
          selectedTrack = trackList.find((t: Track) => t.id === parseInt(trackId));
        }

        if (!selectedTrack) {
          setError("Track not found");
          return;
        }

        setTrack(selectedTrack);

        const wikiData = await searchTrackWikipedia(selectedTrack.name);
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
        console.error("[Track] Error:", err);
        setError("Failed to load track information");
      } finally {
        setLoading(false);
      }
    };

    if (trackId) loadTrackData();
  }, [trackId]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Loading Circuit</p>
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">{error || "Track not found"}</h1>
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

  const difficulty = track.difficulty ?? 50;
  const diffLabel = getDifficultyLabel(difficulty);
  const diffColor = getDifficultyColor(diffLabel);
  const flag = getCountryFlag(track.country);
  const isStreet = track.track_type?.toLowerCase().includes("street") ?? false;

  // Build DRS zone fractions for the minimap (evenly spaced across the path)
  const drsZoneCount = track.drs_zones ?? 0;
  const drsZones: [number, number][] = Array.from({ length: drsZoneCount }, (_, i) => {
    const step = 1 / drsZoneCount;
    const start = i * step + 0.05;
    const end = start + step * 0.18;
    return [Math.min(start, 0.95), Math.min(end, 0.99)];
  });

  return (
    <div className="min-h-screen bg-[#050508]">

      {/* ── HERO BANNER ────────────────────────────────────────────────────────── */}
      <div className="relative w-full min-h-96 overflow-hidden">
        {/* Background: asphalt texture + gradient */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(225,6,0,0.12) 0%, transparent 55%, rgba(225,6,0,0.06) 100%),
              repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.012) 0px,
                rgba(255,255,255,0.012) 1px,
                transparent 1px,
                transparent 6px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(255,255,255,0.012) 0px,
                rgba(255,255,255,0.012) 1px,
                transparent 1px,
                transparent 6px
              )
            `,
            backgroundColor: "#0a0a12",
          }}
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-[#050508] to-transparent z-10" />
        {/* Red glow at bottom center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-28 z-10 blur-3xl bg-red-600/10" />

        {/* Track image if available */}
        {track.image_url && (
          <div className="absolute inset-0 z-0">
            <img
              src={track.image_url}
              alt={track.name}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-linear-to-b from-[#0a0a12]/60 to-[#050508]" />
          </div>
        )}

        {/* Circuit minimap — centered */}
        <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
          <div className="opacity-30">
            <CircuitMinimap
              path={DEFAULT_CIRCUIT_PATH}
              drsZones={drsZones}
              color="#E10600"
              width={420}
              height={280}
            />
          </div>
        </div>

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

        {/* Hero identity */}
        <div className="absolute bottom-14 left-6 md:left-12 z-20 max-w-2xl">
          {/* Badges row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-[#E10600]/15 border-[#E10600]/40 text-[#E10600]">
              {isStreet ? "STREET CIRCUIT" : "PERMANENT CIRCUIT"}
            </span>
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{
                background: `${diffColor}18`,
                borderColor: `${diffColor}50`,
                color: diffColor,
              }}
            >
              {diffLabel} — {difficulty}%
            </span>
          </div>

          {/* Track name */}
          <h1
            className="font-black italic uppercase leading-none tracking-tighter text-white"
            style={{ fontSize: "clamp(32px, 6vw, 80px)" }}
          >
            {track.name}
          </h1>

          {/* Country + locality */}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-2xl">{flag}</span>
            <div>
              <p className="text-neutral-300 font-bold text-sm">{track.locality}</p>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">{track.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16 space-y-10 mt-8">

        {/* ── KEY STATS GRID ── */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-black mb-5 flex items-center gap-2">
            <BarChart2 size={13} className="text-[#E10600]" />
            Circuit Specifications
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              label="Total Laps"
              value={track.laps ?? "—"}
              unit="laps"
              icon={Flag}
              accent="#E10600"
            />
            <StatCard
              label="Circuit Length"
              value={(track.lap_distance ?? 0).toFixed(3)}
              unit="km"
              icon={Activity}
              accent="#00d2be"
            />
            <StatCard
              label="Lap Record"
              value={track.lap_record_time ?? "N/A"}
              sub={track.lap_record_holder ?? undefined}
              icon={Clock}
              accent="#facc15"
            />
            <StatCard
              label="DRS Zones"
              value={track.drs_zones ?? 0}
              unit="zones"
              icon={Zap}
              accent="#a855f7"
            />
            <StatCard
              label="Track Type"
              value={isStreet ? "Street" : "Permanent"}
              icon={MapPin}
              accent="#0093CC"
            />
            <StatCard
              label="Difficulty"
              value={diffLabel}
              sub={`${difficulty}%`}
              icon={Gauge}
              accent={diffColor}
            />
          </div>
        </section>

        {/* ── CIRCUIT MINIMAP + DIFFICULTY ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Minimap card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-4xl p-6 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center"
            style={{ minHeight: 320 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,6,0,0.06),transparent_70%)]" />
            <div className="absolute top-4 left-5 z-10">
              <span className="text-[9px] uppercase tracking-widest font-black text-neutral-500 bg-black/40 backdrop-blur px-2 py-1 rounded-lg">
                Circuit Map
              </span>
            </div>
            {/* Legend */}
            <div className="absolute top-4 right-5 z-10 flex flex-col gap-1">
              <span className="text-[8px] uppercase tracking-widest font-black text-[#e10600] flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#e10600] rounded-full inline-block" /> Track
              </span>
              {drsZoneCount > 0 && (
                <span className="text-[8px] uppercase tracking-widest font-black text-[#00d2ff] flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-[#00d2ff] rounded-full inline-block" /> DRS
                </span>
              )}
            </div>
            <CircuitMinimap
              path={DEFAULT_CIRCUIT_PATH}
              drsZones={drsZones}
              color="#E10600"
              width={380}
              height={240}
            />
            <p className="text-[9px] uppercase tracking-widest font-black text-neutral-600 mt-4">
              Animated circuit · {drsZoneCount} DRS zone{drsZoneCount !== 1 ? "s" : ""}
            </p>
          </motion.div>

          {/* Difficulty + lap record */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-4xl p-7 border border-white/5 space-y-7"
          >
            {/* Difficulty rating */}
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] text-neutral-400 font-black flex items-center gap-2 mb-5">
                <Gauge size={13} className="text-[#E10600]" />
                Circuit Difficulty
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: `${diffColor}20`, color: diffColor }}
                >
                  {diffLabel}
                </span>
                <span className="text-2xl font-black" style={{ color: diffColor }}>
                  {difficulty}%
                </span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${difficulty}%` }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${diffColor}, ${diffColor}aa)`,
                    boxShadow: `0 0 10px ${diffColor}60`,
                  }}
                />
              </div>
              {/* Markers */}
              <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-neutral-600 mt-2">
                <span>Easy</span>
                <span>Medium</span>
                <span>Hard</span>
              </div>
            </div>

            {/* Lap record */}
            <div className="border-t border-white/5 pt-6">
              <h3 className="text-sm uppercase tracking-[0.2em] text-neutral-400 font-black flex items-center gap-2 mb-5">
                <Clock size={13} className="text-[#E10600]" />
                Fastest Lap Record
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-black mb-1">Time</p>
                  <p className="text-3xl font-black text-white font-mono tracking-tight">
                    {track.lap_record_time ?? "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-black mb-1">Driver</p>
                    <p className="text-base font-bold text-neutral-200">
                      {track.lap_record_holder ?? "Unknown"}
                    </p>
                  </div>
                  {track.lap_record_year && (
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-black mb-1">Year</p>
                      <p className="text-base font-bold text-neutral-200">{track.lap_record_year}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── WIKIPEDIA DESCRIPTION ── */}
        {wikipediaData && wikipediaData.extract ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-card rounded-4xl p-7 border border-white/5 relative overflow-hidden">
              {/* Decorative quote mark */}
              <div
                className="absolute top-4 right-8 text-[120px] font-black leading-none select-none pointer-events-none opacity-5"
                style={{ fontFamily: "Georgia, serif", color: "#E10600" }}
              >
                "
              </div>

              <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400 font-black flex items-center gap-2 mb-6">
                <Globe size={13} className="text-[#E10600]" />
                Circuit Information
              </h2>

              {wikipediaData.image && (
                <img
                  src={wikipediaData.image.source}
                  alt={track.name}
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all hover:opacity-80 bg-[#E10600]/15 border border-[#E10600]/30 text-[#E10600]"
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
                Circuit Information
              </h2>
              <div className="flex items-center gap-3 text-neutral-500">
                <div className="w-4 h-4 border border-neutral-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-sm">Loading circuit information from Wikipedia…</span>
              </div>
            </div>
          </motion.section>
        ) : null}
      </div>
    </div>
  );
}
