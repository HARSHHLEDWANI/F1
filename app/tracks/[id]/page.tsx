"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { searchTrackWikipedia } from "@/lib/wikipedia";
import { motion } from "framer-motion";
import {
  MapPin,
  ChevronLeft,
  Globe,
  Award,
  TrendingUp,
  Zap,
  Gauge,
} from "lucide-react";

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
  image?: {
    source: string;
  };
  url?: string;
}

export default function TrackTelemetryPage() {
  const { loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const trackId = params?.id as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [wikipediaData, setWikipediaData] = useState<WikipediaData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrackData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch track from backend - try specific track first, then fallback to all tracks
        let selectedTrack;
        try {
          const trackResponse = await apiFetch(`/tracks/${trackId}`);
          selectedTrack = trackResponse;
        } catch (err) {
          // Fallback: fetch all tracks and find by ID
          const tracksResponse = await apiFetch("/tracks");
          const trackList = Array.isArray(tracksResponse)
            ? tracksResponse
            : [tracksResponse];
          selectedTrack = trackList.find(
            (t: Track) => t.id === parseInt(trackId)
          );
        }

        if (!selectedTrack) {
          setError("Track not found");
          return;
        }

        console.log("[Telemetry] Track loaded:", selectedTrack);
        setTrack(selectedTrack);

        // Fetch Wikipedia data in parallel
        console.log("[Telemetry] Fetching Wikipedia data...");
        const wikiData = await searchTrackWikipedia(selectedTrack.name);

        if (wikiData) {
          console.log("[Telemetry] Wikipedia data received:", {
            title: wikiData.title,
            hasExtract: !!wikiData.extract,
            hasImage: !!wikiData.image,
          });

          const wikiUrl =
            wikiData.content_urls?.desktop?.page ||
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
        console.error("[Telemetry] Error loading track data:", err);
        setError("Failed to load track information");
      } finally {
        setLoading(false);
      }
    };

    if (trackId) {
      loadTrackData();
    }
  }, [trackId]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            {error || "Track not found"}
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
      {track.image_url && (
        <div className="w-full h-80 relative overflow-hidden mb-0">
          <img
            src={track.image_url}
            alt={track.name}
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
          Back to Circuits
        </button>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Track Info Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[2.5rem] p-8 border border-white/5 md:col-span-1"
          >
            <div className="flex flex-col items-center text-center">
              {/* Track Type Badge */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center mb-6">
                <span className="text-2xl font-black text-white">
                  <MapPin size={24} />
                </span>
              </div>

              {/* Track Name */}
              <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">
                {track.name}
              </h1>

              {/* Location and Country */}
              <div className="mt-6 space-y-2 border-t border-white/5 pt-6 w-full">
                <p className="text-neutral-400 text-sm">
                  <span className="font-bold text-white block mb-1">City</span>
                  {track.locality}
                </p>
                <p className="text-neutral-400 text-sm">
                  <span className="font-bold text-white block mb-1">Country</span>
                  {track.country}
                </p>
                <p className="text-neutral-400 text-sm">
                  <span className="font-bold text-white block mb-1">
                    Circuit Type
                  </span>
                  {track.track_type || "Circuit"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Track Statistics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-[2.5rem] p-8 border border-white/5 md:col-span-2"
          >
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <Award size={24} className="text-red-600" />
              Track Specifications
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Lap Distance */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">
                  Lap Distance
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {(track.lap_distance || 0).toFixed(2)}
                  </span>
                  <span className="text-xs text-neutral-400">km</span>
                </div>
              </div>

              {/* Race Laps */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">
                  Race Laps
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {track.laps || 0}
                  </span>
                  <span className="text-xs text-neutral-400">laps</span>
                </div>
              </div>

              {/* DRS Zones */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">
                  DRS Zones
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {track.drs_zones || 0}
                  </span>
                  <span className="text-xs text-neutral-400">zones</span>
                </div>
              </div>

              {/* Lap Record */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">
                  Lap Record
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">
                    {track.lap_record_time || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Difficulty & Lap Record Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-[2.5rem] p-8 border border-white/5 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Difficulty Rating */}
            <div>
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Gauge size={24} className="text-red-600" />
                Circuit Difficulty
              </h3>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-neutral-300">
                    Real-time Analysis
                  </span>
                  <span className="text-3xl font-black text-red-600">
                    {track.difficulty || 50}%
                  </span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${track.difficulty || 50}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_15px_rgba(220,38,38,0.6)]"
                  />
                </div>
              </div>
            </div>

            {/* Lap Record Holder */}
            <div>
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <TrendingUp size={24} className="text-red-600" />
                Fastest Lap Record
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-400 uppercase font-bold mb-1">
                    Time
                  </p>
                  <p className="text-2xl font-black text-white">
                    {track.lap_record_time || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 uppercase font-bold mb-1">
                    Driver
                  </p>
                  <p className="text-lg font-bold text-neutral-300">
                    {track.lap_record_holder || "Unknown"}
                  </p>
                  {track.lap_record_year && (
                    <p className="text-xs text-neutral-500">
                      Set in {track.lap_record_year}
                    </p>
                  )}
                </div>
              </div>
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
              Circuit Information
            </h2>

            {wikipediaData.image && (
              <img
                src={wikipediaData.image.source}
                alt={track.name}
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
              Circuit Information
            </h2>
            <p className="text-neutral-400">
              Loading circuit information from Wikipedia...
            </p>
          </div>
        </motion.div>
      )}

      {/* Spacer */}
      <div className="h-16" />
    </div>
  );
}
