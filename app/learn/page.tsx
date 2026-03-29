"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag, Trophy, Zap, Clock, Users, AlertTriangle,
  ChevronDown, ChevronUp, CheckCircle2, Circle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Module {
  id: string;
  icon: React.ElementType;
  title: string;
  tagline: string;
  color: string;
  content: React.ReactNode;
}

// ── Module Content ────────────────────────────────────────────────────────────
const modules: Module[] = [
  {
    id: "what-is-f1",
    icon: Zap,
    title: "What is Formula 1?",
    tagline: "The fastest sport on the planet",
    color: "#DC0000",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-300 text-lg leading-relaxed">
          Imagine 20 drivers in the world's fastest cars — each one pushing over{" "}
          <span className="text-red-500 font-bold">300 km/h</span> (that's faster
          than most commercial aircraft take off!) — competing on famous tracks
          across the globe. That's Formula 1.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Top Speed", value: "350+ km/h", sub: "faster than a bullet train" },
            { label: "G-Force", value: "6G", sub: "like 6× your body weight" },
            { label: "Race Calendar", value: "24 races", sub: "across 5 continents" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-red-500 mb-1">{stat.value}</p>
              <p className="text-xs font-bold uppercase text-neutral-400 tracking-widest">{stat.label}</p>
              <p className="text-xs text-neutral-500 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>
        <Callout icon="💡" title="Fun Analogy">
          Think of F1 like a combination of chess and sprinting. You need lightning-fast
          reflexes <em>and</em> a clever strategy — both driver and team matter!
        </Callout>
      </div>
    ),
  },
  {
    id: "race-weekend",
    icon: Clock,
    title: "The Race Weekend",
    tagline: "Three days, three phases",
    color: "#0600EF",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-300 leading-relaxed">
          A Grand Prix isn't just one race — it's an entire weekend of action across three days.
        </p>
        <div className="space-y-3">
          {[
            {
              day: "Friday",
              sessions: ["FP1 – Free Practice 1", "FP2 – Free Practice 2"],
              desc: "Teams test setups, learn the track, collect data. Like studying before an exam.",
              badge: "Practice",
              badgeColor: "bg-blue-600/20 text-blue-400 border-blue-600/30",
            },
            {
              day: "Saturday",
              sessions: ["FP3 – Free Practice 3", "Qualifying"],
              desc: "Qualifying decides starting positions. Fastest lap wins pole position — P1 on the grid.",
              badge: "Qualify",
              badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            },
            {
              day: "Sunday",
              sessions: ["THE RACE 🏁"],
              desc: "The main event! Drivers race for championship points. First to cross the finish line wins.",
              badge: "Race Day",
              badgeColor: "bg-red-600/20 text-red-400 border-red-600/30",
            },
          ].map((d) => (
            <div key={d.day} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-lg">{d.day}</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${d.badgeColor}`}>
                  {d.badge}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                {d.sessions.map((s) => (
                  <span key={s} className="text-xs bg-white/10 px-3 py-1 rounded-full font-mono">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-sm text-neutral-400">{d.desc}</p>
            </div>
          ))}
        </div>
        <Callout icon="🏎️" title="Sprint Weekends">
          Some races also have a Sprint — a shorter 100km race on Saturday that also awards
          points. Think of it as bonus content!
        </Callout>
      </div>
    ),
  },
  {
    id: "teams-drivers",
    icon: Users,
    title: "Teams & Drivers",
    tagline: "10 teams, 20 drivers, infinite drama",
    color: "#FF8700",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-300 leading-relaxed">
          F1 has <span className="text-red-500 font-bold">10 teams</span> (called{" "}
          <em>constructors</em>), and each team runs{" "}
          <span className="text-red-500 font-bold">2 cars</span> with 2 drivers.
          That gives us exactly 20 drivers on the grid.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { team: "Red Bull", color: "#0600EF", drivers: "Verstappen & Perez", champs: "4× recent champs" },
            { team: "Ferrari", color: "#DC0000", drivers: "Leclerc & Sainz", champs: "Most wins ever (16)" },
            { team: "Mercedes", color: "#00D4BE", drivers: "Hamilton & Russell", champs: "7× constructors" },
            { team: "McLaren", color: "#FF8700", drivers: "Norris & Piastri", champs: "Rising in 2024" },
            { team: "Aston Martin", color: "#006F62", drivers: "Alonso & Stroll", champs: "Alonso: 2× champ" },
            { team: "Alpine", color: "#0082FA", drivers: "Gasly & Ocon", champs: "French flag carrier" },
          ].map((t) => (
            <div
              key={t.team}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <div
                className="w-2 self-stretch rounded-full flex-shrink-0"
                style={{ backgroundColor: t.color }}
              />
              <div className="min-w-0">
                <p className="font-black">{t.team}</p>
                <p className="text-xs text-neutral-400">{t.drivers}</p>
                <p className="text-xs text-neutral-600 mt-0.5 italic">{t.champs}</p>
              </div>
            </div>
          ))}
        </div>
        <Callout icon="🧠" title="Key Difference: Driver vs Constructor Championship">
          There are TWO championships each year — one for the best{" "}
          <strong>driver</strong> and one for the best <strong>team</strong>.
          A team earns points from both its cars combined.
        </Callout>
      </div>
    ),
  },
  {
    id: "points",
    icon: Trophy,
    title: "The Points System",
    tagline: "How drivers earn their championship",
    color: "#FFD700",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-300 leading-relaxed">
          After every race, the top 10 drivers collect championship points.
          At the end of the season, whoever has the most points becomes{" "}
          <span className="text-yellow-400 font-bold">World Champion</span>.
        </p>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {[
            { pos: "P1", pts: 25, medal: "🥇" },
            { pos: "P2", pts: 18, medal: "🥈" },
            { pos: "P3", pts: 15, medal: "🥉" },
            { pos: "P4", pts: 12, medal: "" },
            { pos: "P5", pts: 10, medal: "" },
            { pos: "P6", pts: 8, medal: "" },
            { pos: "P7", pts: 6, medal: "" },
            { pos: "P8", pts: 4, medal: "" },
            { pos: "P9", pts: 2, medal: "" },
            { pos: "P10", pts: 1, medal: "" },
          ].map((p) => (
            <div
              key={p.pos}
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
            >
              <p className="text-[10px] font-bold text-neutral-500 uppercase">{p.pos}</p>
              <p className="text-xl font-black text-white">{p.pts}</p>
              {p.medal && <p className="text-sm">{p.medal}</p>}
            </div>
          ))}
        </div>
        <Callout icon="⚡" title="Bonus Point: Fastest Lap">
          One extra point is awarded for the fastest single lap of the race —
          but only if that driver finishes in the top 10!
        </Callout>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-sm font-bold mb-2 text-neutral-300">Example season:</p>
          <p className="text-sm text-neutral-400">
            If you win every race, you'd score <strong className="text-white">25 × 24 = 600 points</strong>.
            In reality, the 2024 champion (Verstappen) scored around <strong className="text-white">437 points</strong> —
            no one wins every race!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "flags",
    icon: Flag,
    title: "F1 Flags Explained",
    tagline: "What marshals are trying to tell drivers",
    color: "#22c55e",
    content: (
      <div className="space-y-4">
        <p className="text-neutral-300 leading-relaxed">
          Marshals wave flags at the trackside to communicate with drivers during a race.
          Each colour has a specific meaning — drivers must obey them instantly.
        </p>
        <div className="space-y-3">
          {[
            { flag: "🟢", name: "Green Flag", meaning: "All clear — go full speed! Track is safe." },
            { flag: "🟡", name: "Yellow Flag", meaning: "Danger ahead. Slow down, NO overtaking. A car may be stopped on track." },
            { flag: "🔴", name: "Red Flag", meaning: "Race STOPPED. Everyone slows down and returns to pit lane. Serious incident ahead." },
            { flag: "🏁", name: "Chequered Flag", meaning: "The race is OVER! First car to see this flag wins." },
            { flag: "🔵", name: "Blue Flag", meaning: "A faster car (usually a lap ahead) is about to overtake you. Move aside!" },
            { flag: "⬛🟨", name: "Black & Yellow Flag", meaning: "Your car has damage — return to the pit for repairs." },
            { flag: "⬛", name: "Black Flag", meaning: "You are disqualified. Come into the pit immediately." },
            { flag: "🏳️", name: "White Flag", meaning: "A slow vehicle (like a Safety Car) is on the track ahead." },
          ].map((f) => (
            <div key={f.name} className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-2xl flex-shrink-0 w-8 text-center">{f.flag}</span>
              <div>
                <p className="font-bold text-white">{f.name}</p>
                <p className="text-sm text-neutral-400">{f.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "pit-stops",
    icon: AlertTriangle,
    title: "Pit Stops",
    tagline: "The art of changing 4 tyres in under 2 seconds",
    color: "#a855f7",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-300 leading-relaxed">
          During a race, cars must stop at least once to change their tyres — this is called
          a <strong className="text-white">pit stop</strong>. A top team can swap all 4 tyres
          in under <span className="text-red-500 font-bold">2 seconds</span>!
        </p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-black mb-4 text-white">How a Pit Stop Works</h3>
          <ol className="space-y-3">
            {[
              "Driver radios in: "Box, box" means come to the pits",
              "Car drives down the pit lane (~80km/h speed limit)",
              "Car stops in its exact garage spot — millimetre precision",
              "20 mechanics surround the car simultaneously",
              "3 mechanics per wheel: one removes nut, one takes old tyre, one puts new tyre",
              "Green light goes on — driver accelerates back into the race",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                <span className="bg-red-600/20 text-red-500 border border-red-600/30 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: "Soft 🔴", desc: "Fastest, but wears out quickly. Best for short stints or one hot lap." },
            { type: "Medium 🟡", desc: "Balanced tyre. Good speed AND durability. Most common strategy." },
            { type: "Hard ⚪", desc: "Slowest, but lasts the longest. Great for long stints without stopping." },
          ].map((t) => (
            <div key={t.type} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="font-black text-sm mb-2">{t.type}</p>
              <p className="text-xs text-neutral-400">{t.desc}</p>
            </div>
          ))}
        </div>
        <Callout icon="🎯" title="Strategy matters!">
          Deciding when to pit — and which tyre to switch to — is one of the biggest tactical
          decisions in F1. Teams run simulations on supercomputers during the race to find
          the perfect moment.
        </Callout>
      </div>
    ),
  },
  {
    id: "drs",
    icon: Zap,
    title: "DRS: The Overtaking Superpower",
    tagline: "How drivers get an aerodynamic boost",
    color: "#06b6d4",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-300 leading-relaxed">
          DRS stands for <strong className="text-white">Drag Reduction System</strong>.
          It's a flap on the rear wing that opens up to reduce air resistance — giving a driver
          a speed boost of around <span className="text-red-500 font-bold">10-15 km/h</span>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="font-black mb-2 flex items-center gap-2">
              <span className="text-green-400">✅</span> DRS Open
            </p>
            <p className="text-sm text-neutral-400">
              Rear wing flap opens → less air resistance → more top speed.
              Like opening a parachute in reverse!
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="font-black mb-2 flex items-center gap-2">
              <span className="text-red-400">❌</span> DRS Closed
            </p>
            <p className="text-sm text-neutral-400">
              Wing stays closed → more downforce → better cornering grip.
              Essential through fast corners.
            </p>
          </div>
        </div>
        <div className="bg-red-600/10 border border-red-600/20 rounded-2xl p-5">
          <h3 className="font-black mb-3 text-red-400">Rules for DRS</h3>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> You must be within <strong>1 second</strong> of the car ahead to use it</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> It can only be used in designated <strong>DRS zones</strong> (straights)</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> DRS is disabled in wet or dangerous conditions</li>
            <li className="flex items-start gap-2"><Circle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" /> Each circuit has <strong>1–4 DRS zones</strong></li>
          </ul>
        </div>
        <Callout icon="🤔" title="Why does DRS exist?">
          Before DRS (introduced in 2011), overtaking was very difficult because the car
          behind gets hit by turbulent "dirty air" from the car in front. DRS helps level
          the playing field and creates more exciting racing!
        </Callout>
      </div>
    ),
  },
];

// ── Helper Components ─────────────────────────────────────────────────────────
function Callout({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <p className="font-black text-sm mb-1 text-white">{title}</p>
        <p className="text-sm text-neutral-400 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LearnPage() {
  const [openModule, setOpenModule] = useState<string | null>("what-is-f1");
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggleModule = (id: string) => {
    setOpenModule((prev) => (prev === id ? null : id));
    setCompleted((prev) => new Set([...prev, id]));
  };

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* ── HERO ── */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-full text-sm text-red-400 font-bold mb-6">
            <Zap size={14} fill="currentColor" />
            Beginner Friendly
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
            LEARN{" "}
            <span className="text-red-600 font-normal not-italic">F1</span>
          </h1>
          <p className="text-neutral-400 text-xl max-w-2xl leading-relaxed">
            New to Formula 1? No problem. These bite-sized modules explain everything
            you need to know — from flags to pit stops — in plain language.
          </p>
        </motion.div>

        {/* ── PROGRESS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-5 bg-white/5 border border-white/10 rounded-2xl"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-neutral-300">
              Progress: {completed.size} / {modules.length} modules
            </span>
            <span className="text-xs text-neutral-500">
              {completed.size === modules.length ? "🏆 All done!" : "Keep going!"}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
              animate={{ width: `${(completed.size / modules.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {modules.map((m) => (
              <div
                key={m.id}
                className={`w-6 h-2 rounded-full transition-colors ${
                  completed.has(m.id) ? "bg-red-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── MODULES ── */}
      <div className="max-w-4xl mx-auto px-6 pb-24 space-y-4">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          const isOpen = openModule === mod.id;
          const isDone = completed.has(mod.id);

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden"
            >
              {/* ── MODULE HEADER ── */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center gap-5 p-6 text-left group"
              >
                {/* Icon */}
                <div
                  className="p-3 rounded-2xl flex-shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: `${mod.color}20`,
                    border: `1px solid ${mod.color}40`,
                  }}
                >
                  <Icon
                    size={22}
                    style={{ color: mod.color }}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-0.5">
                    <h2 className="font-black text-lg text-white group-hover:text-red-400 transition-colors">
                      {mod.title}
                    </h2>
                    {isDone && (
                      <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                        ✓ Read
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500">{mod.tagline}</p>
                </div>

                {/* Chevron */}
                <div className="flex-shrink-0 text-neutral-500 group-hover:text-white transition-colors">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {/* ── MODULE BODY ── */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-6 pb-8"
                      style={{ borderTop: `1px solid ${mod.color}30` }}
                    >
                      <div className="pt-6">{mod.content}</div>

                      {/* Mark complete button */}
                      <button
                        onClick={() => {
                          setCompleted((prev) => new Set([...prev, mod.id]));
                          // scroll to next module
                          const currentIdx = modules.findIndex((m) => m.id === mod.id);
                          const next = modules[currentIdx + 1];
                          if (next) {
                            setOpenModule(next.id);
                          } else {
                            setOpenModule(null);
                          }
                        }}
                        className="mt-8 w-full py-4 rounded-2xl font-black uppercase tracking-tighter text-sm transition-all"
                        style={{
                          backgroundColor: `${mod.color}20`,
                          border: `1px solid ${mod.color}50`,
                          color: mod.color,
                        }}
                      >
                        {modules.findIndex((m) => m.id === mod.id) < modules.length - 1
                          ? "Got it — next module →"
                          : "🏆 Complete!"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* ── COMPLETION CARD ── */}
        {completed.size === modules.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-600/30 rounded-3xl p-10 text-center"
          >
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-3xl font-black italic mb-2">You're an F1 Expert!</h2>
            <p className="text-neutral-400 mb-6">
              You've completed all {modules.length} modules. Time to make your first prediction!
            </p>
            <a
              href="/prediction"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-tighter text-sm transition-all"
            >
              Make a Prediction →
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
