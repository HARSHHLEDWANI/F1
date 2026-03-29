"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Zap, Trophy, Users, Map, Cpu,
  BookOpen, Gamepad2, ArrowRight, TrendingUp, Clock
} from "lucide-react";
import SpeedCanvas from "@/components/SpeedCanvas";
import TiltCard from "@/components/TiltCard";
import GlowButton from "@/components/GlowButton";

// ── Mock standings (replaced by real API data on driver page) ────────────────
const STANDINGS = [
  { pos: 1, code: "VER", full: "Max Verstappen",    team: "Red Bull",    pts: 437, color: "#0600EF", delta: "+125" },
  { pos: 2, code: "NOR", full: "Lando Norris",       team: "McLaren",     pts: 374, color: "#FF8700", delta: "+63"  },
  { pos: 3, code: "LEC", full: "Charles Leclerc",    team: "Ferrari",     pts: 356, color: "#DC0000", delta: "+18"  },
  { pos: 4, code: "PIA", full: "Oscar Piastri",      team: "McLaren",     pts: 292, color: "#FF8700", delta: "+64"  },
  { pos: 5, code: "SAI", full: "Carlos Sainz",       team: "Ferrari",     pts: 290, color: "#DC0000", delta: "+2"   },
];

const FEATURES = [
  {
    icon: BookOpen, label: "Learn F1", href: "/learn",
    desc: "7 interactive modules. From flags to pit stops — explained simply.",
    badge: "Beginner", badgeColor: "#22c55e",
    stat: "7 modules",
  },
  {
    icon: Gamepad2, label: "Simulations", href: "/simulations",
    desc: "Interactive F1 simulators — flag quiz, pit stop challenge, DRS demo.",
    badge: "Interactive", badgeColor: "#a855f7",
    stat: "4 games",
  },
  {
    icon: Trophy, label: "Drivers", href: "/drivers",
    desc: "20 driver profiles with live ratings and career stats.",
    badge: "Live", badgeColor: "#E10600",
    stat: "20 drivers",
  },
  {
    icon: Users, label: "Teams", href: "/teams",
    desc: "All 10 constructors — car specs, rosters, championship history.",
    badge: "2024", badgeColor: "#0600EF",
    stat: "10 teams",
  },
  {
    icon: Map, label: "Circuits", href: "/tracks",
    desc: "24 circuits with lap records, DRS zones, and difficulty ratings.",
    badge: "Global", badgeColor: "#06b6d4",
    stat: "24 tracks",
  },
  {
    icon: Cpu, label: "Predictions", href: "/prediction",
    desc: "AI-powered podium predictions using Random Forest + 17 features.",
    badge: "AI", badgeColor: "#f59e0b",
    stat: "ML powered",
  },
];

const STATS = [
  { label: "Race Rounds",   val: "24",   suffix: "" },
  { label: "Active Teams",  val: "10",   suffix: "" },
  { label: "Grid Drivers",  val: "20",   suffix: "" },
  { label: "AI Features",   val: "17",   suffix: "" },
];

