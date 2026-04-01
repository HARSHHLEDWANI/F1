from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import UserResponse
from app.dependencies import get_current_user
from app.database import get_db
from app import models, schemas
from app.models import User
router = APIRouter()


@router.get("/races", response_model=list[schemas.Race])
def get_races(db: Session = Depends(get_db)):
    """Get all available races from race results."""
    # Get distinct races from race_results table
    races = db.query(
        models.Race_Results.id,
        models.Race_Results.season,
        models.Race_Results.round,
        models.Race_Results.race_name
    ).distinct(
        models.Race_Results.season,
        models.Race_Results.round
    ).order_by(
        models.Race_Results.season.desc(),
        models.Race_Results.round.desc()
    ).all()
    
    return [{
        "id": idx + 1,  # Generate ID
        "season": race[1],
        "round": race[2],
        "race_name": race[3]
    } for idx, race in enumerate(races)]


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