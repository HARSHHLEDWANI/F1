import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import Navbar from "@/components/navbar";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "F1 Predictor | 2026 Analytics",
  description: "AI-powered Formula 1 telemetry and race predictions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-red-500/30`}>
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