"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { Trophy, Target, Star, ChevronRight } from "lucide-react";

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

export default function DriversPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/drivers");
      console.log("Fetched Drivers:", data);
      const list = Array.isArray(data) ? data : [];
      setDrivers(list);
      if (!list.length) {
        setError("No drivers found. Please ensure the backend has driver data.");
      } else {
        setError(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load drivers";
      console.error("Drivers fetch error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  loadDrivers();
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
        <p className="text-sm text-gray-400">Reload the page after confirming the backend data is present.</p>
      </div>
    );
  }

  if (!drivers.length) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6">
        <p className="text-xl mb-2">No drivers available yet.</p>
        <p className="text-sm text-gray-400">Run backend data loader scripts to populate drivers.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-16">
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
          THE <span className="text-red-600 font-normal not-italic">20</span> GRID
        </h1>
        <p className="text-neutral-400 max-w-xl text-lg">
          Detailed technical profiles of the world's fastest athletes. 
          Real-time rating adjustments based on recent performance.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {drivers.map((driver, index) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => router.push(`/drivers/${driver.id}`)}
            className="glass-card group relative rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col cursor-pointer"
          >
            {/* DRIVER IMAGE */}
            {driver.image_url && (
              <div className="relative w-full h-48 overflow-hidden bg-black/40">
                <img
                  src={driver.image_url}
                  alt={`${driver.given_name} ${driver.family_name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
              </div>
            )}

            {/* CONTENT */}
            <div className="p-8 flex flex-col h-full">
              {/* GHOST NUMBER BACKGROUND */}
              <div className="absolute top-0 right-0 -mr-4 -mt-4 text-[14rem] font-black italic text-white/[0.03] leading-none pointer-events-none group-hover:text-red-600/5 transition-colors duration-500">
                {driver.number || "?"}
              </div>

              {/* TOP INFO */}
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                <span className="text-red-500 font-mono text-sm font-bold">#{driver.number || "?"}</span>
                <div className="flex gap-1">
                  {[...Array(driver.championships)].map((_, i) => (
                    <Trophy key={i} size={14} className="text-yellow-500" fill="currentColor" />
                  ))}
                </div>
              </div>

              <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-tight mb-1 text-white group-hover:text-red-500 transition-colors">
                {driver.given_name || "Unknown"}
                 <br />
                 {driver.family_name || "Driver"}
              </h2>
              <p className="text-neutral-500 text-xs font-bold tracking-widest uppercase mb-8">
                {driver.team || "TBA"}
              </p>

              {/* STATS HUD */}
              <div className="space-y-6 flex-1">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase text-neutral-400 mb-2 tracking-widest">
                    <span>Performance Rating</span>
                    <span>{driver.rating}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${driver.rating}%` }}
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Career Wins</p>
                    <div className="flex items-center gap-2">
                      <Star size={14} className="text-neutral-400" />
                      <span className="font-mono font-bold">{driver.wins}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Total Pts</p>
                    <div className="flex items-center gap-2">
                      <Target size={14} className="text-neutral-400" />
                      <span className="font-mono font-bold">{driver.points_total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/drivers/${driver.id}`);
                }}
                className="mt-8 btn-tactile w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-tighter text-xs flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all"
              >
                Full Telemetry Report <ChevronRight size={14} />
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