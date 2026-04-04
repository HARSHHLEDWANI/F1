import asyncio
import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.schemas import UserResponse
from app.dependencies import get_current_user
from app.database import get_db
from app import models, schemas
from app.models import User
from app.services.f1_fetcher import fetch_season_races

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/races", response_model=list[schemas.Race])
def get_races(
    year: Optional[int] = Query(None, description="Season year, e.g. 2024"),
    db: Session = Depends(get_db),
):
    """
    Return the race schedule for a given season year.

    Data source priority:
      1. race_schedule table (cached from Jolpica)
      2. Live fetch from Jolpica API → cache → return
      3. Fallback: distinct rounds from race_results table (no date/circuit info)
    """
    # Determine which year to serve
    if year is None:
        latest = (
            db.query(models.Race_Results.season)
            .order_by(models.Race_Results.season.desc())
            .first()
        )
        year = latest[0] if latest else 2024

    # 1. Check race_schedule table first
    cached = (
        db.query(models.RaceSchedule)
        .filter(models.RaceSchedule.season == year)
        .order_by(models.RaceSchedule.round)
        .all()
    )
    if cached:
        return [
            {
                "id": r.id,
                "season": r.season,
                "round": r.round,
                "race_name": r.race_name,
                "date": r.date,
                "circuit_name": r.circuit_name,
                "country": r.country,
            }
            for r in cached
        ]

    # 2. Fetch live from Jolpica and cache
    try:
        live_races = asyncio.get_event_loop().run_until_complete(
            fetch_season_races(year)
        )
    except Exception as exc:
        logger.warning("Jolpica fetch failed for year=%s: %s", year, exc)
        live_races = []

    if live_races:
        for race in live_races:
            db.add(
                models.RaceSchedule(
                    season=race["season"],
                    round=race["round"],
                    race_name=race["race_name"],
                    date=race.get("date", ""),
                    time=race.get("time", ""),
                    circuit_id=race.get("circuit_id", ""),
                    circuit_name=race.get("circuit_name", ""),
                    locality=race.get("locality", ""),
                    country=race.get("country", ""),
                    lat=race.get("lat"),
                    lng=race.get("lng"),
                )
            )
        try:
            db.commit()
        except Exception as exc:
            db.rollback()
            logger.error("DB write failed when caching race schedule: %s", exc)

        return [
            {
                "id": idx + 1,
                "season": r["season"],
                "round": r["round"],
                "race_name": r["race_name"],
                "date": r.get("date"),
                "circuit_name": r.get("circuit_name"),
                "country": r.get("country"),
            }
            for idx, r in enumerate(live_races)
        ]

    # 3. Last resort: distinct rounds from race_results (no schedule metadata)
    fallback = (
        db.query(
            models.Race_Results.season,
            models.Race_Results.round,
            models.Race_Results.race_name,
        )
        .filter(models.Race_Results.season == year)
        .distinct(models.Race_Results.round)
        .order_by(models.Race_Results.round)
        .all()
    )
    return [
        {"id": idx + 1, "season": r[0], "round": r[1], "race_name": r[2],
         "date": None, "circuit_name": None, "country": None}
        for idx, r in enumerate(fallback)
    ]


@router.get("/drivers", response_model=list[schemas.Driver])
def get_drivers(db: Session = Depends(get_db)):
    return db.query(models.Driver).all()


@router.get("/teams", response_model=list[schemas.Team])
def get_teams(db: Session = Depends(get_db)):
    return db.query(models.Team).all()


@router.get("/tracks", response_model=list[schemas.Circuit])
def get_tracks(db: Session = Depends(get_db)):
    return db.query(models.Circuit).all()

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/live-race")
def get_live_race(db: Session = Depends(get_db)):
    """Return simulated live race data using the most recent race in the database."""
    # Get the most recent race entry
    latest = db.query(models.Race_Results).order_by(
        models.Race_Results.season.desc(),
        models.Race_Results.round.desc()
    ).first()

    if not latest:
        return {"status": "no_session", "session": None, "message": "No data available"}

    # Get all results for that race, ordered by finishing position
    results = db.query(models.Race_Results).filter(
        models.Race_Results.season == latest.season,
        models.Race_Results.round == latest.round
    ).order_by(models.Race_Results.position).all()

    return {
        "status": "finished",
        "race_name": latest.race_name,
        "season": latest.season,
        "round": latest.round,
        "session": "Race",
        "results": [
            {
                "position": r.position,
                "driver_ref": r.driver_ref,
                "constructor_ref": r.constructor_ref,
                "points": r.points,
                "status": r.status,
                "laps": r.laps,
                "time": r.time
            }
            for r in results[:10]
        ]
    }