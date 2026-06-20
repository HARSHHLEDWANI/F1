// ---------------------------------------------------------------------------
// Canonical 2025 F1 season — single source of truth for rosters & standings.
// ---------------------------------------------------------------------------
// Live standings/points are fetched from Jolpica (api.jolpi.ca) at runtime.
// The values here are the hand-verified fallback used ONLY when the API is
// unreachable, plus the static facts the API doesn't carry (driver numbers,
// nationality flags, ratings, taglines, car chassis names).
//
// 2025 World Drivers' Champion: Lando Norris (McLaren) — 423 pts,
//   2 ahead of Max Verstappen (421); Oscar Piastri 3rd (410).
//   McLaren won the Constructors' Championship.
// Sources: Crash.net / RaceFans final 2025 Abu Dhabi standings.
//
// NOTE: points for P4–P20 below are best-effort fallback figures and are
// superseded by live Jolpica data whenever the API responds. Do not treat
// them as authoritative; the top-3 and champion are verified.
// ---------------------------------------------------------------------------

export const SEASON_2025 = 2025;

// Shared, single list of seasons that actually have data behind them.
// Jolpica covers historical seasons; predictions cover 2021+. We expose a
// consistent set everywhere and treat 2025 as the latest complete season.
// (Future/incomplete seasons are intentionally excluded so a user can't pick
// a year that returns nothing.)
export const SELECTABLE_SEASONS = [2021, 2022, 2023, 2024, 2025] as const;
export const LATEST_SEASON = 2025;

export const CHAMPION_2025 = {
  code: "NOR",
  name: "Lando Norris",
  team: "McLaren",
  points: 423,
} as const;

export interface Season2025Driver {
  id: number;
  code: string;
  given_name: string;
  family_name: string;
  nationality: string; // flag emoji
  number: number;
  team: string;
  teamColor: string;
  // Career totals (historical, through end of 2025) — NOT season points.
  career: {
    championships: number;
    wins: number;
    podiums: number;
    poles: number;
    points: number;
  };
  // 2025 season fallback (position + championship points + wins).
  season: {
    position: number;
    points: number;
    wins: number;
  };
  rating: number;
  highlight: string;
}

