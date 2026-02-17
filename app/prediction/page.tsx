"use client";

import Navbar from "@/components/navbar";
import { useUserTier } from "@/hooks/useUserTier";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

interface Race {
  id: number;
  name: string;
  season: number;
  round: number;
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
  const { loading: authLoading } = useAuth();
  const { tier, loading: tierLoading } = useUserTier();

  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [drivers, setDrivers] = useState<DriverLookup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Load races + drivers after auth
  useEffect(() => {
    if (authLoading || tierLoading) return;

    const loadData = async () => {
      try {
        const [racesData, driversData] = await Promise.all([
          apiFetch("/races"),
          apiFetch("/drivers"),
        ]);

        setRaces(racesData);
        setDrivers(driversData);

        if (!selectedRace && racesData.length > 0) {
          setSelectedRace(racesData[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setError("Unable to load prediction data");
      }
    };

    loadData();
  }, [authLoading, tierLoading]);

  const handlePredict = async () => {
    if (!selectedRace) return;

    setLoading(true);
    setError(null);

    try {
      const data: PredictionResult = await apiFetch("/predict", {
        method: "POST",
        body: JSON.stringify({
          race_id: selectedRace,
          top_n: tier === "pro" ? 5 : 3,
        }),
      });

      setPrediction(data);
    } catch (err: any) {
      console.error(err);
      setError("Unable to generate prediction");
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

  if (authLoading || tierLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          Loading predictions...
        </div>
      </>
    );
  }

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
                Plan: {tier === "pro" ? "PRO - Unlimited Access" : "FREE"}
              </p>
              <p className="text-gray-400 text-xs">{tierLabel}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 text-red-400 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Race selector */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Choose a Race
                </h2>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {races.map((race) => (
                    <button
                      key={race.id}
                      onClick={() => setSelectedRace(race.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm border ${
                        selectedRace === race.id
                          ? "border-red-500 bg-red-600/20 text-white"
                          : "border-gray-700 bg-gray-900 text-gray-200"
                      }`}
                    >
                      <span className="block font-semibold">{race.name}</span>
                      <span className="block text-xs text-gray-400">
                        Round {race.round} • {race.season}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePredict}
                disabled={!selectedRace || loading}
                className="w-full bg-red-600 disabled:opacity-60 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
              >
                {loading ? "Calculating..." : "Predict Podium"}
              </button>
            </div>

            {/* Prediction output */}
            <div className="lg:col-span-2">
              <div className="bg-black/40 border border-red-600/40 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Predicted Podium
                </h2>

                {prediction ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {prediction.predicted.map((pos, index) => (
                      <div key={pos.driver_id} className="bg-black/40 rounded-lg p-4">
                        <p className="text-xs text-gray-400 uppercase">
                          P{index + 1}
                        </p>
                        <p className="text-lg font-semibold text-white">
                          {driverName(pos.driver_id)}
                        </p>
                        <p className="text-green-400 text-sm">
                          {(pos.probability * 100).toFixed(1)}%
                        </p>
                      </div>
                    ))}
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
