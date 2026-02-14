"use client";

import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Check auth
  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.push("/signin");
      return;
    }

    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const res = await fetch(`${API_BASE}/drivers`);
      if (!res.ok) throw new Error("Failed to load drivers");

      const data = await res.json();
      setDrivers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          Loading drivers...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black/90 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              F1 DRIVERS
            </h1>
            <p className="text-xl text-gray-400">
              Meet the drivers competing in Formula 1
            </p>
          </div>

          {/* Drivers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-red-600/30 rounded-xl overflow-hidden hover:border-red-600/70 transition-all group"
              >
                <div className="relative h-32 bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center overflow-hidden">
                  <div className="absolute text-8xl font-bold text-white/20 group-hover:text-white/30 transition">
                    {driver.number}
                  </div>
                  <h2 className="text-2xl font-bold text-white text-center relative z-10">
                    {driver.name}
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">
                      🇺🇳 {driver.country}
                    </p>
                    <p className="text-sm font-semibold text-blue-400">
                      {driver.team}
                    </p>
                  </div>

                  <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-3">
                    <p className="text-sm text-yellow-400 font-bold">
                      {driver.championship}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800">
                    <div className="bg-gray-800/50 rounded p-3">
                      <p className="text-xs text-gray-500">Wins</p>
                      <p className="text-2xl font-bold text-green-400">
                        {driver.wins}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded p-3">
                      <p className="text-xs text-gray-500">Podiums</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {driver.podiums}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded p-3">
                      <p className="text-xs text-gray-500">Poles</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {driver.poles}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded p-3">
                      <p className="text-xs text-gray-500">Points</p>
                      <p className="text-xl font-bold text-orange-400">
                        {driver.points_total}
                      </p>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
