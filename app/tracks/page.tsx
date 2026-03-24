"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { MapPin, Zap, TrendingUp, ChevronRight } from "lucide-react";

interface Track {
  id: number;
  name: string;
  locality: string;
  country: string;
  lap_distance?: number;
  laps?: number;
  track_type?: string;
  drs_zones?: number;
  difficulty?: number;
  lap_record_time?: string;
  lap_record_holder?: string;
  image_url?: string;
}

export default function TracksPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/tracks");
        console.log("Fetched Tracks:", data);
        const list = Array.isArray(data) ? data : [];
        setTracks(list);
        if (!list.length) {
          setError("No tracks found. Please seed tracks in backend.");
        } else {
          setError(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load tracks";
        console.error("Error loading tracks:", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    loadTracks();
  }, []);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6">
        <p className="text-xl mb-4">{error}</p>
        <p className="text-sm text-gray-400">Reload after confirming the backend dataset is loaded.</p>
      </div>
    );
  }

  if (!tracks.length) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6">
        <p className="text-xl mb-2">No tracks available yet.</p>
        <p className="text-sm text-gray-400">Run backend load scripts to seed track data.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-16">
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
          THE <span className="text-red-600 font-normal not-italic">24</span> CIRCUITS
        </h1>
        <p className="text-neutral-400 max-w-xl text-lg">
          Iconic F1 racing venues from Monaco's narrow streets to drag racing at Las Vegas.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -10 }}
            onClick={() => router.push(`/tracks/${track.id}`)}
            className="glass-card group relative rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col cursor-pointer"
          >
            {/* TRACK IMAGE */}
            {track.image_url && (
              <div className="relative w-full h-48 overflow-hidden bg-black/40">
                <img
                  src={track.image_url}
                  alt={track.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
              </div>
            )}

            {/* CONTENT */}
            <div className="p-8 flex flex-col h-full">
              {/* GHOST DIFFICULTY BACKGROUND */}
              <div className="absolute top-8 right-8 text-6xl font-black italic text-white/[0.03] leading-none pointer-events-none group-hover:text-red-600/5 transition-colors duration-500">
                {track.difficulty || 50}
              </div>

              {/* TOP INFO */}
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-red-500 font-mono text-sm font-bold">
                    {track.country}
                  </span>
                  <span className="text-neutral-400 text-xs">{track.locality}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 border border-red-600/30 rounded-full">
                  <Zap size={12} className="text-red-500" />
                  <span className="text-xs font-bold text-red-500">
                    {track.drs_zones || 0} DRS
                  </span>
                </div>
              </div>

              <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-tight mb-2 text-white group-hover:text-red-500 transition-colors">
                {track.name}
              </h2>
              <p className="text-neutral-500 text-xs font-bold tracking-widest uppercase mb-8">
                {track.track_type || "Circuit"}
              </p>

              {/* STATS HUD */}
              <div className="space-y-6 flex-1">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase text-neutral-400 mb-2 tracking-widest">
                    <span>Track Difficulty</span>
                    <span>{track.difficulty || 50}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${track.difficulty || 50}%` }}
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">
                      Lap Distance
                    </p>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-neutral-400" />
                      <span className="font-mono font-bold">
                        {(track.lap_distance || 0).toFixed(2)}km
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">
                      Race Laps
                    </p>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-neutral-400" />
                      <span className="font-mono font-bold">{track.laps || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/tracks/${track.id}`);
                }}
                className="mt-8 btn-tactile w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-tighter text-xs flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all"
              >
                Track Telemetry <ChevronRight size={14} />
              </button>
              </div>
            </div>

            {/* Subtle Gradient Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