// Final-classification order (P1 → P20).
export const DRIVERS_2025: Season2025Driver[] = [
  { id: 1,  code: "NOR", given_name: "Lando",    family_name: "Norris",     nationality: "🇬🇧", number: 4,  team: "McLaren",      teamColor: "#FF8700", career: { championships: 1, wins: 11,  podiums: 46,  poles: 12,  points: 1006 }, season: { position: 1,  points: 423, wins: 7 }, rating: 94, highlight: "2025 World Champion — McLaren's first since 2008" },
  { id: 2,  code: "VER", given_name: "Max",      family_name: "Verstappen", nationality: "🇳🇱", number: 1,  team: "Red Bull",     teamColor: "#0600EF", career: { championships: 4, wins: 65,  podiums: 117, poles: 44,  points: 3210 }, season: { position: 2,  points: 421, wins: 7 }, rating: 96, highlight: "4× World Champion — fell 2 points short in 2025" },
  { id: 3,  code: "PIA", given_name: "Oscar",    family_name: "Piastri",    nationality: "🇦🇺", number: 81, team: "McLaren",      teamColor: "#FF8700", career: { championships: 0, wins: 9,   podiums: 28,  poles: 6,   points: 690 },  season: { position: 3,  points: 410, wins: 7 }, rating: 90, highlight: "Title contender to the final round" },
  { id: 4,  code: "LEC", given_name: "Charles",  family_name: "Leclerc",    nationality: "🇲🇨", number: 16, team: "Ferrari",      teamColor: "#DC0000", career: { championships: 0, wins: 8,   podiums: 47,  poles: 26,  points: 1340 }, season: { position: 4,  points: 298, wins: 0 }, rating: 91, highlight: "Ferrari's lead driver" },
  { id: 5,  code: "RUS", given_name: "George",   family_name: "Russell",    nationality: "🇬🇧", number: 63, team: "Mercedes",     teamColor: "#00D2BE", career: { championships: 0, wins: 5,   podiums: 25,  poles: 7,   points: 770 },  season: { position: 5,  points: 276, wins: 1 }, rating: 87, highlight: "Mercedes team leader" },
  { id: 6,  code: "HAM", given_name: "Lewis",    family_name: "Hamilton",   nationality: "🇬🇧", number: 44, team: "Ferrari",      teamColor: "#DC0000", career: { championships: 7, wins: 105, podiums: 202, poles: 104, points: 4980 }, season: { position: 6,  points: 234, wins: 1 }, rating: 94, highlight: "7× World Champion — first year at Ferrari" },
  { id: 7,  code: "ANT", given_name: "Kimi",     family_name: "Antonelli",  nationality: "🇮🇹", number: 12, team: "Mercedes",     teamColor: "#00D2BE", career: { championships: 0, wins: 0,   podiums: 3,   poles: 1,   points: 150 },  season: { position: 7,  points: 150, wins: 0 }, rating: 82, highlight: "Rookie of the year contender" },
  { id: 8,  code: "ALB", given_name: "Alex",     family_name: "Albon",      nationality: "🇹🇭", number: 23, team: "Williams",     teamColor: "#005AFF", career: { championships: 0, wins: 0,   podiums: 2,   poles: 0,   points: 360 },  season: { position: 8,  points: 102, wins: 0 }, rating: 80, highlight: "Williams' points machine" },
  { id: 9,  code: "SAI", given_name: "Carlos",   family_name: "Sainz",      nationality: "🇪🇸", number: 55, team: "Williams",     teamColor: "#005AFF", career: { championships: 0, wins: 4,   podiums: 27,  poles: 6,   points: 1170 }, season: { position: 9,  points: 90,  wins: 0 }, rating: 86, highlight: "New chapter at Williams" },
  { id: 10, code: "HAD", given_name: "Isack",    family_name: "Hadjar",     nationality: "🇫🇷", number: 6,  team: "Racing Bulls", teamColor: "#1E41FF", career: { championships: 0, wins: 0,   podiums: 1,   poles: 0,   points: 60 },   season: { position: 10, points: 60,  wins: 0 }, rating: 78, highlight: "Standout rookie at Racing Bulls" },
  { id: 11, code: "ALO", given_name: "Fernando", family_name: "Alonso",     nationality: "🇪🇸", number: 14, team: "Aston Martin", teamColor: "#006F62", career: { championships: 2, wins: 32,  podiums: 106, poles: 22,  points: 2380 }, season: { position: 11, points: 52,  wins: 0 }, rating: 88, highlight: "2× WDC — still racing in his 40s" },
  { id: 12, code: "STR", given_name: "Lance",    family_name: "Stroll",     nationality: "🇨🇦", number: 18, team: "Aston Martin", teamColor: "#006F62", career: { championships: 0, wins: 0,   podiums: 3,   poles: 1,   points: 290 },  season: { position: 12, points: 38,  wins: 0 }, rating: 72, highlight: "Aston Martin veteran" },
  { id: 13, code: "HUL", given_name: "Nico",     family_name: "Hulkenberg", nationality: "🇩🇪", number: 27, team: "Sauber",       teamColor: "#00E48D", career: { championships: 0, wins: 0,   podiums: 1,   poles: 1,   points: 590 },  season: { position: 13, points: 37,  wins: 0 }, rating: 79, highlight: "Maiden podium ended the long wait" },
  { id: 14, code: "TSU", given_name: "Yuki",     family_name: "Tsunoda",    nationality: "🇯🇵", number: 22, team: "Red Bull",     teamColor: "#0600EF", career: { championships: 0, wins: 0,   podiums: 0,   poles: 0,   points: 130 },  season: { position: 14, points: 33,  wins: 0 }, rating: 77, highlight: "Promoted to Red Bull mid-2025" },
  { id: 15, code: "GAS", given_name: "Pierre",   family_name: "Gasly",      nationality: "🇫🇷", number: 10, team: "Alpine",       teamColor: "#0093CC", career: { championships: 0, wins: 1,   podiums: 5,   poles: 0,   points: 380 },  season: { position: 15, points: 22,  wins: 0 }, rating: 78, highlight: "Alpine's reference driver" },
  { id: 16, code: "OCO", given_name: "Esteban",  family_name: "Ocon",       nationality: "🇫🇷", number: 31, team: "Haas",         teamColor: "#B6BABD", career: { championships: 0, wins: 1,   podiums: 4,   poles: 0,   points: 470 },  season: { position: 16, points: 20,  wins: 0 }, rating: 77, highlight: "Race winner now leading Haas" },
  { id: 17, code: "BEA", given_name: "Oliver",   family_name: "Bearman",    nationality: "🇬🇧", number: 87, team: "Haas",         teamColor: "#B6BABD", career: { championships: 0, wins: 0,   podiums: 0,   poles: 0,   points: 50 },   season: { position: 17, points: 18,  wins: 0 }, rating: 77, highlight: "Full-time Haas seat earned" },
  { id: 18, code: "BOR", given_name: "Gabriel",  family_name: "Bortoleto",  nationality: "🇧🇷", number: 5,  team: "Sauber",       teamColor: "#00E48D", career: { championships: 0, wins: 0,   podiums: 0,   poles: 0,   points: 28 },   season: { position: 18, points: 28,  wins: 0 }, rating: 76, highlight: "2024 F2 Champion, now in F1" },
  { id: 19, code: "DOO", given_name: "Jack",     family_name: "Doohan",     nationality: "🇦🇺", number: 7,  team: "Alpine",       teamColor: "#0093CC", career: { championships: 0, wins: 0,   podiums: 0,   poles: 0,   points: 6 },    season: { position: 19, points: 6,   wins: 0 }, rating: 73, highlight: "Alpine's rookie graduate" },
  { id: 20, code: "LAW", given_name: "Liam",     family_name: "Lawson",     nationality: "🇳🇿", number: 30, team: "Racing Bulls", teamColor: "#1E41FF", career: { championships: 0, wins: 0,   podiums: 0,   poles: 0,   points: 36 },   season: { position: 20, points: 30,  wins: 0 }, rating: 76, highlight: "Returned to Racing Bulls after RB swap" },
];

