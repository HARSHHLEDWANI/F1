"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://127.0.0.1:8000";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [favoriteDriver, setFavoriteDriver] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/auth/signin");
      return;
    }

    const fetchData = async () => {
      try {
        const profileRes = await fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profileData = await profileRes.json();
        setUser(profileData);
        setFavoriteTeam(profileData.favorite_team || "");
        setFavoriteDriver(profileData.favorite_driver || "");

        const statsRes = await fetch(`${API_BASE}/prediction-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const statsData = await statsRes.json();
        setStats(statsData);

        setLoading(false);
      } catch {
        localStorage.removeItem("token");
        router.push("/auth/signin");
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleSavePreferences = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${API_BASE}/update-preferences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        favorite_team: favoriteTeam,
        favorite_driver: favoriteDriver,
      }),
    });

    setUser({
      ...user,
      favorite_team: favoriteTeam,
      favorite_driver: favoriteDriver,
    });

    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 relative overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_70%)] animate-pulse pointer-events-none" />

      <div className="relative max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="bg-zinc-900 border border-red-600 rounded-2xl p-8 flex justify-between items-center">

          <div>
            <h1 className="text-3xl font-bold text-red-500">
              {user.name || "F1 Racer"}
            </h1>
            <p className="text-gray-400">{user.email}</p>
          </div>

          <div className="relative">
            {user.plan === "PRO" && (
              <span className="absolute -top-4 -right-4 text-yellow-400 text-2xl">
                👑
              </span>
            )}
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                user.plan === "PRO"
                  ? "bg-yellow-500 text-black"
                  : "bg-red-600 text-white"
              }`}
            >
              {user.plan}
            </span>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <StatCard title="Predictions" value={stats?.total_predictions || 0} />
          <StatCard title="Total Points" value={stats?.total_score || 0} />
          <StatCard title="Best Score" value={stats?.best_score || 0} />
          <StatCard
            title="Accuracy"
            value={`${stats?.accuracy_percentage || 0}%`}
          />

        </div>

        {/* FAVORITES */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
          <h3 className="text-gray-400 text-sm">Favorite Team</h3>
          <p className="text-xl font-bold mt-1">
            {user.favorite_team || "Not Set"}
          </p>

          <h3 className="text-gray-400 text-sm mt-4">Favorite Driver</h3>
          <p className="text-xl font-bold mt-1">
            {user.favorite_driver || "Not Set"}
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-red-600 px-4 py-2 rounded-lg"
          >
            Edit Preferences
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-lg"
        >
          Logout
        </button>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
          <div className="bg-zinc-900 p-6 rounded-xl w-96 space-y-4">
            <h2 className="text-xl font-bold text-red-500">
              Edit Preferences
            </h2>

            <input
              value={favoriteTeam}
              onChange={(e) => setFavoriteTeam(e.target.value)}
              placeholder="Favorite Team"
              className="w-full p-2 bg-zinc-800 rounded"
            />

            <input
              value={favoriteDriver}
              onChange={(e) => setFavoriteDriver(e.target.value)}
              placeholder="Favorite Driver"
              className="w-full p-2 bg-zinc-800 rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 bg-red-600 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: any) {
  return (
    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}