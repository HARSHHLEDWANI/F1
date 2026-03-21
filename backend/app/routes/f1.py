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