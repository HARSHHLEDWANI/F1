"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await apiFetch("/profile");

        if (!user || !user.email) {
          throw new Error("No user data");
        }
      } catch (err) {
        console.warn("User not authenticated", err);
        router.replace("/auth/signin");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { loading };
}
