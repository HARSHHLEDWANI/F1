"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * After a successful OAuth sign-in, NextAuth redirects here.
 * We grab the backend JWT from the session and store it in
 * localStorage so the existing apiFetch() auth flow works as-is.
 */
export default function OAuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    const backendToken = (session as any)?.backendToken as string | undefined;

    if (backendToken) {
      localStorage.setItem("token", backendToken);
      router.replace("/");
    } else if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [session, status, router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#050508",
        color: "#00D2FF",
        fontFamily: "monospace",
        letterSpacing: "0.2em",
        fontSize: 13,
      }}
    >
      <span style={{ animation: "pulse 1s ease infinite" }}>
        AUTHENTICATING...
      </span>
    </div>
  );
}
