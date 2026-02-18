"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://127.0.0.1:8000"; // change if needed

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token"); // ✅ FIXED

    if (!token) {
      router.push("/auth/signin");
      return;
    }

    fetch(`${API_BASE}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ correct format
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        localStorage.removeItem("token"); // ✅ FIXED
        router.push("/auth/signin");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center px-4">
      <div className="bg-zinc-900 p-8 rounded-xl shadow-lg w-full max-w-md border border-red-600">
        <h1 className="text-3xl font-bold text-red-500 mb-6 text-center">
          My Profile
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-gray-400">Email</p>
            <p className="text-lg">{user.email}</p>
          </div>

          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-lg">{user.name || "Not set"}</p>
          </div>

          <div>
            <p className="text-gray-400">Subscription</p>
            <p className="text-lg">{user.plan}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
