"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchDriverStandings,
  fetchConstructorStandings,
  fetchSeasonRaces,
  type ErgastDriverStanding,
  type ErgastConstructorStanding,
  type ErgastRace,
} from "@/lib/f1api";

// ---------------------------------------------------------------------------
// Mock fallback data (2024)
// ---------------------------------------------------------------------------

// 2025 final standings (used when Ergast is unreachable)
const MOCK_DRIVER_STANDINGS: ErgastDriverStanding[] = [
  { position: "1", positionText: "1", points: "429", wins: "8",  Driver: { driverId: "oscar_piastri",     code: "PIA", url: "", givenName: "Oscar",    familyName: "Piastri",    dateOfBirth: "2001-04-06", nationality: "Australian",  permanentNumber: "81" }, Constructors: [{ constructorId: "mclaren",      url: "", name: "McLaren",      nationality: "British"   }] },
  { position: "2", positionText: "2", points: "418", wins: "7",  Driver: { driverId: "lando_norris",      code: "NOR", url: "", givenName: "Lando",    familyName: "Norris",     dateOfBirth: "1999-11-13", nationality: "British",     permanentNumber: "4"  }, Constructors: [{ constructorId: "mclaren",      url: "", name: "McLaren",      nationality: "British"   }] },
  { position: "3", positionText: "3", points: "356", wins: "4",  Driver: { driverId: "charles_leclerc",   code: "LEC", url: "", givenName: "Charles",  familyName: "Leclerc",    dateOfBirth: "1997-10-16", nationality: "Monegasque",  permanentNumber: "16" }, Constructors: [{ constructorId: "ferrari",       url: "", name: "Ferrari",       nationality: "Italian"   }] },
  { position: "4", positionText: "4", points: "321", wins: "3",  Driver: { driverId: "max_verstappen",    code: "VER", url: "", givenName: "Max",      familyName: "Verstappen", dateOfBirth: "1997-09-30", nationality: "Dutch",       permanentNumber: "1"  }, Constructors: [{ constructorId: "red_bull",      url: "", name: "Red Bull",      nationality: "Austrian"  }] },
  { position: "5", positionText: "5", points: "294", wins: "2",  Driver: { driverId: "george_russell",    code: "RUS", url: "", givenName: "George",   familyName: "Russell",    dateOfBirth: "1998-02-15", nationality: "British",     permanentNumber: "63" }, Constructors: [{ constructorId: "mercedes",      url: "", name: "Mercedes",      nationality: "German"    }] },
  { position: "6", positionText: "6", points: "244", wins: "2",  Driver: { driverId: "lewis_hamilton",    code: "HAM", url: "", givenName: "Lewis",    familyName: "Hamilton",   dateOfBirth: "1985-01-07", nationality: "British",     permanentNumber: "44" }, Constructors: [{ constructorId: "ferrari",       url: "", name: "Ferrari",       nationality: "Italian"   }] },
  { position: "7", positionText: "7", points: "152", wins: "0",  Driver: { driverId: "carlos_sainz",      code: "SAI", url: "", givenName: "Carlos",   familyName: "Sainz",      dateOfBirth: "1994-09-01", nationality: "Spanish",     permanentNumber: "55" }, Constructors: [{ constructorId: "williams",      url: "", name: "Williams",      nationality: "British"   }] },
  { position: "8", positionText: "8", points: "138", wins: "0",  Driver: { driverId: "kimi_antonelli",    code: "ANT", url: "", givenName: "Kimi",     familyName: "Antonelli",  dateOfBirth: "2006-08-25", nationality: "Italian",     permanentNumber: "12" }, Constructors: [{ constructorId: "mercedes",      url: "", name: "Mercedes",      nationality: "German"    }] },
  { position: "9", positionText: "9", points: "112", wins: "0",  Driver: { driverId: "fernando_alonso",   code: "ALO", url: "", givenName: "Fernando", familyName: "Alonso",     dateOfBirth: "1981-07-29", nationality: "Spanish",     permanentNumber: "14" }, Constructors: [{ constructorId: "aston_martin",  url: "", name: "Aston Martin",  nationality: "British"   }] },
  { position: "10",positionText:"10", points: "89",  wins: "0",  Driver: { driverId: "liam_lawson",       code: "LAW", url: "", givenName: "Liam",     familyName: "Lawson",     dateOfBirth: "2002-02-11", nationality: "New Zealander",permanentNumber: "30" }, Constructors: [{ constructorId: "red_bull",      url: "", name: "Red Bull",      nationality: "Austrian"  }] },
];

