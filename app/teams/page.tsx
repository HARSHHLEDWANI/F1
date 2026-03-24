"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { Users, Trophy, Zap, ChevronRight } from "lucide-react";
import DataSeedHint from "@/components/DataSeedHint";

interface Driver {
  id: number;
  given_name: string;
  family_name: string;
  nationality: string;
  number?: number;
  team?: string;
  rating: number;
  image_url?: string;
}

interface Team {
  id: number;
  name: string;
  nationality?: string;
  url?: string;
}

// Driver roster mapping for 2026
const DRIVER_ASSIGNMENTS: Record<string, string[]> = {
  "Red Bull": ["Verstappen", "Perez"],
  "Mercedes": ["Hamilton", "Russell"],
  "Ferrari": ["Leclerc", "Sainz"],
  "McLaren": ["Piastri", "Norris"],
  "Aston Martin": ["Alonso", "Stroll"],
  "Alpine F1 Team": ["Gasly", "Ocon"],
  "Haas F1 Team": ["Hulkenberg", "Magnussen"],
  "RB F1 Team": ["Tsunoda", "Lawson"],
  "Williams": ["Albon", "Colapinto"],
  "Sauber": ["Bottas", "Zhou"],
};

const TEAMS_INFO = {
  "Red Bull": {
    championships: 7,
    founded: 2005,
    drivers_all_time: 89,
    car: "RB21",
    power: "Honda RBPT",
    color: "#0600EF",
  },
  "Mercedes": {
    championships: 9,
    founded: 1954,
    drivers_all_time: 156,
    car: "W16",
    power: "Mercedes",
    color: "#00D4BE",
  },
  "Ferrari": {
    championships: 16,
    founded: 1950,
    drivers_all_time: 203,
    car: "SF-25",
    power: "Ferrari",
    color: "#DC0000",
  },
  "McLaren": {
    championships: 12,
    founded: 1963,
    drivers_all_time: 168,
    car: "MCL38",
    power: "Mercedes",
    color: "#FF8700",
  },
  "Aston Martin": {
    championships: 0,
    founded: 2018,
    drivers_all_time: 34,
    car: "AMF1-26",
    power: "Mercedes",
    color: "#006F62",
  },
  "Alpine F1 Team": {
    championships: 2,
    founded: 2021,
    drivers_all_time: 47,
    car: "A526",
    power: "Renault",
    color: "#0082FA",
  },
  "Haas F1 Team": {
    championships: 0,
    founded: 2016,
    drivers_all_time: 38,
    car: "VF-26",
    power: "Ferrari",
    color: "#FFFFFF",
  },
  "RB F1 Team": {
    championships: 0,
    founded: 2005,
    drivers_all_time: 92,
    car: "RB21",
    power: "Honda RBPT",
    color: "#1E3050",
  },
  "Williams": {
    championships: 7,
    founded: 1977,
    drivers_all_time: 182,
    car: "FW47",
    power: "Mercedes",
    color: "#0082FA",
  },
  "Sauber": {
    championships: 0,
    founded: 1993,
    drivers_all_time: 147,
    car: "C46",
    power: "Ferrari",
    color: "#00D4BE",
  },
};

export default function TeamsPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [teamsData, driversData] = await Promise.all([
          apiFetch("/teams"),
          apiFetch("/drivers"),
        ]);

        const teamsList = Array.isArray(teamsData) ? teamsData : [];
        const driversList = Array.isArray(driversData) ? driversData : [];

        setTeams(teamsList);
        setDrivers(driversList);

        if (!teamsList.length || !driversList.length) {
          setError("No teams or drivers found. Please seed backend data.");
        } else {
          setError(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load teams";
        console.error("Error loading data:", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getTeamDrivers = (teamName: string) => {
    // First try to match drivers with database team field
    const dbDrivers = drivers.filter((d) => d.team === teamName);
    if (dbDrivers.length > 0) return dbDrivers;
    
    // Fallback: match drivers by last name using DRIVER_ASSIGNMENTS
    const assignedLastNames = DRIVER_ASSIGNMENTS[teamName] || [];
    return drivers.filter((d) => 
      assignedLastNames.some(name => d.family_name.includes(name))
    );
  };

  const getTeamInfo = (teamName: string) => {
    return TEAMS_INFO[teamName as keyof typeof TEAMS_INFO] || {
      championships: 0,
      founded: 2000,
      drivers_all_time: 0,
      car: "Unknown",
      power: "Unknown",
      color: "#999999",
    };
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <DataSeedHint
        title="No teams or drivers found. Please seed backend data."
        message="Check your backend and run the seed scripts, then reload."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!teams.length) {
    return (
      <DataSeedHint
        title="No teams available yet"
        message="Run backend scripts and reload to populate teams."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-16">
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
          F1 <span className="text-red-600 font-normal not-italic">TEAMS</span>
        </h1>
        <p className="text-neutral-400 max-w-xl text-lg">
          All 10 Formula 1 constructors with their championship records,
          current roster, and technical specifications.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {teams.map((team, index) => {
          const teamDrivers = getTeamDrivers(team.name);
          const info = getTeamInfo(team.name);

          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden"
            >
              {/* HEADER */}
              <div
                className="p-8 text-white relative overflow-hidden"
                style={{
                  backgroundColor: info.color + "20",
                  borderBottom: `2px solid ${info.color}40`,
                }}
              >
                {/* Background accent */}
                <div
                  className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
                  style={{ backgroundColor: info.color }}
                />

                <div className="relative z-10">
                  <h2 className="text-4xl font-black italic uppercase mb-2">
                    {team.name}
                  </h2>
                  <p className="text-sm text-neutral-300">
                    {team.nationality || "International"}
                  </p>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-8">
                {/* STATS GRID */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">
                      Championships
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-red-600">
                        {info.championships}
                      </span>
                      <span className="text-xs text-neutral-400">wins</span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">
                      Founded
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">
                        {info.founded}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">
                      Car
                    </p>
                    <p className="font-mono font-bold text-sm">{info.car}</p>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">
                      Power Unit
                    </p>
                    <p className="font-mono font-bold text-sm">{info.power}</p>
                  </div>
                </div>

                {/* DRIVERS */}
                <div>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <Users size={20} className="text-red-600" />
                    2026 Roster
                  </h3>

                  <div className="space-y-3">
                    {teamDrivers.length > 0 ? (
                      teamDrivers.map((driver) => (
                        <motion.button
                          key={driver.id}
                          onClick={() => router.push(`/drivers/${driver.id}`)}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-600/50 hover:bg-red-600/10 transition-all group"
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex items-center gap-3 text-left">
                            <div className="flex-shrink-0">
                              <span className="text-sm font-black text-red-600">
                                #{driver.number || "?"}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-white">
                                {driver.given_name} {driver.family_name}
                              </p>
                              <p className="text-xs text-neutral-400">
                                {driver.nationality}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs text-neutral-400">Rating</p>
                              <p className="font-bold text-red-600">
                                {driver.rating}%
                              </p>
                            </div>
                            <ChevronRight
                              size={18}
                              className="text-neutral-500 group-hover:text-red-600 transition-colors"
                            />
                          </div>
                        </motion.button>
                      ))
                    ) : (
                      <p className="text-neutral-400 text-sm py-4">
                        No drivers assigned
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 mt-4 flex items-center gap-1">
                    <Zap size={12} />
                    {info.drivers_all_time} drivers all-time
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}