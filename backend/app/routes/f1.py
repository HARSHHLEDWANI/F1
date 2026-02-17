from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import UserResponse
from app.dependencies import get_current_user
from app.database import get_db
from app import models, schemas
from app.models import User
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

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user