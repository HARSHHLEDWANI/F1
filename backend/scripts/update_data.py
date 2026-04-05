"""
Automated data update pipeline for F1 race results.

Fetches new race rounds from Jolpica-F1 for the current season and
upserts them into the database. Only inserts rounds not already present.

Can be run standalone:
    python -m scripts.update_data

Or called programmatically:
    from scripts.update_data import run_update
    run_update()
"""

import os
import sys
import logging
import subprocess
from datetime import datetime
from pathlib import Path

import requests
import psycopg2
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [update_data] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)

JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1"


def _get_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL not set")
    return psycopg2.connect(db_url)


def _fetch_season_results(season: int) -> list[dict]:
    """Fetch all race results for a season from Jolpica."""
    url = f"{JOLPICA_BASE}/{season}/results.json?limit=1000"
    logger.info("Fetching %s", url)
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    races = resp.json()["MRData"]["RaceTable"]["Races"]

    rows = []
    for race in races:
        for result in race["Results"]:
            rows.append({
                "season": season,
                "round": int(race["round"]),
                "race_name": race["raceName"],
                "driver_ref": result["Driver"]["driverId"],
                "constructor_ref": result["Constructor"]["constructorId"],
                "grid": result.get("grid"),
                "position": result.get("position"),
                "points": result.get("points"),
                "status": result["status"],
                "laps": result.get("laps"),
                "time": result.get("Time", {}).get("time"),
            })
    return rows


def _get_existing_rounds(conn, season: int) -> set[int]:
    """Return the set of round numbers already in the DB for this season."""
    with conn.cursor() as cur:
        cur.execute(
            "SELECT DISTINCT round FROM race_results WHERE season = %s",
            (season,),
        )
        return {row[0] for row in cur.fetchall()}


def _insert_round(conn, rows: list[dict]) -> int:
    """Insert all result rows for a single round. Returns inserted count."""
    with conn.cursor() as cur:
        for r in rows:
            cur.execute(
                """
                INSERT INTO race_results
                    (season, round, race_name, driver_ref, constructor_ref,
                     grid, position, points, status, laps, time)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT DO NOTHING
                """,
                (
                    r["season"], r["round"], r["race_name"],
                    r["driver_ref"], r["constructor_ref"],
                    r["grid"], r["position"], r["points"],
                    r["status"], r["laps"], r["time"],
                ),
            )
    conn.commit()
    return len(rows)


def _retrain_model() -> bool:
    """Trigger model retraining by calling train_model.py as a subprocess."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.error("DATABASE_URL not set — skipping retrain")
        return False

    backend_dir = Path(__file__).resolve().parent.parent
    train_script = backend_dir / "train_model.py"
    models_dir = backend_dir / "models"

    if not train_script.exists():
        logger.error("train_model.py not found at %s", train_script)
        return False

    logger.info("Starting model retrain...")
    result = subprocess.run(
        [sys.executable, str(train_script),
         "--database-url", db_url,
         "--output", str(models_dir)],
        capture_output=True,
        text=True,
        cwd=str(backend_dir),
    )

    if result.returncode == 0:
        logger.info("Model retrain succeeded")
        return True
    else:
        logger.error("Model retrain failed:\n%s", result.stderr)
        return False


def run_update(season: int = None, retrain: bool = True) -> dict:
    """
    Main entry point. Fetches new race rounds and optionally retrains the model.

    Args:
        season: Season year to sync. Defaults to current calendar year.
        retrain: Whether to retrain the model after inserting new data.

    Returns:
        Dict with keys: season, new_rounds, rows_inserted, retrained
    """
    if season is None:
        season = datetime.utcnow().year

    logger.info("=== Data update started for season %s ===", season)

    try:
        all_rows = _fetch_season_results(season)
    except Exception as e:
        logger.error("Failed to fetch from Jolpica: %s", e)
        return {"error": str(e)}

    if not all_rows:
        logger.info("No race data returned from Jolpica for %s", season)
        return {"season": season, "new_rounds": 0, "rows_inserted": 0, "retrained": False}

    # Group rows by round
    rounds: dict[int, list] = {}
    for row in all_rows:
        rounds.setdefault(row["round"], []).append(row)

    try:
        conn = _get_connection()
    except Exception as e:
        logger.error("DB connection failed: %s", e)
        return {"error": str(e)}

    try:
        existing = _get_existing_rounds(conn, season)
        new_round_nums = sorted(set(rounds.keys()) - existing)
        logger.info(
            "Jolpica has %d rounds, DB has %d, inserting %d new",
            len(rounds), len(existing), len(new_round_nums),
        )

        total_inserted = 0
        for rnd in new_round_nums:
            inserted = _insert_round(conn, rounds[rnd])
            total_inserted += inserted
            logger.info("Inserted round %d (%d rows)", rnd, inserted)

    finally:
        conn.close()

    retrained = False
    if retrain and new_round_nums:
        retrained = _retrain_model()
    elif not new_round_nums:
        logger.info("No new rounds — skipping retrain")

    logger.info(
        "=== Update complete: %d new rounds, %d rows inserted, retrained=%s ===",
        len(new_round_nums), total_inserted, retrained,
    )
    return {
        "season": season,
        "new_rounds": len(new_round_nums),
        "rows_inserted": total_inserted,
        "retrained": retrained,
    }


if __name__ == "__main__":
    import json
    result = run_update()
    print(json.dumps(result, indent=2))