// ---------------------------------------------------------------------------
// Constructors — canonical 2025 lineup, chassis names and fallback points.
// ---------------------------------------------------------------------------
export interface Season2025Team {
  id: number;
  name: string;
  short: string;
  color: string;
  secondColor: string;
  chassis: string;
  engine: string;
  drivers: string[]; // driver codes, references DRIVERS_2025
  season: { position: number; points: number; wins: number };
}

export const TEAMS_2025: Season2025Team[] = [
  { id: 1,  name: "McLaren",      short: "MCL", color: "#FF8700", secondColor: "#000000", chassis: "MCL39",     engine: "Mercedes",   drivers: ["NOR", "PIA"], season: { position: 1,  points: 833, wins: 14 } },
  { id: 2,  name: "Ferrari",      short: "FER", color: "#DC0000", secondColor: "#FFFFFF", chassis: "SF-25",     engine: "Ferrari",    drivers: ["LEC", "HAM"], season: { position: 2,  points: 532, wins: 1 } },
  { id: 3,  name: "Mercedes",     short: "MER", color: "#00D2BE", secondColor: "#000000", chassis: "W16",       engine: "Mercedes",   drivers: ["RUS", "ANT"], season: { position: 3,  points: 426, wins: 1 } },
  { id: 4,  name: "Red Bull",     short: "RBR", color: "#0600EF", secondColor: "#CC1E4A", chassis: "RB21",      engine: "Honda RBPT", drivers: ["VER", "TSU"], season: { position: 4,  points: 454, wins: 7 } },
  { id: 5,  name: "Williams",     short: "WIL", color: "#005AFF", secondColor: "#FFFFFF", chassis: "FW47",      engine: "Mercedes",   drivers: ["ALB", "SAI"], season: { position: 5,  points: 192, wins: 0 } },
  { id: 6,  name: "Aston Martin", short: "AMR", color: "#006F62", secondColor: "#CEDC00", chassis: "AMR25",     engine: "Mercedes",   drivers: ["ALO", "STR"], season: { position: 6,  points: 90,  wins: 0 } },
  { id: 7,  name: "Racing Bulls", short: "RB",  color: "#1E41FF", secondColor: "#FFFFFF", chassis: "VCARB 02",  engine: "Honda RBPT", drivers: ["HAD", "LAW"], season: { position: 7,  points: 90,  wins: 0 } },
  { id: 8,  name: "Sauber",       short: "SAU", color: "#00E48D", secondColor: "#000000", chassis: "C45",       engine: "Ferrari",    drivers: ["HUL", "BOR"], season: { position: 8,  points: 65,  wins: 0 } },
  { id: 9,  name: "Haas",         short: "HAA", color: "#B6BABD", secondColor: "#E8002D", chassis: "VF-25",     engine: "Ferrari",    drivers: ["OCO", "BEA"], season: { position: 9,  points: 60,  wins: 0 } },
  { id: 10, name: "Alpine",       short: "ALP", color: "#0093CC", secondColor: "#FF0073", chassis: "A525",      engine: "Renault",    drivers: ["GAS", "DOO"], season: { position: 10, points: 28,  wins: 0 } },
];

export function driverByCode(code: string): Season2025Driver | undefined {
  return DRIVERS_2025.find((d) => d.code === code);
}
