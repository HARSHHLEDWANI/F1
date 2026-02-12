import Navbar from "@/components/navbar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

interface Team {
  id: number;
  name: string;
  primary_color: string;
  secondary_color: string;
  car: string;
  drivers: number[];
  strength: number;
}

async function getTeams(): Promise<Team[]> {
  const res = await fetch(`${API_BASE}/teams`, { next: { revalidate: 60 } });
  if (!res.ok) {
    console.error("Failed to load teams from backend");
    return [];
  }
  return res.json();
}

export default async function TeamsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const teams = await getTeams();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black/90 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">FORMULA 1 TEAMS</h1>
            <p className="text-xl text-gray-400">Meet the 10 teams competing in the 2025 season</p>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="group rounded-xl overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-2xl"
                style={{ borderColor: team.secondary_color }}
              >
                {/* Team Header */}
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
                  <p className="text-sm opacity-90">Season 2025</p>
                </div>

                {/* Team Details */}
                <div className="bg-gray-900 p-6 space-y-4">
                  {/* Car Info */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Car</p>
                    <p className="text-lg font-bold text-white">{team.car}</p>
                  </div>

                  {/* Drivers */}
                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Drivers</p>
                    <p className="text-white font-semibold">
                      Linked to {team.drivers.length} driver
                      {team.drivers.length !== 1 ? "s" : ""} in database
                    </p>
                  </div>

                  {/* Button */}
                  <button
                    className="w-full mt-4 py-2 rounded-lg font-semibold transition-all"
                    style={{
                      backgroundColor: team.secondary_color,
                      color:
                        team.primary_color === "#FF8700" || team.primary_color === "#DC0000"
                          ? "#000"
                          : "#fff",
                    }}
                  >
                    View Team Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Championship Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-red-600/10 border border-red-600/50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                🏆 Teams by Wins
              </h3>
              <div className="space-y-2 text-gray-300">
                <p>1. Red Bull Racing - 112 Wins</p>
                <p>2. Mercedes - 111 Wins</p>
                <p>3. Ferrari - 62 Wins</p>
                <p>4. McLaren - 58 Wins</p>
                <p>5. Aston Martin - 8 Wins</p>
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                🎯 Current Championship Leaders
              </h3>
              <div className="space-y-2 text-gray-300">
                <p>1. Red Bull Racing - 285 Points</p>
                <p>2. Ferrari - 244 Points</p>
                <p>3. Mercedes - 215 Points</p>
                <p>4. McLaren - 189 Points</p>
                <p>5. Aston Martin - 87 Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
