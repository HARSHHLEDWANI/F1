from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import date

from .database import engine, SessionLocal, get_db
from . import models, schemas
from .auth import hash_password, verify_password, create_access_token
from .dependencies import get_current_user

from fastapi.middleware.cors import CORSMiddleware
from app.routes import f1
from app.routes import profile
app = FastAPI()

# ⭐ Create tables
models.Base.metadata.create_all(bind=engine)

# ⭐ Include API routes
app.include_router(f1.router)
app.include_router(profile.router)

# ⭐ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        email=user.email,
        hashed_password=hash_password(user.password),
        is_pro=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": db_user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.post("/predict")
def predict(current_user: models.User = Depends(get_current_user),
            db: Session = Depends(get_db)):

    user = db.query(models.User).filter(models.User.id == current_user.id).first()

    today = date.today()

    if not user.last_prediction_date or user.last_prediction_date != today:
        user.predictions_today = 0
        user.last_prediction_date = today

    limit = 25 if user.is_pro else 3

    if user.predictions_today >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Daily prediction limit reached ({limit})"
        )

    user.predictions_today += 1
    db.commit()

    return {
        "message": "Prediction recorded",
        "remaining_predictions": limit - user.predictions_today,
        "predictions_used": user.predictions_today
    }


@app.get("/")
def root():
    return {"message": "F1 Backend Running 🚀"}


@app.get("/races/{race_id}")
def get_race(race_id: int,
             current_user: models.User = Depends(get_current_user),
             db: Session = Depends(get_db)):

    race = db.query(models.Race).filter(models.Race.id == race_id).first()

    if not race:
        raise HTTPException(status_code=404, detail="Race not found")

    today = date.today()

    if not current_user.is_pro and race.race_date == today:
        raise HTTPException(
            status_code=403,
            detail="Free users can view race details only after 1 day. Upgrade to Pro."
        )

    return race
