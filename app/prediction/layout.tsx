import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Race Predictor — AI Podium Predictions",
  description:
    "Random Forest race predictions: podium, win probabilities and overtake likelihood for any round of the season.",
  openGraph: {
    title: "F1 Race Predictor — AI Podium Predictions",
    description: "ML-powered podium and win-probability predictions.",
  },
};

export default function PredictionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
