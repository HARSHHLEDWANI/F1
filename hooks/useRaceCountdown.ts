"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// 2025 F1 Calendar
// ---------------------------------------------------------------------------

export interface F1Race {
  round: number;
  raceName: string;
  circuit: string;
  location: string;
  country: string;
  raceDate: string;   // ISO date string "YYYY-MM-DD"
  raceTime: string;   // UTC time "HH:MM"
  fp1?: string;
  fp2?: string;
  fp3?: string;
  qualifying?: string;
  sprint?: string;
  isSprintWeekend?: boolean;
  flag: string;       // emoji flag
}

export const F1_CALENDAR_2025: F1Race[] = [
  {
    round: 1,
    raceName: "Australian Grand Prix",
    circuit: "Albert Park Circuit",
    location: "Melbourne",
    country: "Australia",
    raceDate: "2025-03-16",
    raceTime: "04:00",
    fp1: "2025-03-14T01:30",
    fp2: "2025-03-14T05:00",
    fp3: "2025-03-15T01:30",
    qualifying: "2025-03-15T05:00",
    flag: "🇦🇺",
  },
  {
    round: 2,
    raceName: "Chinese Grand Prix",
    circuit: "Shanghai International Circuit",
    location: "Shanghai",
    country: "China",
    raceDate: "2025-03-23",
    raceTime: "07:00",
    fp1: "2025-03-21T03:30",
    fp2: "2025-03-21T07:30",
    qualifying: "2025-03-22T07:00",
    sprint: "2025-03-22T03:00",
    isSprintWeekend: true,
    flag: "🇨🇳",
  },
  {
    round: 3,
    raceName: "Japanese Grand Prix",
    circuit: "Suzuka International Racing Course",
    location: "Suzuka",
    country: "Japan",
    raceDate: "2025-04-06",
    raceTime: "05:00",
    fp1: "2025-04-04T02:30",
    fp2: "2025-04-04T06:00",
    fp3: "2025-04-05T02:30",
    qualifying: "2025-04-05T06:00",
    flag: "🇯🇵",
  },
  {
    round: 4,
    raceName: "Bahrain Grand Prix",
    circuit: "Bahrain International Circuit",
    location: "Sakhir",
    country: "Bahrain",
    raceDate: "2025-04-13",
    raceTime: "15:00",
    fp1: "2025-04-11T11:30",
    fp2: "2025-04-11T15:00",
    fp3: "2025-04-12T12:30",
    qualifying: "2025-04-12T16:00",
    flag: "🇧🇭",
  },
  {
    round: 5,
    raceName: "Saudi Arabian Grand Prix",
    circuit: "Jeddah Corniche Circuit",
    location: "Jeddah",
    country: "Saudi Arabia",
    raceDate: "2025-04-20",
    raceTime: "17:00",
    fp1: "2025-04-18T13:30",
    fp2: "2025-04-18T17:00",
    fp3: "2025-04-19T13:30",
    qualifying: "2025-04-19T17:00",
    flag: "🇸🇦",
  },
  {
    round: 6,
    raceName: "Miami Grand Prix",
    circuit: "Miami International Autodrome",
    location: "Miami",
    country: "USA",
    raceDate: "2025-05-04",
    raceTime: "19:00",
    fp1: "2025-05-02T16:30",
    fp2: "2025-05-02T20:30",
    qualifying: "2025-05-03T20:00",
    sprint: "2025-05-03T16:00",
    isSprintWeekend: true,
    flag: "🇺🇸",
  },
  {
    round: 7,
    raceName: "Emilia Romagna Grand Prix",
    circuit: "Autodromo Enzo e Dino Ferrari",
    location: "Imola",
    country: "Italy",
    raceDate: "2025-05-18",
    raceTime: "13:00",
    fp1: "2025-05-16T11:30",
    fp2: "2025-05-16T15:00",
    fp3: "2025-05-17T10:30",
    qualifying: "2025-05-17T14:00",
    flag: "🇮🇹",
  },
  {
    round: 8,
    raceName: "Monaco Grand Prix",
    circuit: "Circuit de Monaco",
    location: "Monte Carlo",
    country: "Monaco",
    raceDate: "2025-05-25",
    raceTime: "13:00",
    fp1: "2025-05-22T11:30",
    fp2: "2025-05-22T15:00",
    fp3: "2025-05-24T10:30",
    qualifying: "2025-05-24T14:00",
    flag: "🇲🇨",
  },
  {
    round: 9,
    raceName: "Spanish Grand Prix",
    circuit: "Circuit de Barcelona-Catalunya",
    location: "Barcelona",
    country: "Spain",
    raceDate: "2025-06-01",
    raceTime: "13:00",
    fp1: "2025-05-30T11:30",
    fp2: "2025-05-30T15:00",
    fp3: "2025-05-31T10:30",
    qualifying: "2025-05-31T14:00",
    flag: "🇪🇸",
  },
  {
    round: 10,
    raceName: "Canadian Grand Prix",
    circuit: "Circuit Gilles Villeneuve",
    location: "Montreal",
    country: "Canada",
    raceDate: "2025-06-15",
    raceTime: "18:00",
    fp1: "2025-06-13T17:30",
    fp2: "2025-06-13T21:00",
    fp3: "2025-06-14T16:30",
    qualifying: "2025-06-14T20:00",
    flag: "🇨🇦",
  },
  {
    round: 11,
    raceName: "Austrian Grand Prix",
    circuit: "Red Bull Ring",
    location: "Spielberg",
    country: "Austria",
    raceDate: "2025-06-29",
    raceTime: "13:00",
    fp1: "2025-06-27T10:30",
    fp2: "2025-06-27T14:30",
    qualifying: "2025-06-28T14:00",
    sprint: "2025-06-28T10:00",
    isSprintWeekend: true,
    flag: "🇦🇹",
  },
  {
    round: 12,
    raceName: "British Grand Prix",
    circuit: "Silverstone Circuit",
    location: "Silverstone",
    country: "Great Britain",
    raceDate: "2025-07-06",
    raceTime: "14:00",
    fp1: "2025-07-04T11:30",
    fp2: "2025-07-04T15:00",
    fp3: "2025-07-05T10:30",
    qualifying: "2025-07-05T14:00",
    flag: "🇬🇧",
  },
  {
    round: 13,
    raceName: "Belgian Grand Prix",
    circuit: "Circuit de Spa-Francorchamps",
    location: "Spa",
    country: "Belgium",
    raceDate: "2025-07-27",
    raceTime: "13:00",
    fp1: "2025-07-25T11:30",
    fp2: "2025-07-25T15:00",
    fp3: "2025-07-26T10:30",
    qualifying: "2025-07-26T14:00",
    flag: "🇧🇪",
  },
  {
    round: 14,
    raceName: "Hungarian Grand Prix",
    circuit: "Hungaroring",
    location: "Budapest",
    country: "Hungary",
    raceDate: "2025-08-03",
    raceTime: "13:00",
    fp1: "2025-08-01T11:30",
    fp2: "2025-08-01T15:00",
    fp3: "2025-08-02T10:30",
    qualifying: "2025-08-02T14:00",
    flag: "🇭🇺",
  },
  {
    round: 15,
    raceName: "Dutch Grand Prix",
    circuit: "Circuit Zandvoort",
    location: "Zandvoort",
    country: "Netherlands",
    raceDate: "2025-08-31",
    raceTime: "13:00",
    fp1: "2025-08-29T10:30",
    fp2: "2025-08-29T14:00",
    fp3: "2025-08-30T09:30",
    qualifying: "2025-08-30T13:00",
    flag: "🇳🇱",
  },
  {
    round: 16,
    raceName: "Italian Grand Prix",
    circuit: "Autodromo Nazionale Monza",
    location: "Monza",
    country: "Italy",
    raceDate: "2025-09-07",
    raceTime: "13:00",
    fp1: "2025-09-05T11:30",
    fp2: "2025-09-05T15:00",
    fp3: "2025-09-06T10:30",
    qualifying: "2025-09-06T14:00",
    flag: "🇮🇹",
  },
  {
    round: 17,
    raceName: "Azerbaijan Grand Prix",
    circuit: "Baku City Circuit",
    location: "Baku",
    country: "Azerbaijan",
    raceDate: "2025-09-21",
    raceTime: "11:00",
    fp1: "2025-09-19T09:30",
    fp2: "2025-09-19T13:00",
    fp3: "2025-09-20T09:30",
    qualifying: "2025-09-20T13:00",
    flag: "🇦🇿",
  },
  {
    round: 18,
    raceName: "Singapore Grand Prix",
    circuit: "Marina Bay Street Circuit",
    location: "Singapore",
    country: "Singapore",
    raceDate: "2025-10-05",
    raceTime: "12:00",
    fp1: "2025-10-03T09:30",
    fp2: "2025-10-03T13:00",
    fp3: "2025-10-04T09:30",
    qualifying: "2025-10-04T13:00",
    flag: "🇸🇬",
  },
  {
    round: 19,
    raceName: "United States Grand Prix",
    circuit: "Circuit of the Americas",
    location: "Austin",
    country: "USA",
    raceDate: "2025-10-19",
    raceTime: "19:00",
    fp1: "2025-10-17T18:30",
    fp2: "2025-10-17T22:30",
    qualifying: "2025-10-18T22:00",
    sprint: "2025-10-18T18:00",
    isSprintWeekend: true,
    flag: "🇺🇸",
  },
  {
    round: 20,
    raceName: "Mexico City Grand Prix",
    circuit: "Autodromo Hermanos Rodriguez",
    location: "Mexico City",
    country: "Mexico",
    raceDate: "2025-10-26",
    raceTime: "20:00",
    fp1: "2025-10-24T18:30",
    fp2: "2025-10-24T22:00",
    fp3: "2025-10-25T17:30",
    qualifying: "2025-10-25T21:00",
    flag: "🇲🇽",
  },
  {
    round: 21,
    raceName: "São Paulo Grand Prix",
    circuit: "Autodromo Jose Carlos Pace",
    location: "São Paulo",
    country: "Brazil",
    raceDate: "2025-11-09",
    raceTime: "17:00",
    fp1: "2025-11-07T14:30",
    fp2: "2025-11-07T18:30",
    qualifying: "2025-11-08T18:00",
    sprint: "2025-11-08T14:00",
    isSprintWeekend: true,
    flag: "🇧🇷",
  },
  {
    round: 22,
    raceName: "Las Vegas Grand Prix",
    circuit: "Las Vegas Strip Circuit",
    location: "Las Vegas",
    country: "USA",
    raceDate: "2025-11-22",
    raceTime: "06:00",
    fp1: "2025-11-20T02:30",
    fp2: "2025-11-20T06:00",
    fp3: "2025-11-21T02:30",
    qualifying: "2025-11-21T06:00",
    flag: "🇺🇸",
  },
  {
    round: 23,
    raceName: "Qatar Grand Prix",
    circuit: "Lusail International Circuit",
    location: "Lusail",
    country: "Qatar",
    raceDate: "2025-11-30",
    raceTime: "17:00",
    fp1: "2025-11-28T13:30",
    fp2: "2025-11-28T17:30",
    qualifying: "2025-11-29T17:00",
    sprint: "2025-11-29T13:00",
    isSprintWeekend: true,
    flag: "🇶🇦",
  },
  {
    round: 24,
    raceName: "Abu Dhabi Grand Prix",
    circuit: "Yas Marina Circuit",
    location: "Abu Dhabi",
    country: "UAE",
    raceDate: "2025-12-07",
    raceTime: "13:00",
    fp1: "2025-12-05T09:30",
    fp2: "2025-12-05T13:00",
    fp3: "2025-12-06T10:30",
    qualifying: "2025-12-06T14:00",
    flag: "🇦🇪",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRaceDateTime(race: F1Race): Date {
  return new Date(`${race.raceDate}T${race.raceTime}:00Z`);
}

function findNextRace(now: Date): F1Race | null {
  const upcoming = F1_CALENDAR_2025.filter(
    (r) => getRaceDateTime(r) > now
  );
  if (upcoming.length === 0) return null;
  return upcoming.reduce((closest, r) =>
    getRaceDateTime(r) < getRaceDateTime(closest) ? r : closest
  );
}

function padTwo(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RaceWeekend {
  fp1?: Date;
  fp2?: Date;
  fp3?: Date;
  qualifying?: Date;
  sprint?: Date;
  race: Date;
  isSprintWeekend: boolean;
}

export interface UseRaceCountdownReturn {
  nextRace: F1Race | null;
  daysUntil: number;
  hoursUntil: number;
  minutesUntil: number;
  secondsUntil: number;
  formattedCountdown: string;
  raceWeekend: RaceWeekend | null;
  totalSecondsUntil: number;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRaceCountdown(): UseRaceCountdownReturn {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  const nextRace = findNextRace(now);

  if (!nextRace) {
    return {
      nextRace: null,
      daysUntil: 0,
      hoursUntil: 0,
      minutesUntil: 0,
      secondsUntil: 0,
      formattedCountdown: "Season Over",
      raceWeekend: null,
      totalSecondsUntil: 0,
    };
  }

  const raceTime = getRaceDateTime(nextRace);
  const diffMs = Math.max(0, raceTime.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedCountdown =
    days > 0
      ? `${days}d ${padTwo(hours)}h ${padTwo(minutes)}m ${padTwo(seconds)}s`
      : `${padTwo(hours)}h ${padTwo(minutes)}m ${padTwo(seconds)}s`;

  const raceWeekend: RaceWeekend = {
    race: raceTime,
    isSprintWeekend: nextRace.isSprintWeekend ?? false,
    fp1: nextRace.fp1 ? new Date(nextRace.fp1 + ":00Z") : undefined,
    fp2: nextRace.fp2 ? new Date(nextRace.fp2 + ":00Z") : undefined,
    fp3: nextRace.fp3 ? new Date(nextRace.fp3 + ":00Z") : undefined,
    qualifying: nextRace.qualifying ? new Date(nextRace.qualifying + ":00Z") : undefined,
    sprint: nextRace.sprint ? new Date(nextRace.sprint + ":00Z") : undefined,
  };

  return {
    nextRace,
    daysUntil: days,
    hoursUntil: hours,
    minutesUntil: minutes,
    secondsUntil: seconds,
    formattedCountdown,
    raceWeekend,
    totalSecondsUntil: totalSeconds,
  };
}
