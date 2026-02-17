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
        const user = await apiFetch("/me"); // ✅ sends Bearer token
        setTier(user.is_pro ? "pro" : "free");
      } catch (err) {
        console.error("Failed to fetch tier:", err);
        setError("Failed to load tier");
        setTier(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTier();
  }, []);

  return { tier, loading, error };
}
