"use client";

import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

interface Track {
  id: number;
  name: string;
  country_flag: string;
  country_name: string;
  city: string;
  laps: number;
  length_km: number;
  region: string;
  difficulty: string;
  lap_record: string;
  lap_record_holder: string;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "High":
    case "Very High":
      return "text-red-500";
    case "Medium":
      return "text-yellow-500";
    case "Low":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};

export default function TracksPage() {
  const { loading: authLoading } = useAuth();
  const searchParams = useSearchParams();

  const region = searchParams.get("region") || "";
  const country = searchParams.get("country") || "";

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const loadTracks = async () => {
      try {
        const params = new URLSearchParams();
        if (region) params.set("region", region);
        if (country) params.set("country", country);

        const endpoint = `/tracks${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const data = await apiFetch(endpoint);
        setTracks(data);
      } catch (err) {
        console.error("Failed to load tracks:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, [region, country, authLoading]);

  const regions = Array.from(new Set(tracks.map((t) => t.region))).sort();
  const countries = Array.from(
    new Set(tracks.map((t) => t.country_name))
  ).sort();

  if (loading || authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          Loading tracks...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black/90 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              RACE TRACKS WORLDWIDE
            </h1>
            <p className="text-xl text-gray-400">
              Explore F1 circuits across the globe
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <p className="text-xs text-gray-500 mb-1">Filter by Region</p>
              <div className="flex flex-wrap gap-2">
                <a href="/tracks" className="px-3 py-1 rounded-full text-xs border border-gray-700 text-gray-300">
                  All Regions
                </a>
                {regions.map((r) => (
                  <a key={r} href={`/tracks?region=${encodeURIComponent(r)}`}
                    className="px-3 py-1 rounded-full text-xs border border-gray-700 text-gray-300">
                    {r}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Filter by Country</p>
              <div className="flex flex-wrap gap-2">
                <a href="/tracks" className="px-3 py-1 rounded-full text-xs border border-gray-700 text-gray-300">
                  All Countries
                </a>
                {countries.map((c) => (
                  <a key={c} href={`/tracks?country=${encodeURIComponent(c)}`}
                    className="px-3 py-1 rounded-full text-xs border border-gray-700 text-gray-300">
                    {c}
                  </a>
                ))}
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tracks.map((track) => (
              <div key={track.id}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-red-600/30 rounded-xl overflow-hidden">

                <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6">
                  <h2 className="text-2xl font-bold text-white">{track.name}</h2>
                  <p className="text-sm text-white/90">
                    {track.city}, {track.country_name}
                  </p>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4">
                  <p className="text-white font-bold">{track.length_km} km</p>
                  <p className="text-white font-bold">{track.laps} laps</p>

                  <p className={`font-bold ${getDifficultyColor(track.difficulty)}`}>
                    {track.difficulty}
                  </p>

                  <p className="text-blue-400 font-bold">{track.lap_record}</p>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
