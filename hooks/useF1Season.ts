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

const MOCK_DRIVER_STANDINGS: ErgastDriverStanding[] = [
  {
    position: "1", positionText: "1", points: "575", wins: "19",
    Driver: { driverId: "max_verstappen", code: "VER", url: "", givenName: "Max", familyName: "Verstappen", dateOfBirth: "1997-09-30", nationality: "Dutch", permanentNumber: "1" },
    Constructors: [{ constructorId: "red_bull", url: "", name: "Red Bull", nationality: "Austrian" }],
  },
  {
    position: "2", positionText: "2", points: "356", wins: "4",
    Driver: { driverId: "lando_norris", code: "NOR", url: "", givenName: "Lando", familyName: "Norris", dateOfBirth: "1999-11-13", nationality: "British", permanentNumber: "4" },
    Constructors: [{ constructorId: "mclaren", url: "", name: "McLaren", nationality: "British" }],
  },
  {
    position: "3", positionText: "3", points: "307", wins: "3",
    Driver: { driverId: "charles_leclerc", code: "LEC", url: "", givenName: "Charles", familyName: "Leclerc", dateOfBirth: "1997-10-16", nationality: "Monegasque", permanentNumber: "16" },
    Constructors: [{ constructorId: "ferrari", url: "", name: "Ferrari", nationality: "Italian" }],
  },
  {
    position: "4", positionText: "4", points: "291", wins: "2",
    Driver: { driverId: "carlos_sainz", code: "SAI", url: "", givenName: "Carlos", familyName: "Sainz", dateOfBirth: "1994-09-01", nationality: "Spanish", permanentNumber: "55" },
    Constructors: [{ constructorId: "ferrari", url: "", name: "Ferrari", nationality: "Italian" }],
  },
  {
    position: "5", positionText: "5", points: "262", wins: "1",
    Driver: { driverId: "george_russell", code: "RUS", url: "", givenName: "George", familyName: "Russell", dateOfBirth: "1998-02-15", nationality: "British", permanentNumber: "63" },
    Constructors: [{ constructorId: "mercedes", url: "", name: "Mercedes", nationality: "German" }],
  },
];

const MOCK_CONSTRUCTOR_STANDINGS: ErgastConstructorStanding[] = [
  { position: "1", positionText: "1", points: "860", wins: "21", Constructor: { constructorId: "red_bull", url: "", name: "Red Bull", nationality: "Austrian" } },
  { position: "2", positionText: "2", points: "666", wins: "4", Constructor: { constructorId: "mclaren", url: "", name: "McLaren", nationality: "British" } },
  { position: "3", positionText: "3", points: "652", wins: "5", Constructor: { constructorId: "ferrari", url: "", name: "Ferrari", nationality: "Italian" } },
  { position: "4", positionText: "4", points: "468", wins: "4", Constructor: { constructorId: "mercedes", url: "", name: "Mercedes", nationality: "German" } },
  { position: "5", positionText: "5", points: "94", wins: "0", Constructor: { constructorId: "aston_martin", url: "", name: "Aston Martin", nationality: "British" } },
];

const MOCK_RACES: ErgastRace[] = [
  { season: "2024", round: "1", url: "", raceName: "Bahrain Grand Prix", Circuit: { circuitId: "bahrain", url: "", circuitName: "Bahrain International Circuit", Location: { lat: "26.0325", long: "50.5106", locality: "Sakhir", country: "Bahrain" } }, date: "2024-03-02", time: "15:00:00Z" },
  { season: "2024", round: "2", url: "", raceName: "Saudi Arabian Grand Prix", Circuit: { circuitId: "jeddah", url: "", circuitName: "Jeddah Corniche Circuit", Location: { lat: "21.6319", long: "39.1044", locality: "Jeddah", country: "Saudi Arabia" } }, date: "2024-03-09", time: "17:00:00Z" },
  { season: "2024", round: "3", url: "", raceName: "Australian Grand Prix", Circuit: { circuitId: "albert_park", url: "", circuitName: "Albert Park Grand Prix Circuit", Location: { lat: "-37.8497", long: "144.968", locality: "Melbourne", country: "Australia" } }, date: "2024-03-24", time: "04:00:00Z" },
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

export function useF1Season(initialYear = 2024): UseF1SeasonReturn {
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
