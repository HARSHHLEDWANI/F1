from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("/drivers", response_model=list[schemas.Driver])
def get_drivers(db: Session = Depends(get_db)):
    return db.query(models.Driver).all()


@router.get("/teams", response_model=list[schemas.Team])
def get_teams(db: Session = Depends(get_db)):
    return db.query(models.Team).all()


@router.get("/tracks", response_model=list[schemas.Circuit])
def get_tracks(db: Session = Depends(get_db)):
    return db.query(models.Circuit).all()
