"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { searchDriverWikipedia } from "@/lib/wikipedia";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Star,
  ChevronLeft,
  Globe,
  Award,
  TrendingUp,
} from "lucide-react";

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
  image?: {
    source: string;
  };
  url?: string;
}

export default function DriverTelemetryPage() {
  const { loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const driverId = params?.id as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [wikipediaData, setWikipediaData] = useState<WikipediaData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDriverData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch driver from backend
        const driversResponse = await apiFetch("/drivers");
        const driverList = Array.isArray(driversResponse)
          ? driversResponse
          : [driversResponse];
        const selectedDriver = driverList.find(
          (d: Driver) => d.id === parseInt(driverId)
        );

        if (!selectedDriver) {
          setError("Driver not found");
          return;
        }

        console.log("[Telemetry] Driver loaded:", selectedDriver);
        setDriver(selectedDriver);

        // Fetch Wikipedia data in parallel
        console.log("[Telemetry] Fetching Wikipedia data...");
        const wikiData = await searchDriverWikipedia(
          selectedDriver.given_name,
          selectedDriver.family_name
        );

        if (wikiData) {
          console.log("[Telemetry] Wikipedia data received:", {
            title: wikiData.title,
            hasExtract: !!wikiData.extract,
            hasImage: !!wikiData.image,
          });
          
          // Build Wikipedia URL - prefer API-provided URL, fallback to constructing from title
          const wikiUrl = wikiData.content_urls?.desktop?.page || 
            `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiData.title.replace(/ /g, "_"))}`;
          
          setWikipediaData({
            title: wikiData.title,
            extract: wikiData.extract || "",
            image: wikiData.image,
            url: wikiUrl,
          });
        } else {
          console.warn("[Telemetry] No Wikipedia data found");
        }
      } catch (err) {
        console.error("[Telemetry] Error loading driver data:", err);
        setError("Failed to load driver information");
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      loadDriverData();
    }
  }, [driverId]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            {error || "Driver not found"}
          </h1>
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

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Hero Image Banner */}
      {driver.image_url && (
        <div className="w-full h-80 relative overflow-hidden mb-0">
          <img
            src={driver.image_url}
            alt={`${driver.given_name} ${driver.family_name}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050508]" />
        </div>
      )}

      {/* Header with back button */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft size={20} />
          Back to Grid
        </button>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Driver Info Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[2.5rem] p-8 border border-white/5 md:col-span-1"
          >
            <div className="flex flex-col items-center text-center">
              {/* Driver Number Badge */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center mb-6">
                <span className="text-3xl font-black text-white">
                  #{driver.number || "?"}
                </span>
              </div>

              {/* Driver Name */}
              <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">
                {driver.given_name}
                <br />
                {driver.family_name}
              </h1>

              {/* Team and Nationality */}
              <div className="mt-6 space-y-2 border-t border-white/5 pt-6 w-full">
                <p className="text-neutral-400 text-sm">
                  <span className="font-bold text-white block mb-1">Team</span>
                  {driver.team || "TBA"}
                </p>
                <p className="text-neutral-400 text-sm">
                  <span className="font-bold text-white block mb-1">
                    Nationality
                  </span>
                  {driver.nationality}
                </p>
              </div>

              {/* Championships Badge */}
              {driver.championships > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5 w-full">
                  <div className="flex items-center justify-center gap-2 text-yellow-500">
                    {[...Array(driver.championships)].map((_, i) => (
                      <Trophy key={i} size={20} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-400 mt-2">
                    {driver.championships} World Championship
                    {driver.championships !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Career Statistics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-[2.5rem] p-8 border border-white/5 md:col-span-2"
          >
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <Award size={24} className="text-red-600" />
              Career Statistics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Wins */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">
                  Wins
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {driver.wins}
                  </span>
                  <span className="text-xs text-neutral-400">races</span>
                </div>
              </div>

              {/* Podiums */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">
                  Podiums
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {driver.podiums}
                  </span>
                  <span className="text-xs text-neutral-400">total</span>
                </div>
              </div>

              {/* Pole Positions */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">
                  Poles
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {driver.poles}
                  </span>
                  <span className="text-xs text-neutral-400">positions</span>
                </div>
              </div>

              {/* Points Total */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">
                  Total Points
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {driver.points_total}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-[2.5rem] p-8 border border-white/5 mb-12"
        >
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <TrendingUp size={24} className="text-red-600" />
            Performance Rating
          </h2>
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-neutral-300">
                Overall Rating
              </span>
              <span className="text-3xl font-black text-red-600">
                {driver.rating}%
              </span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${driver.rating}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_15px_rgba(220,38,38,0.6)]"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Biography Section from Wikipedia */}
      {wikipediaData && wikipediaData.extract && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto px-6 mb-16"
        >
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/5">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Globe size={24} className="text-red-600" />
              Biography
            </h2>

            {wikipediaData.image && (
              <img
                src={wikipediaData.image.source}
                alt={driver.family_name}
                className="w-full max-h-96 object-cover rounded-2xl mb-8"
              />
            )}

            <p className="text-neutral-300 leading-relaxed mb-6 text-base">
              {wikipediaData.extract}
            </p>

            <a
              href={wikipediaData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-black uppercase text-xs hover:bg-red-600 hover:text-white transition-all"
            >
              Read Full Article <Globe size={14} />
            </a>
          </div>
        </motion.div>
      )}

      {!wikipediaData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto px-6 mb-16"
        >
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/5">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
              <Globe size={24} className="text-red-600" />
              Biography
            </h2>
            <p className="text-neutral-400">
              Loading biography from Wikipedia...
            </p>
          </div>
        </motion.div>
      )}

      {/* Spacer */}
      <div className="h-16" />
    </div>
  );
}
