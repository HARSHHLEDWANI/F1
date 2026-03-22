"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Tier = "free" | "pro" | null;

export function useUserTier() {
  const [tier, setTier] = useState<Tier>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 🚨 CRITICAL FIX: skip API if not logged in
    if (!token) {
      setTier("free");
      setLoading(false);
      return;
    }

    const fetchTier = async () => {
      try {
        const res = await apiFetch("/profile");

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const user = await res.json();

        setTier(
          user.plan && user.plan.toUpperCase() === "PRO"
            ? "pro"
            : "free"
        );

      } catch (err) {
        console.log("User not authenticated, showing free tier");
        setTier("free");
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTier();
  }, []);

  return { tier, loading, error };
}