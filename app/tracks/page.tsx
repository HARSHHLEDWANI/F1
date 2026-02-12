import Navbar from "@/components/navbar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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

async function getTracks(region?: string, country?: string): Promise<Track[]> {
  const params = new URLSearchParams();
  if (region) params.set("region", region);
  if (country) params.set("country", country);
  const qs = params.toString();
  const url = `${API_BASE}/tracks${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    console.error("Failed to load tracks from backend");
    return [];
  }
  return res.json();
}

export default async function TracksPage({
  searchParams,
}: {
  searchParams?: { region?: string; country?: string };
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const region = searchParams?.region;
  const country = searchParams?.country;
  const tracks = await getTracks(region, country);

  const regions = Array.from(new Set(tracks.map((t) => t.region))).sort();
  const countries = Array.from(new Set(tracks.map((t) => t.country_name))).sort();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black/90 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">RACE TRACKS WORLDWIDE</h1>
            <p className="text-xl text-gray-400">Explore F1 circuits across the globe</p>
          </div>

          {/* Filters */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Filter by Region</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/tracks"
                  className={`px-3 py-1 rounded-full text-xs border ${
                    !region
                      ? "bg-red-600 text-white border-red-500"
                      : "border-gray-700 text-gray-300 hover:border-red-500"
                  }`}
                >
                  All Regions
                </a>
                {regions.map((r) => (
                  <a
                    key={r}
                    href={`/tracks?region=${encodeURIComponent(r)}`}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      region === r
                        ? "bg-red-600 text-white border-red-500"
                        : "border-gray-700 text-gray-300 hover:border-red-500"
                    }`}
                  >
                    {r}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Filter by Country
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/tracks"
                  className={`px-3 py-1 rounded-full text-xs border ${
                    !country
                      ? "bg-blue-600 text-white border-blue-500"
                      : "border-gray-700 text-gray-300 hover:border-blue-500"
                  }`}
                >
                  All Countries
                </a>
                {countries.map((c) => (
                  <a
                    key={c}
                    href={`/tracks?country=${encodeURIComponent(c)}`}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      country === c
                        ? "bg-blue-600 text-white border-blue-500"
                        : "border-gray-700 text-gray-300 hover:border-blue-500"
                    }`}
                  >
                    {c}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Tracks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-red-600/30 rounded-xl overflow-hidden hover:border-red-600/70 transition-all hover:shadow-xl hover:shadow-red-600/20"
              >
                {/* Track Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 border-b border-red-700">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-bold text-white">{track.name}</h2>
                    <span className="text-2xl">{track.country_flag}</span>
                  </div>
                  <p className="text-sm text-white/90">
                    {track.city}, {track.country_name} • {track.region}
                  </p>
                </div>

                {/* Track Info */}
                <div className="p-6 grid grid-cols-2 gap-4">
                  {/* Distance */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Circuit Length</p>
                    <p className="text-lg font-bold text-white">{track.length_km.toFixed(3)} km</p>
                  </div>

                  {/* Laps */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Laps</p>
                    <p className="text-lg font-bold text-white">{track.laps}</p>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Difficulty</p>
                    <p className={`text-lg font-bold ${getDifficultyColor(track.difficulty)}`}>
                      {track.difficulty}
                    </p>
                  </div>

                  {/* Lap Record */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Lap Record</p>
                    <p className="text-sm font-bold text-blue-400">{track.lap_record}</p>
                  </div>
                </div>

                {/* Record Holder */}
                <div className="px-6 pb-6">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Record Holder</p>
                    <p className="text-white font-semibold">{track.lap_record_holder}</p>
                  </div>
                </div>

                {/* Button */}
                <div className="px-6 pb-6">
                  <button className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Track Statistics */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-600/10 border border-blue-600/50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">🌍 Total Races</h3>
              <p className="text-4xl font-bold text-blue-400">24</p>
              <p className="text-gray-400 mt-2">Grand Prix races in 2025</p>
            </div>

            <div className="bg-green-600/10 border border-green-600/50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">📍 Countries</h3>
              <p className="text-4xl font-bold text-green-400">21</p>
              <p className="text-gray-400 mt-2">Nations hosting F1 races</p>
            </div>

            <div className="bg-purple-600/10 border border-purple-600/50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">🏁 Historic Circuits</h3>
              <p className="text-4xl font-bold text-purple-400">3</p>
              <p className="text-gray-400 mt-2">Longest running venues</p>
            </div>
          </div>

          {/* Circuit Icons Legend */}
          <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Difficulty Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-gray-300">Low - Easy</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span className="text-gray-300">Medium - Challenging</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-gray-300">High - Very Challenging</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-orange-700"></div>
                <span className="text-gray-300">Very High - Extreme</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