const MOCK_CONSTRUCTOR_STANDINGS: ErgastConstructorStanding[] = [
  { position: "1", positionText: "1", points: "847", wins: "15", Constructor: { constructorId: "mclaren",     url: "", name: "McLaren",     nationality: "British"  } },
  { position: "2", positionText: "2", points: "600", wins: "6",  Constructor: { constructorId: "ferrari",      url: "", name: "Ferrari",      nationality: "Italian"  } },
  { position: "3", positionText: "3", points: "432", wins: "3",  Constructor: { constructorId: "red_bull",     url: "", name: "Red Bull",     nationality: "Austrian" } },
  { position: "4", positionText: "4", points: "410", wins: "2",  Constructor: { constructorId: "mercedes",     url: "", name: "Mercedes",     nationality: "German"   } },
  { position: "5", positionText: "5", points: "152", wins: "0",  Constructor: { constructorId: "williams",     url: "", name: "Williams",     nationality: "British"  } },
];

const MOCK_RACES: ErgastRace[] = [
  { season: "2025", round: "1",  url: "", raceName: "Bahrain Grand Prix",         Circuit: { circuitId: "bahrain",       url: "", circuitName: "Bahrain International Circuit",    Location: { lat: "26.0325",  long: "50.5106",   locality: "Sakhir",       country: "Bahrain"      } }, date: "2024-03-02", time: "15:00:00Z" },
  { season: "2025", round: "2",  url: "", raceName: "Saudi Arabian Grand Prix",   Circuit: { circuitId: "jeddah",        url: "", circuitName: "Jeddah Corniche Circuit",           Location: { lat: "21.6319",  long: "39.1044",   locality: "Jeddah",       country: "Saudi Arabia" } }, date: "2024-03-09", time: "17:00:00Z" },
  { season: "2025", round: "3",  url: "", raceName: "Australian Grand Prix",      Circuit: { circuitId: "albert_park",   url: "", circuitName: "Albert Park Circuit",               Location: { lat: "-37.8497", long: "144.9680",  locality: "Melbourne",    country: "Australia"    } }, date: "2024-03-24", time: "04:00:00Z" },
  { season: "2025", round: "4",  url: "", raceName: "Japanese Grand Prix",        Circuit: { circuitId: "suzuka",        url: "", circuitName: "Suzuka Circuit",                    Location: { lat: "34.8431",  long: "136.5407",  locality: "Suzuka",       country: "Japan"        } }, date: "2024-04-07", time: "05:00:00Z" },
  { season: "2025", round: "5",  url: "", raceName: "Chinese Grand Prix",         Circuit: { circuitId: "shanghai",      url: "", circuitName: "Shanghai International Circuit",    Location: { lat: "31.3389",  long: "121.2200",  locality: "Shanghai",     country: "China"        } }, date: "2024-04-21", time: "07:00:00Z" },
  { season: "2025", round: "6",  url: "", raceName: "Miami Grand Prix",           Circuit: { circuitId: "miami",         url: "", circuitName: "Miami International Autodrome",     Location: { lat: "25.9581",  long: "-80.2389",  locality: "Miami",        country: "USA"          } }, date: "2024-05-05", time: "19:00:00Z" },
  { season: "2025", round: "7",  url: "", raceName: "Emilia Romagna Grand Prix",  Circuit: { circuitId: "imola",         url: "", circuitName: "Autodromo Enzo e Dino Ferrari",     Location: { lat: "44.3439",  long: "11.7167",   locality: "Imola",        country: "Italy"        } }, date: "2024-05-19", time: "13:00:00Z" },
  { season: "2025", round: "8",  url: "", raceName: "Monaco Grand Prix",          Circuit: { circuitId: "monaco",        url: "", circuitName: "Circuit de Monaco",                 Location: { lat: "43.7347",  long: "7.4205",    locality: "Monte Carlo",  country: "Monaco"       } }, date: "2024-05-26", time: "13:00:00Z" },
  { season: "2025", round: "9",  url: "", raceName: "Canadian Grand Prix",        Circuit: { circuitId: "villeneuve",    url: "", circuitName: "Circuit Gilles Villeneuve",          Location: { lat: "45.5000",  long: "-73.5228",  locality: "Montreal",     country: "Canada"       } }, date: "2024-06-09", time: "18:00:00Z" },
  { season: "2025", round: "10", url: "", raceName: "Spanish Grand Prix",         Circuit: { circuitId: "catalunya",     url: "", circuitName: "Circuit de Barcelona-Catalunya",    Location: { lat: "41.5700",  long: "2.2611",    locality: "Montmelo",     country: "Spain"        } }, date: "2024-06-23", time: "13:00:00Z" },
  { season: "2025", round: "11", url: "", raceName: "Austrian Grand Prix",        Circuit: { circuitId: "red_bull_ring", url: "", circuitName: "Red Bull Ring",                     Location: { lat: "47.2197",  long: "14.7647",   locality: "Spielberg",    country: "Austria"      } }, date: "2024-06-30", time: "13:00:00Z" },
  { season: "2025", round: "12", url: "", raceName: "British Grand Prix",         Circuit: { circuitId: "silverstone",   url: "", circuitName: "Silverstone Circuit",               Location: { lat: "52.0786",  long: "-1.0169",   locality: "Silverstone",  country: "UK"           } }, date: "2024-07-07", time: "14:00:00Z" },
  { season: "2025", round: "13", url: "", raceName: "Hungarian Grand Prix",       Circuit: { circuitId: "hungaroring",   url: "", circuitName: "Hungaroring",                        Location: { lat: "47.5789",  long: "19.2486",   locality: "Budapest",     country: "Hungary"      } }, date: "2024-07-21", time: "13:00:00Z" },
  { season: "2025", round: "14", url: "", raceName: "Belgian Grand Prix",         Circuit: { circuitId: "spa",           url: "", circuitName: "Circuit de Spa-Francorchamps",      Location: { lat: "50.4372",  long: "5.9714",    locality: "Spa",          country: "Belgium"      } }, date: "2024-07-28", time: "13:00:00Z" },
  { season: "2025", round: "15", url: "", raceName: "Dutch Grand Prix",           Circuit: { circuitId: "zandvoort",     url: "", circuitName: "Circuit Zandvoort",                  Location: { lat: "52.3888",  long: "4.5409",    locality: "Zandvoort",    country: "Netherlands"  } }, date: "2024-08-25", time: "13:00:00Z" },
  { season: "2025", round: "16", url: "", raceName: "Italian Grand Prix",         Circuit: { circuitId: "monza",         url: "", circuitName: "Autodromo Nazionale di Monza",       Location: { lat: "45.6156",  long: "9.2811",    locality: "Monza",        country: "Italy"        } }, date: "2024-09-01", time: "13:00:00Z" },
  { season: "2025", round: "17", url: "", raceName: "Azerbaijan Grand Prix",      Circuit: { circuitId: "baku",          url: "", circuitName: "Baku City Circuit",                  Location: { lat: "40.3725",  long: "49.8533",   locality: "Baku",         country: "Azerbaijan"   } }, date: "2024-09-15", time: "11:00:00Z" },
  { season: "2025", round: "18", url: "", raceName: "Singapore Grand Prix",       Circuit: { circuitId: "marina_bay",    url: "", circuitName: "Marina Bay Street Circuit",          Location: { lat: "1.2914",   long: "103.8640",  locality: "Singapore",    country: "Singapore"    } }, date: "2024-09-22", time: "08:00:00Z" },
  { season: "2025", round: "19", url: "", raceName: "United States Grand Prix",   Circuit: { circuitId: "americas",      url: "", circuitName: "Circuit of the Americas",            Location: { lat: "30.1328",  long: "-97.6411",  locality: "Austin",       country: "USA"          } }, date: "2024-10-20", time: "19:00:00Z" },
  { season: "2025", round: "20", url: "", raceName: "Mexico City Grand Prix",     Circuit: { circuitId: "rodriguez",     url: "", circuitName: "Autodromo Hermanos Rodriguez",       Location: { lat: "19.4042",  long: "-99.0907",  locality: "Mexico City",  country: "Mexico"       } }, date: "2024-10-27", time: "20:00:00Z" },
  { season: "2025", round: "21", url: "", raceName: "São Paulo Grand Prix",       Circuit: { circuitId: "interlagos",    url: "", circuitName: "Autodromo Jose Carlos Pace",         Location: { lat: "-23.7036", long: "-46.6997",  locality: "São Paulo",    country: "Brazil"       } }, date: "2024-11-03", time: "17:00:00Z" },
  { season: "2025", round: "22", url: "", raceName: "Las Vegas Grand Prix",       Circuit: { circuitId: "las_vegas",     url: "", circuitName: "Las Vegas Street Circuit",           Location: { lat: "36.1699",  long: "-115.1398", locality: "Las Vegas",    country: "USA"          } }, date: "2024-11-23", time: "06:00:00Z" },
  { season: "2025", round: "23", url: "", raceName: "Qatar Grand Prix",           Circuit: { circuitId: "losail",        url: "", circuitName: "Losail International Circuit",       Location: { lat: "25.4900",  long: "51.4531",   locality: "Lusail",       country: "Qatar"        } }, date: "2024-12-01", time: "17:00:00Z" },
  { season: "2025", round: "24", url: "", raceName: "Abu Dhabi Grand Prix",       Circuit: { circuitId: "yas_marina",    url: "", circuitName: "Yas Marina Circuit",                 Location: { lat: "24.4672",  long: "54.6031",   locality: "Abu Dhabi",    country: "UAE"          } }, date: "2024-12-08", time: "13:00:00Z" },
];

