"use client";

import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

interface Team {
  id: number;
  name: string;
  primary_color: string;
  secondary_color: string;
  car: string;
  drivers: number[];
  strength: number;
}

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Check auth
  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.push("/auth/signin");
      return;
    }

    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const res = await fetch(`${API_BASE}/teams`);
      if (!res.ok) throw new Error("Failed to load teams");

      const data = await res.json();
      setTeams(data);
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
          Loading teams...
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
              FORMULA 1 TEAMS
            </h1>
            <p className="text-xl text-gray-400">
              Meet the teams competing in the season
            </p>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="group rounded-xl overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-2xl"
                style={{ borderColor: team.secondary_color }}
              >
                <div
                  className="p-6 text-white"
                  style={{ backgroundColor: team.primary_color }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-2xl font-bold">{team.name}</h2>
                    <span className="text-xs font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/20">
                      Team Rating: {team.strength}
                    </span>
                  </div>
                  <p className="text-sm opacity-90">Season</p>
                </div>

                <div className="bg-gray-900 p-6 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Car
                    </p>
                    <p className="text-lg font-bold text-white">
                      {team.car}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Drivers
                    </p>
                    <p className="text-white font-semibold">
                      Linked to {team.drivers.length} driver
                      {team.drivers.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <button
                    className="w-full mt-4 py-2 rounded-lg font-semibold transition-all"
                    style={{
                      backgroundColor: team.secondary_color,
                      color: "#fff",
                    }}
                  >
                    View Team Details
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
