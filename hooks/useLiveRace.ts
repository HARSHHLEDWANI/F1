"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TireCompound = "SOFT" | "MEDIUM" | "HARD" | "INTER" | "WET";

export interface LeaderboardEntry {
  position: number;
  driverCode: string;
  driverName: string;
  team: string;
  teamColor: string;
  gap: string;
  lastLap: string;
  tire: TireCompound;
  pit: boolean;
  sector1?: string;
  sector2?: string;
  sector3?: string;
  isFastest?: boolean;
  drs?: boolean;
}

export type SessionStatus = "INACTIVE" | "LIVE" | "SAFETY_CAR" | "FINISHED" | "SIMULATION";

export interface UseLiveRaceReturn {
  raceData: unknown;
  isLive: boolean;
  isSimulation: boolean;
  sessionStatus: SessionStatus;
  lap: number;
  totalLaps: number;
  leaderboard: LeaderboardEntry[];
}

// ---------------------------------------------------------------------------
// Static driver roster
// ---------------------------------------------------------------------------

interface DriverDef {
  code: string;
  name: string;
  team: string;
  color: string;
  baseLap: number; // base lap time in seconds (for gap calculations)
}

const DRIVER_ROSTER: DriverDef[] = [
  { code: "VER", name: "Max Verstappen",     team: "Red Bull",      color: "#0600EF", baseLap: 88.1 },
  { code: "NOR", name: "Lando Norris",       team: "McLaren",       color: "#FF8700", baseLap: 88.3 },
  { code: "LEC", name: "Charles Leclerc",    team: "Ferrari",       color: "#DC0000", baseLap: 88.5 },
  { code: "PIA", name: "Oscar Piastri",      team: "McLaren",       color: "#FF8700", baseLap: 88.6 },
  { code: "SAI", name: "Carlos Sainz",       team: "Ferrari",       color: "#DC0000", baseLap: 88.7 },
  { code: "RUS", name: "George Russell",     team: "Mercedes",      color: "#00D2BE", baseLap: 88.9 },
  { code: "HAM", name: "Lewis Hamilton",     team: "Ferrari",       color: "#DC0000", baseLap: 89.0 },
  { code: "ALO", name: "Fernando Alonso",    team: "Aston Martin",  color: "#006F62", baseLap: 89.2 },
  { code: "STR", name: "Lance Stroll",       team: "Aston Martin",  color: "#006F62", baseLap: 89.8 },
  { code: "TSU", name: "Yuki Tsunoda",       team: "VCARB",         color: "#1E41FF", baseLap: 89.9 },
  { code: "ALB", name: "Alexander Albon",    team: "Williams",      color: "#005AFF", baseLap: 90.1 },
  { code: "HUL", name: "Nico Hulkenberg",    team: "Haas",          color: "#B6BABD", baseLap: 90.3 },
  { code: "MAG", name: "Kevin Magnussen",    team: "Haas",          color: "#B6BABD", baseLap: 90.5 },
  { code: "OCO", name: "Esteban Ocon",       team: "Alpine",        color: "#0093CC", baseLap: 90.4 },
  { code: "GAS", name: "Pierre Gasly",       team: "Alpine",        color: "#0093CC", baseLap: 90.6 },
  { code: "BOT", name: "Valtteri Bottas",    team: "Sauber",        color: "#00E48D", baseLap: 90.8 },
  { code: "ZHO", name: "Zhou Guanyu",        team: "Sauber",        color: "#00E48D", baseLap: 91.0 },
  { code: "SAR", name: "Logan Sargeant",     team: "Williams",      color: "#005AFF", baseLap: 91.2 },
  { code: "BEA", name: "Oliver Bearman",     team: "Haas",          color: "#B6BABD", baseLap: 91.4 },
  { code: "LAW", name: "Liam Lawson",        team: "VCARB",         color: "#1E41FF", baseLap: 89.6 },
];

const TOTAL_LAPS = 57;
const POLL_INTERVAL_MS = 3_000;
const LAP_INCREMENT_EVERY_MS = 8_000;

