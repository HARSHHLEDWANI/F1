import logging

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import date

from .database import engine, get_db
from . import models, schemas
from .auth import hash_password, verify_password, create_access_token
from .dependencies import get_current_user

from fastapi.middleware.cors import CORSMiddleware
from app.routes import f1, profile, prediction
from app.schemas import PredictionCreate, OAuthLogin
from sqlalchemy import text, func
from app.seed import seed_all

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

app = FastAPI()

# ✅ CREATE TABLES + AUTO-SEED ON STARTUP
@app.on_event("startup")
def startup():
    try:
        models.Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully")
    except Exception as e:
        print("❌ DB CREATE ERROR:", e)
        return

    # Auto-seed on every cold start — seed_all() is idempotent (skips if data exists)
    try:
        seed_all()
    except Exception as e:
        print("❌ AUTO-SEED ERROR:", e)

    # Start APScheduler — refresh race data every Monday at 04:00 UTC
    # (most GPs finish Sunday evening; results are final by Monday 4AM)
    try:
        scheduler = BackgroundScheduler(timezone="UTC")
        scheduler.add_job(
            _scheduled_data_refresh,
            trigger=CronTrigger(day_of_week="mon", hour=4, minute=0),
            id="weekly_data_refresh",
            replace_existing=True,
        )
        scheduler.start()
        print("✅ APScheduler started — weekly refresh every Monday 04:00 UTC")
    except Exception as e:
        print("❌ SCHEDULER ERROR:", e)


def _scheduled_data_refresh():
    """Background job: sync latest race results and retrain model."""
    try:
        from scripts.update_data import run_update
        result = run_update()
        logger.info("Scheduled refresh result: %s", result)
    except Exception as e:
        logger.error("Scheduled refresh failed: %s", e)


# ✅ INCLUDE ROUTES
app.include_router(f1.router)
app.include_router(profile.router)
app.include_router(prediction.router)


# ✅ CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://f1-theta-seven.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= AUTH =================

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
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        print("LOGIN ATTEMPT:", form_data.username)

        db_user = db.query(models.User).filter(
            models.User.email == form_data.username
        ).first()

        print("DB USER:", db_user)

        if not db_user:
            raise HTTPException(status_code=401, detail="User not found")

        print("HASHED:", db_user.hashed_password)
        print("INPUT PASSWORD:", form_data.password)

        if not verify_password(form_data.password, db_user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid password")

        access_token = create_access_token({"sub": db_user.email})

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except Exception as e:
        print("🔥 LOGIN ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/oauth-login")
def oauth_login(data: OAuthLogin, db: Session = Depends(get_db)):
    """Find or create a user via OAuth provider, return a backend JWT."""
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        user = models.User(
            email=data.email,
            name=data.name or data.email.split("@")[0],
            hashed_password="",  # OAuth users have no password
            is_pro=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


# ================= PREDICT =================
@app.get("/seed")
def run_seed(secret: str):
    if secret != "harsh123":
        return {"error": "unauthorized"}

    from app.seed import seed_all
    seed_all()

    return {"message": "SEED COMPLETED ✅"}


@app.post("/admin/refresh")
def admin_refresh(
    background_tasks: BackgroundTasks,
    secret: str = Query(...),
    season: int = Query(None),
    retrain: bool = Query(True),
):
    """
    Manually trigger a race-data sync (and optional model retrain).

    Usage:
        POST /admin/refresh?secret=harsh123
        POST /admin/refresh?secret=harsh123&season=2025&retrain=false
    """
    if secret != "harsh123":
        raise HTTPException(status_code=403, detail="Unauthorized")

    def _run():
        from scripts.update_data import run_update
        result = run_update(season=season, retrain=retrain)
        logger.info("Manual refresh result: %s", result)

    background_tasks.add_task(_run)
    return {
        "message": "Data refresh started in background",
        "season": season or "current year",
        "retrain": retrain,
    }

@app.get("/debug/drivers-count")
def debug_drivers(db: Session = Depends(get_db)):
    count = db.query(models.Driver).count()
    return {"drivers_count": count}

@app.post("/predict")
def predict(
    prediction: PredictionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.id == current_user.id
    ).first()

    today = date.today()

    if not user.last_prediction_date or user.last_prediction_date != today:
        user.predictions_today = 0
        user.last_prediction_date = today

    limit = 25 if user.plan == "PRO" else 3

    if user.predictions_today >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Daily prediction limit reached ({limit})"
        )

    existing = db.query(models.Prediction).filter(
        models.Prediction.user_id == user.id,
        models.Prediction.season == prediction.season,
        models.Prediction.round == prediction.round
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="You already predicted this race")

    drivers = [
        prediction.predicted_p1,
        prediction.predicted_p2,
        prediction.predicted_p3
    ]

    if len(set(drivers)) != 3:
        raise HTTPException(status_code=400, detail="Drivers must be unique")

    new_prediction = models.Prediction(
        user_id=user.id,
        season=prediction.season,
        round=prediction.round,
        predicted_p1=prediction.predicted_p1,
        predicted_p2=prediction.predicted_p2,
        predicted_p3=prediction.predicted_p3
    )

    db.add(new_prediction)
    user.predictions_today += 1
    db.commit()

    return {
        "message": "Prediction saved",
        "remaining_predictions": limit - user.predictions_today
    }


# ================= RESULTS =================

@app.post("/calculate-results")
def calculate_results(season: int, round: int, db: Session = Depends(get_db)):

    actual_results = db.execute(
        text("""
            SELECT driver_ref, position
            FROM race_results
            WHERE season = :season
            AND round = :round
            AND position <= 3
        """),
        {"season": season, "round": round}
    ).fetchall()

    if len(actual_results) < 3:
        raise HTTPException(status_code=400, detail="Podium data not complete")

    actual_podium = {row.position: row.driver_ref for row in actual_results}

    predictions = db.query(models.Prediction).filter(
        models.Prediction.season == season,
        models.Prediction.round == round
    ).all()

    for pred in predictions:
        score = 0

        if pred.predicted_p1 == actual_podium.get(1):
            score += 3
        elif pred.predicted_p1 in actual_podium.values():
            score += 1

        if pred.predicted_p2 == actual_podium.get(2):
            score += 3
        elif pred.predicted_p2 in actual_podium.values():
            score += 1

        if pred.predicted_p3 == actual_podium.get(3):
            score += 3
        elif pred.predicted_p3 in actual_podium.values():
            score += 1

        pred.score = score

    db.commit()

    return {"message": "Scores calculated", "count": len(predictions)}


# ================= STATS =================

@app.get("/prediction-history")
def prediction_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    stats = db.query(
        func.count(models.Prediction.id),
        func.sum(models.Prediction.score),
        func.avg(models.Prediction.score),
        func.max(models.Prediction.score)
    ).filter(models.Prediction.user_id == current_user.id).first()

    total = stats[0] or 0
    avg = float(stats[2] or 0)

    accuracy = round((avg / 9) * 100, 2) if total > 0 else 0

    return {
        "total_predictions": total,
        "accuracy": accuracy
    }


# ================= ROOT =================

@app.get("/")
def root():
    return {"message": "F1 Backend Running 🚀"}