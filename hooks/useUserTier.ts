"use client";

import { useEffect, useState } from "react";

type Tier = "free" | "pro" | null;

interface UseUserTierResult {
  tier: Tier;
  loading: boolean;
  error: string | null;
  upgradeToPro: () => Promise<void>;
}

export function useUserTier(): UseUserTierResult {
  const [tier, setTier] = useState<Tier>(null);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");

      if (!userStr) {
        setTier(null);
        return;
      }

      const user = JSON.parse(userStr);

      // 🔥 Main logic — read boolean flag
      if (user.is_pro === true) {
        setTier("pro");
      } else {
        setTier("free");
      }
    } catch (err) {
      console.error("Failed to read user tier:", err);
      setTier("free");
    }
  }, []);

  // 🔥 Placeholder — real upgrade should be backend call
  const upgradeToPro = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);

      user.is_pro = true;

      localStorage.setItem("user", JSON.stringify(user));
      setTier("pro");
    } catch (err) {
      console.error("Upgrade failed:", err);
    }
  };

  return { tier, loading, error, upgradeToPro };
}
