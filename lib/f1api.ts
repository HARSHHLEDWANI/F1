"use client";

// ---------------------------------------------------------------------------
// Team colours
// ---------------------------------------------------------------------------
export const TEAM_COLORS: Record<string, { primary: string; secondary: string }> = {
  "Red Bull": { primary: "#0600EF", secondary: "#FFD700" },
  "McLaren": { primary: "#FF8700", secondary: "#000000" },
  "Ferrari": { primary: "#DC0000", secondary: "#FFFFFF" },
  "Mercedes": { primary: "#00D2BE", secondary: "#000000" },
  "Aston Martin": { primary: "#006F62", secondary: "#CEDC00" },
  "Alpine": { primary: "#0093CC", secondary: "#FF87BC" },
  "Williams": { primary: "#005AFF", secondary: "#FFFFFF" },
  "VCARB": { primary: "#1E41FF", secondary: "#FF0000" },
  "Haas": { primary: "#B6BABD", secondary: "#E8002D" },
  "Sauber": { primary: "#00E48D", secondary: "#000000" },
};

// ---------------------------------------------------------------------------
// Driver code → full name mapping
// ---------------------------------------------------------------------------
export const DRIVER_NAMES: Record<string, string> = {
  VER: "Max Verstappen",
  NOR: "Lando Norris",
  LEC: "Charles Leclerc",
  PIA: "Oscar Piastri",
  SAI: "Carlos Sainz",
  RUS: "George Russell",
  HAM: "Lewis Hamilton",
  ALO: "Fernando Alonso",
  STR: "Lance Stroll",
  TSU: "Yuki Tsunoda",
  ALB: "Alexander Albon",
  HUL: "Nico Hulkenberg",
  MAG: "Kevin Magnussen",
  OCO: "Esteban Ocon",
  GAS: "Pierre Gasly",
  BOT: "Valtteri Bottas",
  ZHO: "Zhou Guanyu",
  SAR: "Logan Sargeant",
  BEA: "Oliver Bearman",
  LAW: "Liam Lawson",
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
const ERGAST_BASE = "https://ergast.com/api/f1";
const OPENF1_BASE = "https://api.openf1.org/v1";
const LOCAL_BASE = "http://localhost:8000";

async function ergastFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${ERGAST_BASE}${path}`, {
    next: { revalidate: 300 },
  } as RequestInit);
  if (!res.ok) throw new Error(`Ergast API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

async function openF1Fetch<T>(path: string): Promise<T> {
  const res = await fetch(`${OPENF1_BASE}${path}`);
  if (!res.ok) throw new Error(`OpenF1 API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Ergast API types
// ---------------------------------------------------------------------------
export interface ErgastDriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    code: string;
    url: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
    permanentNumber?: string;
  };
  Constructors: Array<{
    constructorId: string;
    url: string;
    name: string;
    nationality: string;
  }>;
}

export interface ErgastConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    url: string;
    name: string;
    nationality: string;
  };
}

export interface ErgastRace {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    url: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  };
  date: string;
  time?: string;
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Qualifying?: { date: string; time: string };
  Sprint?: { date: string; time: string };
}

export interface ErgastCircuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: {
    lat: string;
    long: string;
    locality: string;
    country: string;
  };
}

export interface ErgastRaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: ErgastDriverStanding["Driver"];
  Constructor: ErgastConstructorStanding["Constructor"];
  grid: string;
  laps: string;
  status: string;
  Time?: { millis: string; time: string };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
    AverageSpeed: { units: string; speed: string };
  };
}

// ---------------------------------------------------------------------------
// OpenF1 API types
// ---------------------------------------------------------------------------
export interface OpenF1Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url: string | null;
  country_code: string;
  session_key: number;
  meeting_key: number;
}

export interface OpenF1Position {
  driver_number: number;
  date: string;
  position: number;
  session_key: number;
  meeting_key: number;
}

export interface OpenF1SessionStatus {
  date: string;
  status: "Inactive" | "Started" | "Aborted" | "Finished" | "Finalised" | "Ends" | string;
  session_key: number;
  meeting_key: number;
}

export interface OpenF1Timing {
  driver_number: number;
  date: string;
  lap_number: number;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  lap_duration: number | null;
  is_pit_out_lap: boolean;
  session_key: number;
  meeting_key: number;
}

// ---------------------------------------------------------------------------
// Ergast API helpers
// ---------------------------------------------------------------------------

export async function fetchDriverStandings(year: number): Promise<ErgastDriverStanding[]> {
  const data = await ergastFetch<any>(`/${year}/driverStandings.json`);
  return (
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []
  );
}

export async function fetchConstructorStandings(
  year: number
): Promise<ErgastConstructorStanding[]> {
  const data = await ergastFetch<any>(`/${year}/constructorStandings.json`);
  return (
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? []
  );
}

export async function fetchRaceResults(
  year: number,
  round?: number
): Promise<ErgastRaceResult[]> {
  const path = round
    ? `/${year}/${round}/results.json`
    : `/${year}/last/results.json`;
  const data = await ergastFetch<any>(path);
  return data?.MRData?.RaceTable?.Races?.[0]?.Results ?? [];
}

export async function fetchCircuits(year: number): Promise<ErgastCircuit[]> {
  const data = await ergastFetch<any>(`/${year}/circuits.json?limit=30`);
  return data?.MRData?.CircuitTable?.Circuits ?? [];
}

export async function fetchNextRace(): Promise<ErgastRace | null> {
  const data = await ergastFetch<any>("/current/next.json");
  return data?.MRData?.RaceTable?.Races?.[0] ?? null;
}

export async function fetchSeasonRaces(year: number): Promise<ErgastRace[]> {
  const data = await ergastFetch<any>(`/${year}/races.json?limit=30`);
  return data?.MRData?.RaceTable?.Races ?? [];
}

// ---------------------------------------------------------------------------
// OpenF1 API helpers
// ---------------------------------------------------------------------------

export async function fetchLiveTimingData(): Promise<OpenF1Timing[]> {
  const data = await openF1Fetch<OpenF1Timing[]>(
    "/laps?session_key=latest"
  );
  return data ?? [];
}

export async function fetchSessionStatus(): Promise<OpenF1SessionStatus[]> {
  const data = await openF1Fetch<OpenF1SessionStatus[]>(
    "/session_status?session_key=latest"
  );
  return data ?? [];
}

export async function fetchDriverList(): Promise<OpenF1Driver[]> {
  const data = await openF1Fetch<OpenF1Driver[]>(
    "/drivers?session_key=latest"
  );
  return data ?? [];
}

export async function fetchPositions(): Promise<OpenF1Position[]> {
  const data = await openF1Fetch<OpenF1Position[]>(
    "/position?session_key=latest"
  );
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Local FastAPI helpers
// ---------------------------------------------------------------------------

export interface LiveRaceData {
  session_status?: string;
  lap?: number;
  total_laps?: number;
  drivers?: Array<{
    position: number;
    driver_code: string;
    driver_name: string;
    team: string;
    team_color: string;
    gap: string;
    last_lap: string;
    tire: "SOFT" | "MEDIUM" | "HARD" | "INTER" | "WET";
    pit: boolean;
    sector1?: string;
    sector2?: string;
    sector3?: string;
    is_fastest?: boolean;
    drs?: boolean;
  }>;
}

export async function fetchLocalLiveRace(): Promise<LiveRaceData | null> {
  try {
    const res = await fetch(`${LOCAL_BASE}/live-race`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data: LiveRaceData = await res.json();
    return data;
  } catch {
    return null;
  }
}
