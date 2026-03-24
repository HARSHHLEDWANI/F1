"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Tier = "free" | "pro" | null;

export function useUserTier() {
  const [tier, setTier] = useState<Tier>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setTier("free");
      setLoading(false);
      return;
    }

    const fetchTier = async () => {
      try {
        const user = await apiFetch("/profile");

        setTier(user?.plan?.toUpperCase() === "PRO" ? "pro" : "free");
      } catch (err) {
        console.warn("User not authenticated, showing free tier", err);
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