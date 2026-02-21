import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import Navbar from "@/components/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F1 Predictor - Formula 1 Predictions & Analytics",
  description:
    "Explore teams, drivers, and race tracks with AI-powered F1 predictions",
  keywords: "Formula 1, F1, Racing, Predictions, Teams, Drivers, Tracks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <Providers>

          {/* Fixed Navbar */}
          <Navbar />

          {/* Main Content — prevents overlap with fixed navbar */}
          <main className="pt-20 min-h-screen">
            {children}
          </main>

        </Providers>
      </body>
    </html>
  );
}