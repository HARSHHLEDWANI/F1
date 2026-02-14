"use client";

import Navbar from "@/components/navbar";
import { useUserTier } from "@/hooks/useUserTier";
import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Race {
  id: number;
  name: string;
  season: number;
  round: number;
  track_id: number;
  date: string;
}

interface PredictedPosition {
  driver_id: number;
  probability: number;
}

interface PredictionResult {
  race_id: number;
  created_at: string;
  predicted: PredictedPosition[];
}

interface DriverLookup {
  id: number;
  name: string;
  team: string;
}

export default function PredictionPage() {
  const { tier, loading: tierLoading, upgradeToPro } = useUserTier();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [drivers, setDrivers] = useState<DriverLookup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Check login status from localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setError(null);
      try {
        const [racesRes, driversRes] = await Promise.all([
          fetch(`${API_BASE}/races?tier=${tier || "free"}`),
          fetch(`${API_BASE}/drivers`),
        ]);

        if (!racesRes.ok) throw new Error("Failed to load races");
        if (!driversRes.ok) throw new Error("Failed to load drivers");

        const racesData: Race[] = await racesRes.json();
        const driversData: DriverLookup[] = await driversRes.json();

        setRaces(racesData);
        setDrivers(driversData);

        if (!selectedRace && racesData.length > 0) {
          setSelectedRace(racesData[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unable to load prediction data");
      }
    };

    loadData();
  }, [tier]);

  const handlePredict = async () => {
    if (!selectedRace) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          race_id: selectedRace,
          top_n: tier === "pro" ? 5 : 3,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate prediction");

      const data: PredictionResult = await res.json();
      setPrediction(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to generate prediction");
    } finally {
      setLoading(false);
    }
  };

  const driverName = (id: number) => {
    const d = drivers.find((x) => x.id === id);
    return d ? `${d.name} (${d.team})` : `Driver #${id}`;
  };

  const tierLabel =
    tier === "pro"
      ? "Pro users see full calendar and deeper podium predictions."
      : "Free users see recent races and a top-3 podium.";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4">
                RACE PREDICTIONS
              </h1>
              <p className="text-lg text-gray-300">
                Smart podium predictions powered by driver form and team strength.
              </p>
            </div>

            <div className="bg-gray-900/60 border border-red-600/50 rounded-xl px-5 py-3 text-sm text-gray-200">
              <p className="font-semibold mb-1">
                Plan:{" "}
                {tierLoading
                  ? "Loading..."
                  : tier === "pro"
                  ? "PRO - Unlimited Access"
                  : "FREE"}
              </p>
              <p className="text-gray-400 text-xs mb-2">{tierLabel}</p>

              {tier !== "pro" && !tierLoading && (
                <button
                  onClick={upgradeToPro}
                  className="text-xs font-semibold text-yellow-300 border border-yellow-400/60 px-3 py-1 rounded-full hover:bg-yellow-400 hover:text-black transition"
                >
                  Unlock Pro Predictions
                </button>
              )}
            </div>
          </div>

          {!isLoggedIn && (
            <div className="mb-8 rounded-xl border border-red-500/60 bg-red-900/20 px-6 py-4 text-sm text-red-100">
              <p className="font-semibold mb-1">
                Sign in to save and personalize your picks.
              </p>
              <p className="text-red-200">
                You can still try predictions, but login unlocks tiers and history.
              </p>
            </div>
          )}

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Race selector */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  1. Choose a Race
                </h2>

                {error && (
                  <p className="text-xs text-red-400 mb-2">{error}</p>
                )}

                {races.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No races available yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {races.map((race) => (
                      <button
                        key={race.id}
                        onClick={() => setSelectedRace(race.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition ${
                          selectedRace === race.id
                            ? "border-red-500 bg-red-600/20 text-white"
                            : "border-gray-700 bg-gray-900 hover:border-red-500 text-gray-200"
                        }`}
                      >
                        <span className="block font-semibold">
                          {race.name}
                        </span>
                        <span className="block text-xs text-gray-400">
                          Round {race.round} • {race.season}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handlePredict}
                disabled={!selectedRace || loading}
                className="w-full mt-2 bg-red-600 disabled:opacity-60 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                {loading ? "Calculating grid..." : "Predict Podium"}
              </button>
            </div>

            {/* Prediction output */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-red-600/20 via-purple-600/10 to-blue-600/10 border border-red-600/60 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  2. Predicted Podium
                </h2>

                {prediction ? (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-400">
                      Generated at{" "}
                      {new Date(prediction.created_at).toLocaleString()}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {prediction.predicted.map((pos, index) => (
                        <div
                          key={pos.driver_id}
                          className="bg-black/40 rounded-lg border border-white/10 p-4"
                        >
                          <p className="text-xs text-gray-400 uppercase">
                            P{index + 1}
                          </p>
                          <p className="text-lg font-semibold text-white">
                            {driverName(pos.driver_id)}
                          </p>
                          <p className="text-sm text-green-400">
                            Confidence: {(pos.probability * 100).toFixed(1)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm">
                    Select a race and click Predict Podium.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
