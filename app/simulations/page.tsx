"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Gamepad } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Zap, Clock, Trophy, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import GlowButton from "@/components/GlowButton";

// ════════════════════════════════════════════════════════════════════
// 1. FLAG QUIZ
// ════════════════════════════════════════════════════════════════════
const FLAGS = [
  {
    emoji: "🟢", name: "Green Flag",
    meaning: "All clear — go full speed! Track is safe.",
    options: ["Go full speed, track clear", "Danger ahead, slow down", "Race stopped", "Move aside for faster car"],
    correct: 0,
    tip: "Green means GO! You'll see this at the start of sessions or after a safety period ends.",
  },
  {
    emoji: "🟡", name: "Yellow Flag",
    meaning: "Danger ahead — slow down, NO overtaking.",
    options: ["Fastest lap bonus point", "Danger ahead — slow down, no overtaking", "Race is over", "DRS is enabled"],
    correct: 1,
    tip: "Double yellow = extreme danger. Single yellow = caution. Overtaking under yellows gets you a penalty!",
  },
  {
    emoji: "🔴", name: "Red Flag",
    meaning: "Race stopped — serious incident ahead.",
    options: ["Fastest lap set", "Penalty for driver", "Race stopped immediately", "Pit lane open"],
    correct: 2,
    tip: "Red flag means EVERYONE slows and returns to pit lane. Often caused by crashes or bad weather.",
  },
  {
    emoji: "🏁", name: "Chequered Flag",
    meaning: "Race is OVER — first to see this wins!",
    options: ["Race is over", "Pit stop required", "Slow zone ahead", "Safety car deployed"],
    correct: 0,
    tip: "The most exciting flag in motorsport! The chequered pattern has been used since the 1900s.",
  },
  {
    emoji: "🔵", name: "Blue Flag",
    meaning: "A faster car (usually a lap ahead) is behind you — move over!",
    options: ["Rain warning", "Fastest lap achieved", "Move aside for a lapping car", "Pit lane speed limit"],
    correct: 2,
    tip: "Ignoring 3 blue flags in a row earns you a 5-second penalty. Always respect the blue!",
  },
  {
    emoji: "⬛🟨", name: "Black & Yellow Flag",
    meaning: "Your car has damage — return to pit immediately.",
    options: ["Disqualified", "Car has damage — pit now", "Fastest lap lost", "Contact warning"],
    correct: 1,
    tip: "Shown with your car number. The team radios you too, but the flag is the official signal.",
  },
];

function FlagQuiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const flag = FLAGS[current];

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === flag.correct) setScore((s) => s + 1);
    setShowTip(true);
  };

  const next = () => {
    if (current < FLAGS.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowTip(false);
    } else {
      setDone(true);
    }
  };

  const reset = () => {
    setCurrent(0); setSelected(null); setScore(0); setDone(false); setShowTip(false);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
        <div className="text-6xl mb-4">{score === FLAGS.length ? "🏆" : score >= 4 ? "🎉" : "📚"}</div>
        <h3 className="text-3xl font-black italic mb-2">
          {score}/{FLAGS.length} Correct
        </h3>
        <p className="text-neutral-400 mb-6">
          {score === FLAGS.length ? "Perfect! You're a marshal-level expert." :
           score >= 4 ? "Great job! A few more reviews and you'll nail it." :
           "Keep learning! Review the flags and try again."}
        </p>
        <GlowButton onClick={reset} variant="red"><RotateCcw size={14} /> Try Again</GlowButton>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
        <span>Question {current + 1} of {FLAGS.length}</span>
        <span className="text-[#E10600] font-black">{score} correct</span>
      </div>
      <div className="h-1 bg-white/8 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-[#E10600] rounded-full"
          animate={{ width: `${((current) / FLAGS.length) * 100}%` }}
        />
      </div>

      {/* Flag display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center py-6"
        >
          <div className="text-8xl mb-4">{flag.emoji}</div>
          <h3 className="text-xl font-black mb-1">{flag.name}</h3>
          <p className="text-neutral-500 text-sm">What does this flag mean?</p>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="space-y-3">
        {flag.options.map((opt, i) => {
          const isChosen = selected === i;
          const isCorrect = i === flag.correct;
          let bg = "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/8";
          if (selected !== null) {
            if (isCorrect) bg = "bg-green-500/15 border-green-500/40 text-green-400";
            else if (isChosen) bg = "bg-red-500/15 border-red-500/40 text-red-400";
            else bg = "bg-white/3 border-white/5 text-neutral-600";
          }

          return (
            <motion.button
              key={i}
              onClick={() => choose(i)}
              whileTap={selected === null ? { scale: 0.98 } : {}}
              className={`w-full text-left px-5 py-4 rounded-2xl border text-sm font-bold transition-all flex items-center justify-between ${bg}`}
              disabled={selected !== null}
            >
              <span>{opt}</span>
              {selected !== null && isCorrect && <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />}
              {selected !== null && isChosen && !isCorrect && <XCircle size={18} className="text-red-400 flex-shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {/* Tip + Next */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-neutral-400 flex gap-3">
              <span className="text-xl">💡</span>
              <span>{flag.tip}</span>
            </div>
            <div className="mt-4 flex justify-end">
              <GlowButton onClick={next} variant="red">
                {current < FLAGS.length - 1 ? "Next Flag →" : "See Results 🏁"}
              </GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// 2. POINTS CALCULATOR
// ════════════════════════════════════════════════════════════════════
const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const POSITION_LABELS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function PointsCalculator() {
  const [pos, setPos] = useState(1);
  const pts = POINTS_TABLE[pos - 1];
  const pct = (pts / 25) * 100;

  const descriptions: Record<number, string> = {
    1: "The WINNER! Maximum points, champagne, and standing on the top step of the podium.",
    2: "Second place — solid haul! One spot from glory, but still crucial for the championship.",
    3: "Podium finish! You get champagne, a trophy, and your national anthem plays.",
    4: "Just off the podium — frustrating but important points for the season.",
    5: "Top 5 is still excellent. Double digits on the scoreboard.",
    6: "Mid-pack leadership. 8 points can change a championship by season end.",
    7: "Good result! Every point matters over 24 races.",
    8: "Solid points. Teams fight hard for P8.",
    9: "Just 2 points — but 2 is better than 0!",
    10: "The last points-scoring position. Only 1 point, but it counts!",
  };

  return (
    <div className="space-y-8">
      {/* Giant position display */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={pos}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="text-7xl font-black italic text-[#E10600] mb-0">{pos > 10 ? "—" : pts}</div>
            <div className="text-sm text-neutral-500 uppercase tracking-widest">points awarded</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Points bar */}
      <div>
        <div className="h-3 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#E10600] to-[#ff4444]"
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-neutral-500 uppercase tracking-widest">
          <span>P1</span><span>P10</span><span>P20</span>
        </div>
        <input
          type="range"
          min={1}
          max={20}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="w-full accent-[#E10600] cursor-pointer"
          style={{ accentColor: "#E10600" }}
        />
        <div className="text-center font-black text-2xl">
          {POSITION_LABELS[pos] ?? ""} P{pos}
        </div>
      </div>

      {/* Context blurb */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-neutral-400 leading-relaxed">
        {descriptions[pos] ?? `P${pos} — No championship points. The team earns nothing for the constructors standings.`}
      </div>

      {/* Points grid */}
      <div className="grid grid-cols-5 gap-2">
        {POINTS_TABLE.slice(0, 10).map((p, i) => (
          <motion.button
            key={i}
            onClick={() => setPos(i + 1)}
            whileHover={{ scale: 1.05 }}
            className={`py-3 rounded-xl text-center border transition-all ${
              pos === i + 1
                ? "bg-[#E10600]/20 border-[#E10600]/40 text-[#E10600]"
                : "bg-white/5 border-white/8 text-neutral-400 hover:bg-white/8"
            }`}
          >
            <div className="text-[10px] text-neutral-600 uppercase">P{i + 1}</div>
            <div className="font-black text-sm">{p}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// 3. PIT STOP CHALLENGE
// ════════════════════════════════════════════════════════════════════
const PIT_RECORDS = [
  { team: "Red Bull", time: "1.82s", year: 2023 },
  { team: "McLaren",  time: "1.91s", year: 2022 },
  { team: "Ferrari",  time: "1.97s", year: 2019 },
];

type PitState = "idle" | "entering" | "waiting" | "go" | "done";

function PitStopChallenge() {
  const [phase, setPhase] = useState<PitState>("idle");
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const goTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    setPhase("entering");
    setReactionMs(null);
    const wait = 1500 + Math.random() * 2500;
    timeoutRef.current = setTimeout(() => {
      setPhase("go");
      goTimeRef.current = performance.now();
    }, wait);
  }, []);

  const release = useCallback(() => {
    if (phase === "go") {
      const rt = Math.round(performance.now() - goTimeRef.current);
      setReactionMs(rt);
      setPhase("done");
      setBest((b) => (b === null || rt < b ? rt : b));
    } else if (phase === "entering" || phase === "waiting") {
      // Too early
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setReactionMs(-1);
      setPhase("done");
    }
  }, [phase]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const rating = (ms: number) => {
    if (ms < 300) return { label: "World Record Speed! 🏆", color: "#22c55e" };
    if (ms < 500) return { label: "Red Bull Level! ⚡", color: "#E10600" };
    if (ms < 700) return { label: "McLaren Speed! 🟠", color: "#FF8700" };
    if (ms < 1000) return { label: "Solid Mechanic 👍", color: "#06b6d4" };
    return { label: "Keep practicing! 💪", color: "#f59e0b" };
  };

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
        Press and hold <strong className="text-white">GO</strong> when the car enters the pit box.
        Release the moment the green light appears. Test your mechanic reaction time!
      </div>

      {/* Record board */}
      <div className="grid grid-cols-3 gap-3">
        {PIT_RECORDS.map((r) => (
          <div key={r.team} className="bg-white/5 border border-white/8 rounded-2xl p-3 text-center">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">{r.team}</p>
            <p className="font-mono font-black text-lg text-[#E10600]">{r.time}</p>
            <p className="text-[9px] text-neutral-600">{r.year}</p>
          </div>
        ))}
      </div>

      {/* Game area */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0e] p-8 min-h-[200px] flex flex-col items-center justify-center gap-6">
        {/* Track lanes (decorative) */}
        <div className="absolute inset-0 flex flex-col justify-center gap-2 pointer-events-none opacity-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-px bg-white w-full" />
          ))}
        </div>

        {/* Car + light */}
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="text-5xl mb-3">🏎️</div>
              <p className="text-neutral-500 text-sm">Car is on track. Press GO to call the pit stop.</p>
            </motion.div>
          )}
          {phase === "entering" && (
            <motion.div
              key="enter"
              initial={{ x: "60%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center"
            >
              <div className="text-6xl">🏎️</div>
              <p className="text-neutral-400 text-sm mt-2 animate-pulse">Car entering pit box…</p>
            </motion.div>
          )}
          {phase === "go" && (
            <motion.div
              key="go"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], boxShadow: ["0 0 0 rgba(34,197,94,0)", "0 0 40px rgba(34,197,94,0.8)", "0 0 0 rgba(34,197,94,0)"] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-3xl font-black text-black mx-auto"
              >
                GO
              </motion.div>
              <p className="text-green-400 font-bold text-sm mt-3">RELEASE NOW!</p>
            </motion.div>
          )}
          {phase === "done" && reactionMs !== null && (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              {reactionMs === -1 ? (
                <>
                  <div className="text-5xl mb-2">🚨</div>
                  <p className="text-red-400 font-black text-xl mb-1">Too Early!</p>
                  <p className="text-neutral-500 text-sm">Wait for the green light before releasing.</p>
                </>
              ) : (
                <>
                  <div className="font-mono text-5xl font-black text-[#E10600] mb-1">{reactionMs}ms</div>
                  <p className="font-bold" style={{ color: rating(reactionMs).color }}>{rating(reactionMs).label}</p>
                  {best && <p className="text-xs text-neutral-600 mt-1">Best this session: {best}ms</p>}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action button */}
        <div className="mt-2">
          {(phase === "idle" || phase === "done") ? (
            <GlowButton onClick={start} variant="red">
              {phase === "done" ? <><RotateCcw size={14} /> Try Again</> : <>🏁 Call Pit Stop</>}
            </GlowButton>
          ) : (
            <motion.button
              onMouseUp={release}
              onTouchEnd={release}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl font-black text-sm uppercase tracking-widest active:bg-white/20 select-none"
            >
              Hold &amp; Release on GREEN
            </motion.button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-neutral-600">
        Real F1 teams aim for under 2 seconds. Red Bull&apos;s record is 1.82s with 20 mechanics working simultaneously!
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// 4. DRS EFFECT DEMO
// ════════════════════════════════════════════════════════════════════
function DRSDemo() {
  const [drsOn, setDrsOn] = useState(false);
  const [speed, setSpeed] = useState(280);
  const targetSpeed = drsOn ? 335 : 280;
  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
    const target = drsOn ? 335 : 280;
    const interval = setInterval(() => {
      const diff = target - speedRef.current;
      if (Math.abs(diff) < 0.5) {
        setSpeed(target);
        clearInterval(interval);
      } else {
        const next = speedRef.current + diff * 0.08;
        speedRef.current = next;
        setSpeed(Math.round(next));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [drsOn]);

  const speedPct = ((speed - 200) / (360 - 200)) * 100;
  const needleAngle = -90 + (speed - 200) / (360 - 200) * 180;

  return (
    <div className="space-y-8">
      <div className="text-center text-sm text-neutral-400 max-w-md mx-auto">
        Toggle DRS (Drag Reduction System) ON and watch the rear wing open — reducing drag and boosting top speed by ~15 km/h.
      </div>

      {/* Car view */}
      <div className="relative rounded-3xl bg-[#0a0a0e] border border-white/8 p-8 text-center overflow-hidden">
        {/* Speed streaks (more when DRS on) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(drsOn ? 12 : 4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#E10600]/40 to-transparent"
              style={{
                top: `${10 + i * 8}%`,
                width: `${30 + Math.random() * 40}%`,
                left: `${Math.random() * 20}%`,
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: drsOn ? 0.6 : 1.5, repeat: Infinity, delay: i * 0.1, ease: "linear" }}
            />
          ))}
        </div>

        {/* F1 car SVG (simplified top-down) */}
        <div className="relative z-10 flex justify-center mb-6">
          <svg width="120" height="200" viewBox="0 0 120 200" fill="none">
            {/* Body */}
            <ellipse cx="60" cy="110" rx="20" ry="70" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
            {/* Nose */}
            <path d="M52 40 Q60 20 68 40" fill="#E10600" />
            {/* Front wing */}
            <rect x="15" y="35" width="90" height="8" rx="4" fill="#2a2a2a" />
            {/* Rear wing - animates open when DRS on */}
            <motion.rect
              x="10" y="160" width="100" height={drsOn ? 4 : 10} rx="3"
              fill={drsOn ? "#22c55e" : "#E10600"}
              animate={{ height: drsOn ? 4 : 10, y: drsOn ? 163 : 160 }}
              transition={{ duration: 0.4 }}
            />
            {/* Wheels */}
            <rect x="5" y="60" width="18" height="30" rx="9" fill="#111" stroke="#333" strokeWidth="1" />
            <rect x="97" y="60" width="18" height="30" rx="9" fill="#111" stroke="#333" strokeWidth="1" />
            <rect x="5" y="130" width="18" height="30" rx="9" fill="#111" stroke="#333" strokeWidth="1" />
            <rect x="97" y="130" width="18" height="30" rx="9" fill="#111" stroke="#333" strokeWidth="1" />
            {/* DRS glow */}
            {drsOn && (
              <rect x="10" y="159" width="100" height="6" rx="3" fill="#22c55e" opacity="0.4" filter="url(#glow)" />
            )}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
          </svg>
        </div>

        {/* DRS status */}
        <motion.div
          animate={{ color: drsOn ? "#22c55e" : "#E10600" }}
          className="text-lg font-black uppercase tracking-widest mb-2"
        >
          DRS {drsOn ? "OPEN ✓" : "CLOSED ✗"}
        </motion.div>
        <p className="text-xs text-neutral-600">
          {drsOn ? "Rear wing flap open — less drag, more speed!" : "Rear wing closed — more downforce for corners."}
        </p>
      </div>

      {/* Speedometer */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-48 h-24 overflow-hidden">
          {/* Arc */}
          <svg width="192" height="96" viewBox="0 0 192 96">
            <path d="M 16 96 A 80 80 0 0 1 176 96" stroke="#1a1a1a" strokeWidth="12" fill="none" />
            <motion.path
              d="M 16 96 A 80 80 0 0 1 176 96"
              stroke={drsOn ? "#22c55e" : "#E10600"}
              strokeWidth="12"
              fill="none"
              strokeDasharray="251"
              animate={{ strokeDashoffset: 251 - (speedPct / 100) * 251 }}
              transition={{ duration: 0.1 }}
              style={{ filter: `drop-shadow(0 0 6px ${drsOn ? "#22c55e" : "#E10600"})` }}
            />
            {/* Needle */}
            <motion.line
              x1="96" y1="96" x2="96" y2="30"
              stroke="white" strokeWidth="2" strokeLinecap="round"
              style={{ transformOrigin: "96px 96px" }}
              animate={{ rotate: needleAngle }}
              transition={{ type: "spring", stiffness: 60, damping: 12 }}
            />
            <circle cx="96" cy="96" r="5" fill="white" />
          </svg>
        </div>
        <motion.div animate={{ color: drsOn ? "#22c55e" : "#E10600" }} className="text-5xl font-black font-mono tabular-nums">
          {speed} <span className="text-xl text-neutral-500">km/h</span>
        </motion.div>
        {drsOn && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-green-400 font-bold">
            +{speed - 280} km/h boost from DRS!
          </motion.div>
        )}
      </div>

      {/* Toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setDrsOn((d) => !d)}
          className={`relative w-64 h-14 rounded-2xl border font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${
            drsOn
              ? "bg-green-500/20 border-green-500/50 text-green-400"
              : "bg-[#E10600]/15 border-[#E10600]/30 text-[#E10600]"
          }`}
          style={{ boxShadow: drsOn ? "0 0 30px rgba(34,197,94,0.2)" : "0 0 20px rgba(225,6,0,0.15)" }}
        >
          <Zap size={18} fill="currentColor" />
          {drsOn ? "DRS OPEN — Tap to Close" : "DRS CLOSED — Tap to Open"}
        </button>
      </div>

      <div className="text-center text-xs text-neutral-600 max-w-sm mx-auto">
        You can only use DRS when you're within 1 second of the car ahead — and only in designated DRS zones on straights.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════
const SIMS = [
  { id: "flags",  icon: Flag,   label: "Flag Quiz",         sub: "Test your flag knowledge", color: "#22c55e",  component: FlagQuiz },
  { id: "points", icon: Trophy, label: "Points Calculator", sub: "Drag to your finish position", color: "#f59e0b", component: PointsCalculator },
  { id: "pit",    icon: Clock,  label: "Pit Stop Challenge", sub: "React like an F1 mechanic", color: "#a855f7",  component: PitStopChallenge },
  { id: "drs",    icon: Zap,    label: "DRS Effect Demo",   sub: "Toggle the wing & feel the speed", color: "#06b6d4", component: DRSDemo },
];

export default function SimulationsPage() {
  const [active, setActive] = useState("flags");
  const ActiveSim = SIMS.find((s) => s.id === active)!.component;
  const activeSim = SIMS.find((s) => s.id === active)!;

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E10600]/10 border border-[#E10600]/20 rounded-full text-sm text-[#E10600] font-black mb-6">
            <Gamepad size={14} /> Interactive Simulations
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
            F1 <span className="text-[#E10600]">SIMS</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl">
            Learn F1 by doing. Four mini-games that teach real concepts — no textbooks required.
          </p>
        </motion.div>
      </div>

      {/* Tab selector */}
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SIMS.map((sim) => {
            const Icon = sim.icon;
            const isActive = sim.id === active;
            return (
              <motion.button
                key={sim.id}
                onClick={() => setActive(sim.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? "border-opacity-50 text-white"
                    : "bg-white/4 border-white/8 text-neutral-400 hover:bg-white/6"
                }`}
                style={isActive ? {
                  backgroundColor: `${sim.color}15`,
                  borderColor: `${sim.color}50`,
                  boxShadow: `0 0 20px ${sim.color}15`,
                } : {}}
              >
                <Icon size={20} style={isActive ? { color: sim.color } : { color: "#555" }} className="mb-2" />
                <p className="font-black text-sm">{sim.label}</p>
                <p className="text-[10px] text-neutral-600 mt-0.5">{sim.sub}</p>
                {isActive && (
                  <motion.div
                    layoutId="sim-dot"
                    className="w-1.5 h-1.5 rounded-full mt-2"
                    style={{ backgroundColor: sim.color }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Simulation panel */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="sim-card p-8 md:p-10"
            style={{ borderColor: `${activeSim.color}20` }}
          >
            {/* Sim header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${activeSim.color}18`, border: `1px solid ${activeSim.color}30` }}
              >
                <activeSim.icon size={22} style={{ color: activeSim.color }} />
              </div>
              <div>
                <h2 className="text-2xl font-black italic">{activeSim.label}</h2>
                <p className="text-sm text-neutral-500">{activeSim.sub}</p>
              </div>
            </div>

            <ActiveSim />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
