import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Circuits — 2025 Calendar",
  description:
    "All 24 circuits of the 2025 F1 season: lap records, DRS zones, track maps and difficulty ratings.",
  openGraph: {
    title: "F1 Circuits — 2025 Calendar",
    description: "Lap records, DRS zones and track maps for all 24 circuits.",
  },
};

export default function TracksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
