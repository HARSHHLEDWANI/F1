"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Tier = "free" | "pro" | null;

export function useUserTier() {
  const [tier, setTier] = useState<Tier>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTier = async () => {
      try {
        const user = await apiFetch("/profile"); // ✅ sends Bearer token
        setTier(user.plan && user.plan.toUpperCase() === "PRO" ? "pro" : "free");
      } catch (err) {
        // If authentication fails, user is not logged in - this is OK
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