// ---------------------------------------------------------------------------
// Simulation helpers
// ---------------------------------------------------------------------------

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function formatLapTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const secInt = Math.floor(secs);
  const ms = Math.round((secs - secInt) * 1000);
  return `${mins}:${String(secInt).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function formatSector(seconds: number): string {
  return seconds.toFixed(3);
}

function formatGap(gapSeconds: number): string {
  if (gapSeconds <= 0) return "LEADER";
  return `+${gapSeconds.toFixed(3)}`;
}

interface SimState {
  // Map from driverCode → cumulative gap in seconds from leader
  gaps: Record<string, number>;
  // Map from driverCode → current tire
  tires: Record<string, TireCompound>;
  // Map from driverCode → pit status
  pits: Record<string, boolean>;
  // Map from driverCode → DRS
  drs: Record<string, boolean>;
  // Current fastest lap holder
  fastestDriver: string;
  // Ordering by position index (array of driver codes)
  order: string[];
  // Last lap times
  lastLaps: Record<string, number>;
  // Lap
  lap: number;
}

function buildInitialSimState(): SimState {
  const gaps: Record<string, number> = {};
  const tires: Record<string, TireCompound> = {};
  const pits: Record<string, boolean> = {};
  const drs: Record<string, boolean> = {};
  const lastLaps: Record<string, number> = {};
  const order = DRIVER_ROSTER.map((d) => d.code);

  let cumulativeGap = 0;
  for (let i = 0; i < DRIVER_ROSTER.length; i++) {
    const d = DRIVER_ROSTER[i];
    gaps[d.code] = cumulativeGap;
    cumulativeGap += rand(0.5, 3.5);
    tires[d.code] = i < 6 ? "SOFT" : i < 14 ? "MEDIUM" : "HARD";
    pits[d.code] = false;
    drs[d.code] = i < 10;
    lastLaps[d.code] = d.baseLap + rand(-0.3, 0.5);
  }

  return {
    gaps,
    tires,
    pits,
    drs,
    fastestDriver: "VER",
    order,
    lastLaps,
    lap: 1,
  };
}

function advanceSimState(prev: SimState): SimState {
  const newOrder = [...prev.order];
  const newGaps = { ...prev.gaps };
  const newTires = { ...prev.tires };
  const newPits = { ...prev.pits };
  const newDrs = { ...prev.drs };
  const newLastLaps = { ...prev.lastLaps };

  // Randomly shuffle adjacent positions (mild overtaking)
  for (let i = 1; i < newOrder.length - 1; i++) {
    if (Math.random() < 0.08) {
      const tmp = newOrder[i];
      newOrder[i] = newOrder[i + 1];
      newOrder[i + 1] = tmp;
    }
  }

  // Recalculate gaps with some drift
  let cumulativeGap = 0;
  for (const code of newOrder) {
    const driver = DRIVER_ROSTER.find((d) => d.code === code)!;
    const drift = rand(-0.2, 0.4);
    cumulativeGap = Math.max(0, cumulativeGap + drift);
    newGaps[code] = cumulativeGap;
    cumulativeGap += rand(0.3, 2.5);
    newLastLaps[code] = driver.baseLap + rand(-0.4, 0.8) + (newPits[code] ? 20 : 0);
  }
  // Leader gap is always 0
  newGaps[newOrder[0]] = 0;

  // Random pit stops (5% chance each tick per driver)
  for (const code of newOrder) {
    if (Math.random() < 0.05 && !newPits[code]) {
      newPits[code] = true;
      // Switch tire on pit
      const tireOptions: TireCompound[] = ["SOFT", "MEDIUM", "HARD"];
      newTires[code] = tireOptions[Math.floor(Math.random() * tireOptions.length)];
    } else {
      newPits[code] = false; // pit only lasts one tick
    }
  }

  // DRS: top 10 if within 1 second of car ahead
  for (let i = 1; i < newOrder.length; i++) {
    const code = newOrder[i];
    const aheadCode = newOrder[i - 1];
    const gapToAhead = newGaps[code] - newGaps[aheadCode];
    newDrs[code] = gapToAhead <= 1.0;
  }

  // Fastest lap: random chance to change
  let fastestDriver = prev.fastestDriver;
  if (Math.random() < 0.15) {
    fastestDriver = newOrder[Math.floor(Math.random() * Math.min(8, newOrder.length))];
  }

  const newLap = Math.min(prev.lap, TOTAL_LAPS);

  return {
    gaps: newGaps,
    tires: newTires,
    pits: newPits,
    drs: newDrs,
    fastestDriver,
    order: newOrder,
    lastLaps: newLastLaps,
    lap: newLap,
  };
}

function simStateToLeaderboard(state: SimState): LeaderboardEntry[] {
  return state.order.map((code, idx) => {
    const driver = DRIVER_ROSTER.find((d) => d.code === code)!;
    const lapSecs = state.lastLaps[code];
    const s1 = lapSecs * rand(0.28, 0.32);
    const s2 = lapSecs * rand(0.34, 0.38);
    const s3 = lapSecs - s1 - s2;

    return {
      position: idx + 1,
      driverCode: code,
      driverName: driver.name,
      team: driver.team,
      teamColor: driver.color,
      gap: formatGap(state.gaps[code]),
      lastLap: formatLapTime(lapSecs),
      tire: state.tires[code],
      pit: state.pits[code],
      sector1: formatSector(s1),
      sector2: formatSector(s2),
      sector3: formatSector(s3),
      isFastest: code === state.fastestDriver,
      drs: state.drs[code],
    };
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLiveRace(): UseLiveRaceReturn {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("INACTIVE");
  const [lap, setLap] = useState(1);
  const [raceData, setRaceData] = useState<unknown>(null);

  // Simulation state held in a ref to avoid re-render loops
  const simStateRef = useRef<SimState>(buildInitialSimState());
  const simModeRef = useRef(false);

  // Lap ticker for simulation
  const lapStartRef = useRef<number>(Date.now());

  // ---------------------------------------------------------------------------
  // Parse live data from backend (FastAPI at localhost:8000)
  // ---------------------------------------------------------------------------
  const parseLiveData = useCallback((data: Record<string, unknown>): LeaderboardEntry[] | null => {
    if (!data || typeof data !== "object") return null;
    const drivers = (data as Record<string, unknown>).drivers;
    if (!Array.isArray(drivers) || drivers.length === 0) return null;

    return (drivers as Array<Record<string, unknown>>).map((d, idx) => ({
      position: typeof d.position === "number" ? d.position : idx + 1,
      driverCode: String(d.driver_code ?? d.driverCode ?? "???"),
      driverName: String(d.driver_name ?? d.driverName ?? "Unknown"),
      team: String(d.team ?? ""),
      teamColor: String(d.team_color ?? d.teamColor ?? "#ffffff"),
      gap: String(d.gap ?? "LEADER"),
      lastLap: String(d.last_lap ?? d.lastLap ?? "--:--.---"),
      tire: (d.tire as TireCompound) ?? "MEDIUM",
      pit: Boolean(d.pit),
      sector1: d.sector1 != null ? String(d.sector1) : undefined,
      sector2: d.sector2 != null ? String(d.sector2) : undefined,
      sector3: d.sector3 != null ? String(d.sector3) : undefined,
      isFastest: Boolean(d.is_fastest ?? d.isFastest),
      drs: Boolean(d.drs),
    }));
  }, []);

  // ---------------------------------------------------------------------------
  // Poll the backend
  // ---------------------------------------------------------------------------
  const poll = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/live-race", {
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: Record<string, unknown> = await res.json();
      const entries = parseLiveData(data);

      if (!entries || entries.length === 0) throw new Error("No driver data");

      // Success → live mode
      simModeRef.current = false;
      setIsLive(true);
      setIsSimulation(false);
      setRaceData(data);
      setSessionStatus(
        (data.session_status as SessionStatus) ?? "LIVE"
      );
      setLap(typeof data.lap === "number" ? data.lap : 1);
      setLeaderboard(entries);
    } catch {
      // Fall back to / stay in simulation mode
      if (!simModeRef.current) {
        simModeRef.current = true;
        simStateRef.current = buildInitialSimState();
        lapStartRef.current = Date.now();
        setIsLive(false);
        setIsSimulation(true);
        setSessionStatus("SIMULATION");
        setLap(1);
      }

      // Advance simulation
      simStateRef.current = advanceSimState(simStateRef.current);

      // Advance lap every LAP_INCREMENT_EVERY_MS
      const now = Date.now();
      const elapsed = now - lapStartRef.current;
      const lapIncrement = Math.floor(elapsed / LAP_INCREMENT_EVERY_MS);
      const newLap = Math.min(1 + lapIncrement, TOTAL_LAPS);
      simStateRef.current.lap = newLap;
      setLap(newLap);

      setLeaderboard(simStateToLeaderboard(simStateRef.current));
      setRaceData(null);
    }
  }, [parseLiveData]);

  useEffect(() => {
    // Run immediately then on interval
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [poll]);

  return {
    raceData,
    isLive,
    isSimulation,
    sessionStatus,
    lap,
    totalLaps: TOTAL_LAPS,
    leaderboard,
  };
}
