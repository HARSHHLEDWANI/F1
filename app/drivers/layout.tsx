import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drivers — The 2025 Grid",
  description:
    "Every 2025 F1 driver: career stats, live season points from the Jolpica API, ratings and team line-ups.",
  openGraph: {
    title: "F1 Drivers — The 2025 Grid",
    description:
      "Career stats and live 2025 season standings for all 20 drivers.",
  },
};

export default function DriversLayout({ children }: { children: React.ReactNode }) {
  return children;
}
