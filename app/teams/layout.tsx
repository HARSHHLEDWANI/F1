import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams — 2025 Constructors",
  description:
    "All 10 F1 constructors for 2025: car chassis, driver line-ups and live championship standings from the Jolpica API.",
  openGraph: {
    title: "F1 Teams — 2025 Constructors",
    description: "Car specs, rosters and live 2025 constructor standings.",
  },
};

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
