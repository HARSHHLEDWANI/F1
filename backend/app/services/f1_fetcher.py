"""
F1 Data Fetcher Service
-----------------------
Fetches live F1 data from the Jolpica-F1 API, which is the maintained
drop-in replacement for the defunct Ergast API (same URL structure).

API base: https://api.jolpi.ca/ergast/f1
Docs:     https://github.com/jolpica/jolpica-f1
"""

import logging
from typing import Optional
import httpx

logger = logging.getLogger(__name__)

JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1"

# Shared async client – reuse connections across calls
_client: Optional[httpx.AsyncClient] = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=15.0)
    return _client


async def _get(path: str) -> dict:
    """GET a Jolpica endpoint and return parsed JSON."""
    url = f"{JOLPICA_BASE}{path}"
    client = get_client()
    try:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        logger.error("Jolpica HTTP error %s for %s", e.response.status_code, url)
        raise
    except httpx.RequestError as e:
        logger.error("Jolpica request error for %s: %s", url, e)
        raise


async def fetch_season_races(year: int) -> list[dict]:
    """
    Return the list of races in a given season.

    Each dict contains:
        season, round, raceName, date, time,
        circuit: { circuitId, circuitName, lat, long, locality, country }
    """
    data = await _get(f"/{year}/races.json?limit=30")
    races_raw = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])

    races = []
    for r in races_raw:
        circuit = r.get("Circuit", {})
        location = circuit.get("Location", {})
        races.append({
            "season": int(r.get("season", year)),
            "round": int(r.get("round", 0)),
            "race_name": r.get("raceName", ""),
            "date": r.get("date", ""),
            "time": r.get("time", ""),
            "circuit_id": circuit.get("circuitId", ""),
            "circuit_name": circuit.get("circuitName", ""),
            "lat": float(location.get("lat", 0) or 0),
            "lng": float(location.get("long", 0) or 0),
            "locality": location.get("locality", ""),
            "country": location.get("country", ""),
        })
    return races


async def fetch_race_results(year: int, round_num: int) -> list[dict]:
    """
    Return finishing results for a specific race.

    Each dict contains:
        driver_ref, constructor_ref, grid, position, points, status, laps, time
    """
    data = await _get(f"/{year}/{round_num}/results.json")
    races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
    if not races:
        return []

    results = []
    for r in races[0].get("Results", []):
        driver = r.get("Driver", {})
        constructor = r.get("Constructor", {})
        time_data = r.get("Time", {})
        results.append({
            "driver_ref": driver.get("driverId", ""),
            "constructor_ref": constructor.get("constructorId", ""),
            "grid": int(r.get("grid", 0)),
            "position": int(r.get("position", 0)) if r.get("position", "").isdigit() else None,
            "points": float(r.get("points", 0)),
            "status": r.get("status", "Finished"),
            "laps": int(r.get("laps", 0)),
            "time": time_data.get("time", ""),
        })
    return results


async def fetch_driver_standings(year: int) -> list[dict]:
    """Return driver championship standings for the given year."""
    data = await _get(f"/{year}/driverStandings.json")
    standings_lists = (
        data.get("MRData", {})
        .get("StandingsTable", {})
        .get("StandingsLists", [])
    )
    if not standings_lists:
        return []

    results = []
    for s in standings_lists[0].get("DriverStandings", []):
        driver = s.get("Driver", {})
        constructors = s.get("Constructors", [{}])
        results.append({
            "position": int(s.get("position", 0)),
            "driver_id": driver.get("driverId", ""),
            "code": driver.get("code", ""),
            "given_name": driver.get("givenName", ""),
            "family_name": driver.get("familyName", ""),
            "nationality": driver.get("nationality", ""),
            "points": float(s.get("points", 0)),
            "wins": int(s.get("wins", 0)),
            "constructor": constructors[0].get("name", "") if constructors else "",
        })
    return results


async def fetch_constructor_standings(year: int) -> list[dict]:
    """Return constructor championship standings for the given year."""
    data = await _get(f"/{year}/constructorStandings.json")
    standings_lists = (
        data.get("MRData", {})
        .get("StandingsTable", {})
        .get("StandingsLists", [])
    )
    if not standings_lists:
        return []

    results = []
    for s in standings_lists[0].get("ConstructorStandings", []):
        constructor = s.get("Constructor", {})
        results.append({
            "position": int(s.get("position", 0)),
            "constructor_id": constructor.get("constructorId", ""),
            "name": constructor.get("name", ""),
            "nationality": constructor.get("nationality", ""),
            "points": float(s.get("points", 0)),
            "wins": int(s.get("wins", 0)),
        })
    return results


async def fetch_next_race() -> Optional[dict]:
    """Return the next upcoming race, or None if season is over."""
    try:
        data = await _get("/current/next.json")
        races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        if not races:
            return None
        r = races[0]
        circuit = r.get("Circuit", {})
        location = circuit.get("Location", {})
        return {
            "season": int(r.get("season", 0)),
            "round": int(r.get("round", 0)),
            "race_name": r.get("raceName", ""),
            "date": r.get("date", ""),
            "time": r.get("time", ""),
            "circuit_id": circuit.get("circuitId", ""),
            "circuit_name": circuit.get("circuitName", ""),
            "locality": location.get("locality", ""),
            "country": location.get("country", ""),
        }
    except Exception:
        return None