// ---------------------------------------------------------------------------
// Cache (module-level so it survives re-renders across component instances)
// ---------------------------------------------------------------------------

const cache: Record<
  number,
  {
    driverStandings: ErgastDriverStanding[];
    constructorStandings: ErgastConstructorStanding[];
    races: ErgastRace[];
  }
> = {};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseF1SeasonReturn {
  driverStandings: ErgastDriverStanding[];
  constructorStandings: ErgastConstructorStanding[];
  races: ErgastRace[];
  loading: boolean;
  error: string | null;
  year: number;
  setYear: (year: number) => void;
}

export function useF1Season(initialYear = 2025): UseF1SeasonReturn {
  const [year, setYear] = useState<number>(initialYear);
  const [driverStandings, setDriverStandings] = useState<ErgastDriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ErgastConstructorStanding[]>([]);
  const [races, setRaces] = useState<ErgastRace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Abort controller ref so we can cancel in-flight fetches on year change
  const abortRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async (targetYear: number) => {
    // Return cached data instantly
    if (cache[targetYear]) {
      const c = cache[targetYear];
      setDriverStandings(c.driverStandings);
      setConstructorStandings(c.constructorStandings);
      setRaces(c.races);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous requests
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const [drivers, constructors, raceList] = await Promise.all([
        fetchDriverStandings(targetYear),
        fetchConstructorStandings(targetYear),
        fetchSeasonRaces(targetYear),
      ]);

      // Validate we got useful data
      const hasData = drivers.length > 0 || constructors.length > 0 || raceList.length > 0;

      if (!hasData) throw new Error("Empty response from Ergast API");

      cache[targetYear] = {
        driverStandings: drivers,
        constructorStandings: constructors,
        races: raceList,
      };

      setDriverStandings(drivers);
      setConstructorStandings(constructors);
      setRaces(raceList);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch season data";
      setError(message);

      // Graceful fallback to mock data
      setDriverStandings(MOCK_DRIVER_STANDINGS);
      setConstructorStandings(MOCK_CONSTRUCTOR_STANDINGS);
      setRaces(MOCK_RACES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(year);
    return () => {
      abortRef.current?.abort();
    };
  }, [year, loadData]);

  return {
    driverStandings,
    constructorStandings,
    races,
    loading,
    error,
    year,
    setYear,
  };
}
