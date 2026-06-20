"use client";
import { SessionProvider } from "next-auth/react";
import { MotionConfig } from "framer-motion";

export default function Providers({ children }: { children: React.ReactNode }) {
  // reducedMotion="user" makes all framer-motion animations honour the OS
  // "prefers-reduced-motion" setting.
  return (
    <SessionProvider>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SessionProvider>
  );
}
