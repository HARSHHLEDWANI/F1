import Navbar from "@/components/navbar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

interface Driver {
  id: number;
  name: string;
  country: string;
  number: number;
  team: string;
  championship: string;
  wins: number;
  podiums: number;
  poles: number;
  points_total: number;
}

async function getDrivers(): Promise<Driver[]> {
  const res = await fetch(`${API_BASE}/drivers`, { next: { revalidate: 60 } });
  if (!res.ok) {
    console.error("Failed to load drivers from backend");
    return [];
  }
  return res.json();
}

export default async function DriversPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const drivers = await getDrivers();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black/90 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">F1 DRIVERS</h1>
            <p className="text-xl text-gray-400">Meet the drivers competing in Formula 1</p>
          </div>

          {/* Drivers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-red-600/30 rounded-xl overflow-hidden hover:border-red-600/70 transition-all group"
              >
                {/* Driver Number Badge */}
                <div className="relative h-32 bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center overflow-hidden">
                  <div className="absolute text-8xl font-bold text-white/20 group-hover:text-white/30 transition">
                    {driver.number}
                  </div>
                  <h2 className="text-2xl font-bold text-white text-center relative z-10">
                    {driver.name}
                  </h2>
                </div>

                {/* Driver Info */}
                <div className="p-6 space-y-4">
                  {/* Country & Team */}
                  <div>
                    <p className="text-sm text-gray-400 mb-1">🇺🇳 {driver.country}</p>
                    <p className="text-sm font-semibold text-blue-400">{driver.team}</p>
                  </div>

                  {/* Championship */}
                  <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-3">
                    <p className="text-sm text-yellow-400 font-bold">{driver.championship}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800">
                    <div className="bg-gray-800/50 rounded p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Wins</p>
                      <p className="text-2xl font-bold text-green-400">{driver.wins}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Podiums</p>
                      <p className="text-2xl font-bold text-blue-400">{driver.podiums}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Poles</p>
                      <p className="text-2xl font-bold text-purple-400">{driver.poles}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Points</p>
                      <p className="text-xl font-bold text-orange-400">{driver.points_total}</p>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <button className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Driver Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-green-600/10 border border-green-600/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">🏆 Most Wins</h3>
              <p className="text-2xl font-bold text-green-400">Lewis Hamilton</p>
              <p className="text-gray-400">103 Wins</p>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">📍 Most Podiums</h3>
              <p className="text-2xl font-bold text-blue-400">Lewis Hamilton</p>
              <p className="text-gray-400">189 Podiums</p>
            </div>

            <div className="bg-purple-600/10 border border-purple-600/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">🎯 Most Poles</h3>
              <p className="text-2xl font-bold text-purple-400">Lewis Hamilton</p>
              <p className="text-gray-400">103 Pole Positions</p>
            </div>

            <div className="bg-yellow-600/10 border border-yellow-600/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">👑 Most Titles</h3>
              <p className="text-2xl font-bold text-yellow-400">Lewis Hamilton</p>
              <p className="text-gray-400">7x World Champion</p>
            </div>
          </div>

          {/* Legend & Scoring */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Championship Scoring System</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-lg p-4 text-center">
                <p className="text-white font-bold text-2xl">25</p>
                <p className="text-sm text-white/90">1st Place</p>
              </div>
              <div className="bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg p-4 text-center">
                <p className="text-white font-bold text-2xl">18</p>
                <p className="text-sm text-white/90">2nd Place</p>
              </div>
              <div className="bg-gradient-to-b from-orange-600 to-orange-700 rounded-lg p-4 text-center">
                <p className="text-white font-bold text-2xl">15</p>
                <p className="text-sm text-white/90">3rd Place</p>
              </div>
              <div className="bg-blue-600 rounded-lg p-4 text-center">
                <p className="text-white font-bold text-2xl">+1</p>
                <p className="text-sm text-white/90">Fastest Lap</p>
              </div>
              <div className="bg-red-600 rounded-lg p-4 text-center">
                <p className="text-white font-bold text-2xl">10→1</p>
                <p className="text-sm text-white/90">4th-10th</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
