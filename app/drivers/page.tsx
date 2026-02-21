"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

interface Driver {
  id: number;
  given_name: string;
  family_name: string;
  nationality: string;
  image_url?: string;
}

export default function DriversPage() {
  const { loading: authLoading } = useAuth();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const loadDrivers = async () => {
      try {
        const data = await apiFetch("/drivers");
        setDrivers(data);
      } catch (err) {
        console.error("Failed to load drivers:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDrivers();
  }, [authLoading]);

const getDriverImage = (driver: Driver) => {
  return driver.image_url || "/drivers/default.jpg";
};
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading drivers...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/90 pb-16">
      <div className="max-w-7xl mx-auto px-6">

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-gradient-to-br from-gray-900 to-gray-950 border border-red-600/30 rounded-xl overflow-hidden hover:border-red-600/70 transition-all duration-300 group shadow-lg"
            >

              {/* IMAGE */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getDriverImage(driver)}
                  alt={`${driver.given_name} ${driver.family_name}`}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "/drivers/default.jpg")
                  }
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute bottom-4 left-4">
                  <h2 className="text-2xl font-bold text-white">
                    {driver.given_name} {driver.family_name}
                  </h2>
                  <p className="text-sm text-gray-300">
                    🌍 {driver.nationality}
                  </p>
                </div>
              </div>

              {/* Button */}
              <div className="p-6">
                <button className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition shadow-[0_0_10px_rgba(255,0,0,0.6)]">
                  View Profile
                </button>
              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}