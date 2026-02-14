"use client";

import { useEffect, useState } from "react";

type Tier = "free" | "pro" | null;

interface UseUserTierResult {
  tier: Tier;
  loading: boolean;
  error: string | null;
  upgradeToPro: () => Promise<void>;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export function useUserTier(): UseUserTierResult {
  const [tier, setTier] = useState<Tier>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Get user + token from localStorage
  const getAuthData = () => {
    if (typeof window === "undefined") return null;

    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userStr) return null;

    return {
      user: JSON.parse(userStr),
      token,
    };
  };

  useEffect(() => {
    const auth = getAuthData();
    const email = auth?.user?.email;

    if (!email) {
      setTier(null);
      return;
    }

    const syncUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Upsert user
        await fetch(`${API_BASE}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth?.token ? `Bearer ${auth.token}` : "",
          },
          body: JSON.stringify({
            email,
            name: auth?.user?.name,
            tier: "free",
          }),
        });

        // Get tier
        const res = await fetch(
          `${API_BASE}/users/by-email/${encodeURIComponent(email)}`,
          {
            headers: {
              Authorization: auth?.token ? `Bearer ${auth.token}` : "",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load user tier");
        }

        const data = await res.json();
        setTier(data.tier === "pro" ? "pro" : "free");
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unable to load user tier");
      } finally {
        setLoading(false);
      }
    };

    syncUser();
  }, []);

  const upgradeToPro = async () => {
    const auth = getAuthData();
    const email = auth?.user?.email;

    if (!email) return;

    try {
      setLoading(true);
      setError(null);

      const resUser = await fetch(
        `${API_BASE}/users/by-email/${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: auth?.token ? `Bearer ${auth.token}` : "",
          },
        }
      );

      if (!resUser.ok) {
        throw new Error("User not found");
      }

      const user = await resUser.json();

      const res = await fetch(
        `${API_BASE}/users/${user.id}/tier?tier=pro`,
        {
          method: "PUT",
          headers: {
            Authorization: auth?.token ? `Bearer ${auth.token}` : "",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to upgrade tier");
      }

      setTier("pro");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to upgrade tier");
    } finally {
      setLoading(false);
    }
  };

  return { tier, loading, error, upgradeToPro };
}
