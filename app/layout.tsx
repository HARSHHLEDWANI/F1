import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Providers from "./providers";
import Navbar from "@/components/navbar";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://f1-theta-seven.vercel.app"),
  title: {
    default: "F1 Predictor | 2025 Analytics",
    template: "%s | F1 Predictor",
  },
  description:
    "AI-powered Formula 1 analytics — 2025 grid, standings, circuits and ML race predictions.",
  openGraph: {
    title: "F1 Predictor | 2025 Analytics",
    description:
      "AI-powered Formula 1 analytics — 2025 grid, standings, circuits and ML race predictions.",
    type: "website",
    siteName: "F1 Predictor",
  },
  twitter: {
    card: "summary_large_image",
    title: "F1 Predictor | 2025 Analytics",
    description: "AI-powered Formula 1 analytics and ML race predictions.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} antialiased selection:bg-red-500/30`}>
        <Providers>
          <div className="relative z-10">
            <Navbar />
            <main className="pt-24">
              {children}
            </main>
          </div>

          {/* Subtle Ambient Glow Background Element */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-600/5 blur-[120px] pointer-events-none -z-10" />
        </Providers>
      </body>
    </html>
  );
}