// ── Animated char-by-char title ──────────────────────────────────────────────
function AnimatedTitle() {
  const word1 = "F1";
  const word2 = "PREDICTOR";

  return (
    <h1 className="text-[clamp(4rem,12vw,10rem)] font-black italic tracking-tighter leading-none mb-6">
      <span className="block">
        {word1.split("").map((c, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 + 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="inline-block"
          >
            {c}
          </motion.span>
        ))}
      </span>
      <span className="block" style={{ color: "#E10600", textShadow: "0 0 30px rgba(225,6,0,0.5)" }}>
        {word2.split("").map((c, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 + 0.4, type: "spring", stiffness: 200, damping: 20 }}
            className="inline-block"
          >
            {c}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = target / 40;
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 30);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Race Countdown (decorative) ───────────────────────────────────────────────
function RaceCountdown() {
  const [time, setTime] = useState({ d: 5, h: 14, m: 32, s: 11 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { d, h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        if (d < 0) return prev;
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-3 font-mono">
      {[{ label: "DAYS", val: time.d }, { label: "HRS", val: time.h }, { label: "MIN", val: time.m }, { label: "SEC", val: time.s }].map(({ label, val }, i) => (
        <div key={label} className="flex flex-col items-center">
          <motion.span
            key={val}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-black text-white tabular-nums"
          >
            {pad(val)}
          </motion.span>
          <span className="text-[8px] text-neutral-600 uppercase tracking-widest">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <div className="overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      >
        {/* Speed streaks background */}
        <SpeedCanvas intensity={0.6} />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_transparent_30%,_#050508_100%)] pointer-events-none z-[1]" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050508] to-transparent z-[1] pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20"
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E10600]/10 border border-[#E10600]/20 text-[#E10600] text-[10px] font-black tracking-widest uppercase mb-8"
          >
            <span className="w-1.5 h-1.5 bg-[#E10600] rounded-full pulse-red" />
            2024 Season · AI Telemetry Active
          </motion.div>

          {/* Title */}
          <AnimatedTitle />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-neutral-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          >
            The next-generation Formula 1 platform. Learn the sport, explore the data,
            and let AI predict the podium — all in one place.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap gap-4"
          >
            <GlowButton href="/prediction" variant="red">
              <Zap size={16} fill="white" /> Launch Predictor
            </GlowButton>
            <GlowButton href="/learn" variant="white">
              <BookOpen size={16} /> Learn F1
            </GlowButton>
            <GlowButton href="/simulations" variant="outline">
              <Gamepad2 size={16} /> Simulations
            </GlowButton>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-20 flex items-center gap-3"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-[1px] h-10 bg-gradient-to-b from-[#E10600] to-transparent"
            />
            <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Scroll to explore</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          LIVE DASHBOARD STRIP
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Standings Card */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-3xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">2024 Season</div>
                  <h2 className="text-2xl font-black">Driver Standings</h2>
                </div>
                <Link
                  href="/drivers"
                  className="text-xs font-black text-[#E10600] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                >
                  All drivers <ArrowRight size={12} />
                </Link>
              </div>

              <div className="space-y-3">
                {STANDINGS.map((d, i) => (
                  <motion.div
                    key={d.code}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-white/4 border border-white/5 group hover:bg-white/8 transition-all cursor-default"
                  >
                    {/* Pos */}
                    <span className="font-mono text-neutral-600 text-sm w-5 text-center">{d.pos}</span>

                    {/* Team color bar */}
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />

                    {/* Name */}
                    <div className="flex-1">
                      <p className="font-black text-sm tracking-wide text-white">{d.code}</p>
                      <p className="text-[10px] text-neutral-500">{d.team}</p>
                    </div>

                    {/* Points bar */}
                    <div className="flex-1 hidden sm:block">
                      <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: d.color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(d.pts / 437) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 + 0.3, duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Pts */}
                    <span className="font-mono font-black text-sm text-white w-16 text-right">{d.pts} PTS</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Race Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6"
            >
              {/* Next race countdown */}
              <div className="glass-card-red rounded-3xl p-8 relative overflow-hidden flex-1">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#E10600]/8 blur-2xl pointer-events-none" />
                <div className="text-[10px] text-[#E10600] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#E10600] rounded-full pulse-red" />
                  Next Race
                </div>
                <h3 className="text-3xl font-black italic mb-1">Miami GP</h3>
                <p className="text-neutral-500 text-sm mb-6">Miami International Autodrome · Round 6</p>
                <div className="flex items-center gap-4 mb-6">
                  <Clock size={14} className="text-neutral-500" />
                  <RaceCountdown />
                </div>
                <GlowButton href="/prediction" variant="red" className="w-full">
                  Predict the Podium <ChevronRight size={14} />
                </GlowButton>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Fastest Lap", val: "1:28.114", sub: "Leclerc · Miami", icon: "⚡" },
                  { label: "Championship Lead", val: "+63 PTS", sub: "Verstappen vs Norris", icon: "🏆" },
                ].map((s) => (
                  <div key={s.label} className="glass-card rounded-2xl p-5">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="font-mono font-black text-lg text-white">{s.val}</p>
                    <p className="text-[10px] text-neutral-600 mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FEATURE GRID (TiltCards)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[10px] text-[#E10600] font-black uppercase tracking-widest mb-3">Everything F1</p>
            <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter">
              EXPLORE THE <span className="text-[#E10600]">PLATFORM</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.href}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                >
                  <TiltCard maxTilt={10} scale={1.02}>
                    <Link
                      href={f.href}
                      className="block glass-card rounded-3xl p-8 h-full group relative overflow-hidden hover:border-white/10 transition-all duration-300"
                    >
                      {/* Background glow on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse at 0% 0%, ${f.badgeColor}08 0%, transparent 60%)` }}
                      />

                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                        style={{ backgroundColor: `${f.badgeColor}18`, border: `1px solid ${f.badgeColor}30` }}
                      >
                        <Icon size={22} style={{ color: f.badgeColor }} />
                      </div>

                      {/* Badge */}
                      <span
                        className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 border"
                        style={{ color: f.badgeColor, backgroundColor: `${f.badgeColor}15`, borderColor: `${f.badgeColor}30` }}
                      >
                        {f.badge}
                      </span>

                      {/* Title */}
                      <h3 className="text-2xl font-black italic tracking-tighter mb-2 group-hover:text-white transition-colors">
                        {f.label}
                      </h3>

                      {/* Desc */}
                      <p className="text-sm text-neutral-500 leading-relaxed mb-6">{f.desc}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-neutral-600">{f.stat}</span>
                        <span
                          className="text-xs font-black uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all"
                          style={{ color: f.badgeColor }}
                        >
                          Explore <ArrowRight size={12} />
                        </span>
                      </div>

                      {/* Racing line bottom accent */}
                      <div
                        className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                        style={{ background: `linear-gradient(90deg, ${f.badgeColor}, transparent)` }}
                      />
                    </Link>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          ANIMATED STATS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E10600]/3 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-black italic font-mono mb-2" style={{ color: "#E10600" }}>
                  <Counter target={parseInt(s.val)} suffix={s.suffix} />
                </div>
                <p className="text-[11px] text-neutral-500 uppercase tracking-widest font-bold">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          LEARN F1 CTA BANNER
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3rem] carbon-fiber border border-white/6 p-16 text-center"
          >
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#E10600]/8 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute top-4 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#E10600]/30 to-transparent pointer-events-none" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-5xl mb-6"
            >
              🏎️
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4">
              NEW TO FORMULA 1?
            </h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Start with our beginner modules — understand flags, pit stops,
              points, and everything in between. Interactive & fun.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <GlowButton href="/learn" variant="red">
                <BookOpen size={16} /> Start Learning Free
              </GlowButton>
              <GlowButton href="/simulations" variant="outline">
                <Gamepad2 size={16} /> Try Simulations
              </GlowButton>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
