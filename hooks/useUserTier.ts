"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Tier = "free" | "pro" | null;

interface UseUserTierResult {
  tier: Tier;
  loading: boolean;
  error: string | null;
  upgradeToPro: () => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export function useUserTier(): UseUserTierResult {
  const { data: session } = useSession();
  const [tier, setTier] = useState<Tier>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) {
      setTier(null);
      return;
    }

    const syncUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Upsert the user with default "free" tier
        await fetch(`${API_BASE}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name: session.user?.name,
            tier: "free",
          }),
        });

        const res = await fetch(`${API_BASE}/users/by-email/${encodeURIComponent(email)}`);
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
  }, [session?.user?.email, session?.user?.name]);

  const upgradeToPro = async () => {
    const email = session?.user?.email;
    if (!email) return;

    try {
      setLoading(true);
      setError(null);

      const resUser = await fetch(`${API_BASE}/users/by-email/${encodeURIComponent(email)}`);
      if (!resUser.ok) {
        throw new Error("User not found");
      }
      const user = await resUser.json();

      const res = await fetch(`${API_BASE}/users/${user.id}/tier?tier=pro`, {
        method: "PUT",
      });
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


