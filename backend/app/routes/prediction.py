"""
Prediction Routes
ML-powered race and overtake predictions.
"""

import os
import pickle
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, List

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas import (
    RaceRequest, RacePredictionResponse, PodiumPrediction,
    OvertakePredictionResponse, OvertakeProbability
)

router = APIRouter(prefix="/predictions", tags=["predictions"])
logger = logging.getLogger(__name__)

# Global model state
_model = None
_scaler = None
_feature_columns = None


def load_model():
    """Load trained model from disk (lazy loading)."""
    global _model, _scaler, _feature_columns
    
    if _model is not None:
        return _model, _scaler, _feature_columns
    
    try:
        model_dir = Path(__file__).parent.parent.parent / "models"
        model_path = model_dir / "f1_model.pkl"
        scaler_path = model_dir / "f1_scaler.pkl"
        
        if not model_path.exists() or not scaler_path.exists():
            logger.warning(f"Model files not found at {model_dir}")
            return None, None, None
        
        with open(model_path, 'rb') as f:
            _model = pickle.load(f)
        
        with open(scaler_path, 'rb') as f:
            _scaler = pickle.load(f)
        
        # Define feature columns (must match training)
        _feature_columns = [
            'grid_position',
            'driver_avg_position',
            'driver_position_trend',
            'driver_points_std',
            'driver_podiums_10races',
            'driver_dnf_rate',
            'constructor_reliability',
            'constructor_avg_position',
            'constructor_avg_points',
            'constructor_recent_points',
            'track_affinity_position',
            'track_affinity_podium_rate',
            'track_difficulty',
            'track_experience',
            'driver_overtake_ability',
            'constructor_overtake_power',
            'driver_form_index'
        ]
        
        logger.info("✓ Model loaded successfully")
        return _model, _scaler, _feature_columns
    
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return None, None, None


def build_driver_features(
    driver_id: int,
    grid_position: int,
    circuit_id: int,
    season: int,
    constructor_ref: str,
    db: Session
) -> Optional[dict]:
    """
    Build feature vector for a single driver.
    
    Args:
        driver_id: Driver ID
        grid_position: Qualifying position (1-20)
        circuit_id: Circuit ID
        season: Current season
        db: Database session
        
    Returns:
        Dictionary with features or None if insufficient data
    """
    try:
        features = {'grid_position': grid_position}
        
        # Get driver info
        driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
        if not driver:
            return None
            
        # Construct driver_ref (lowercase family name)
        driver_ref = driver.family_name.lower()
        
        # Get driver's recent race history
        recent_races = db.query(models.Race_Results).filter(
            models.Race_Results.driver_ref == driver_ref,
            models.Race_Results.season >= season - 2  # Last 2 seasons
        ).order_by(models.Race_Results.season.desc(), models.Race_Results.round.desc()).limit(20).all()
        
        if not recent_races:
            # Use defaults if no history
            features['driver_avg_position'] = 15.0
            features['driver_position_trend'] = 0.0
            features['driver_points_std'] = 5.0
            features['driver_podiums_10races'] = 2.0
            features['driver_dnf_rate'] = 0.2
            features['driver_overtake_ability'] = 0.0
        else:
            # Calculate driver form metrics
            positions = [r.position if r.position else 20 for r in recent_races]
            points = [r.points if r.points else 0 for r in recent_races]
            
            features['driver_avg_position'] = float(np.mean(positions))
            features['driver_position_trend'] = float(np.mean(positions[-5:]) - np.mean(positions)) if len(positions) > 5 else 0.0
            features['driver_points_std'] = float(np.std(points)) if len(points) > 1 else 0.0
            features['driver_podiums_10races'] = float(sum(1 for p in points[-10:] if p > 0))
            
            dnf_count = sum(1 for r in recent_races if r.status and 'DNF' in r.status)
            features['driver_dnf_rate'] = float(dnf_count / len(recent_races))
            
            # Position change ability
            position_changes = []
            for r in recent_races:
                if r.grid and r.position:
                    position_changes.append(float(r.grid) - float(r.position))
            features['driver_overtake_ability'] = float(np.mean(position_changes)) if position_changes else 0.0
        
        # Get constructor metrics
        team_races = db.query(models.Race_Results).filter(
            models.Race_Results.constructor_ref == constructor_ref,
            models.Race_Results.season == season
        ).all()
        
        if team_races:
            dnf_count = sum(1 for r in team_races if r.status and 'DNF' in r.status)
            features['constructor_reliability'] = float(1 - (dnf_count / len(team_races)))
            features['constructor_avg_position'] = float(np.mean([r.position if r.position else 20 for r in team_races]))
            features['constructor_avg_points'] = float(np.mean([r.points if r.points else 0 for r in team_races]))
            features['constructor_recent_points'] = float(np.mean([r.points if r.points else 0 for r in team_races[-5:]]))
            features['constructor_overtake_power'] = float(np.mean([
                (float(r.grid) - float(r.position)) for r in team_races if r.grid and r.position
            ]))
        else:
            features['constructor_reliability'] = 0.8
            features['constructor_avg_position'] = 12.0
            features['constructor_avg_points'] = 8.0
            features['constructor_recent_points'] = 8.0
            features['constructor_overtake_power'] = 0.0
        
        # Track affinity
        circuit = db.query(models.Circuit).filter(models.Circuit.id == circuit_id).first()
        if circuit:
            track_races = db.query(models.Race_Results).filter(
                models.Race_Results.driver_ref == driver_ref,
                models.Race_Results.race_name.ilike(f'%{circuit.name}%')
            ).all()
        else:
            track_races = []
        
        if track_races:
            features['track_affinity_position'] = float(np.mean([r.position if r.position else 20 for r in track_races]))
            features['track_affinity_podium_rate'] = float(sum(1 for r in track_races if r.points > 0) / len(track_races))
            features['track_experience'] = float(len(track_races))
        else:
            features['track_affinity_position'] = 15.0
            features['track_affinity_podium_rate'] = 0.0
            features['track_experience'] = 0.0
        
        # Track difficulty
        if circuit:
            all_races_at_track = db.query(models.Race_Results).filter(
                models.Race_Results.race_name.ilike(f'%{circuit.name}%')
            ).all()
        else:
            all_races_at_track = []
        
        if all_races_at_track:
            features['track_difficulty'] = float(np.mean([r.position if r.position else 20 for r in all_races_at_track]))
        else:
            features['track_difficulty'] = 15.0
        
        # Driver form index (0-100)
        form_score = (float(np.mean(points)) / 25.0) * 100 if points else 50.0
        position_score = 100 - (features['driver_avg_position'] / 20 * 100)
        features['driver_form_index'] = float((form_score * 0.6) + (position_score * 0.4))
        features['driver_form_index'] = max(0, min(100, features['driver_form_index']))
        
        return features
    
    except Exception as e:
        logger.error(f"Error building driver features: {e}")
        return None


def calculate_confidence_score(
    predicted_position: float,
    driver_form_index: float,
    reliability: float
) -> float:
    """
    Calculate confidence score based on multiple factors.
    
    Args:
        predicted_position: Predicted finishing position (1-20)
        driver_form_index: Driver form (0-100)
        reliability: Constructor reliability (0-1)
        
    Returns:
        Confidence score (0-100)
    """
    # Confidence decreases as predicted position gets worse
    position_confidence = max(0, 100 - (predicted_position * 4))
    
    # Weight form index heavily
    form_confidence = driver_form_index
    
    # Reliability ensures more predictable races
    reliability_confidence = reliability * 50 + 50
    
    # Combine
    combined = (position_confidence * 0.4) + (form_confidence * 0.4) + (reliability_confidence * 0.2)
    
    return min(100, max(0, combined))


# ── Driver / Constructor resolution helpers ───────────────────────────────────

_DRIVER_NAME_CORRECTIONS: dict = {
    "perez": "Pérez",
    "hulkenberg": "Hülkenberg",
    "raikkonen": "Räikkönen",
    "kovalainen": "Kovalainen",
    "bottas": "Bottas",
    "magnussen": "Magnussen",
    "guanyu": "Guanyu",
    "zhou": "Zhou",
}

_CONSTRUCTOR_ALIAS: dict = {
    "red_bull": "Red Bull",
    "alphatauri": "AlphaTauri",
    "alpha_tauri": "AlphaTauri",
    "rb": "RB",
    "vcarb": "RB",
    "alfa": "Alfa Romeo",
    "alfa_romeo": "Alfa Romeo",
    "haas": "Haas",
    "williams": "Williams",
    "mercedes": "Mercedes",
    "ferrari": "Ferrari",
    "mclaren": "McLaren",
    "aston_martin": "Aston Martin",
    "alpine": "Alpine",
    "sauber": "Sauber",
    "kick_sauber": "Sauber",
}


def _resolve_driver(driver_ref: str, db: Session) -> Optional[models.Driver]:
    """Resolve driver_ref → Driver ORM, trying multiple strategies."""
    family_part = driver_ref.split("_")[-1].lower()

    # Strategy 1: known correction map (handles accents)
    corrected = _DRIVER_NAME_CORRECTIONS.get(family_part)
    if corrected:
        driver = db.query(models.Driver).filter(
            models.Driver.family_name == corrected
        ).first()
        if driver:
            return driver

    # Strategy 2: case-insensitive exact family name
    driver = db.query(models.Driver).filter(
        models.Driver.family_name.ilike(family_part)
    ).first()
    if driver:
        return driver

    # Strategy 3: family name contains the part (compound/hyphenated names)
    driver = db.query(models.Driver).filter(
        models.Driver.family_name.ilike(f"%{family_part}%")
    ).first()
    return driver


def _resolve_constructor(constructor_ref: str, db: Session) -> Optional[models.Team]:
    """Resolve constructor_ref → Team ORM, trying multiple strategies."""
    ref_lower = constructor_ref.lower()

    # Strategy 1: known alias map
    alias_name = _CONSTRUCTOR_ALIAS.get(ref_lower)
    if alias_name:
        team = db.query(models.Team).filter(
            models.Team.name.ilike(f"%{alias_name}%")
        ).first()
        if team:
            return team

    # Strategy 2: replace underscores, ilike match
    clean_ref = constructor_ref.replace("_", " ")
    team = db.query(models.Team).filter(
        models.Team.name.ilike(f"%{clean_ref}%")
    ).first()
    if team:
        return team

    # Strategy 3: first word only (e.g. "mercedes_amg" → "Mercedes")
    first_word = clean_ref.split()[0] if clean_ref.split() else clean_ref
    return db.query(models.Team).filter(
        models.Team.name.ilike(f"%{first_word}%")
    ).first()


def _resolve_circuit(race_name: str, db: Session) -> Optional[models.Circuit]:
    """Best-effort circuit lookup from a race name string."""
    # Strip " Grand Prix" suffix and try increasingly loose matches
    stripped = race_name.replace(" Grand Prix", "").strip()
    for fragment in [stripped, stripped.split()[-1], stripped.split()[0]]:
        circuit = db.query(models.Circuit).filter(
            models.Circuit.name.ilike(f"%{fragment}%")
        ).first()
        if circuit:
            return circuit
    return None


def _statistical_podium_fallback(
    season: int, round_num: int, race_name: str,
    race_drivers: list, db: Session
) -> "RacePredictionResponse":
    """Return a stats-based podium when the ML model is unavailable."""
    candidates = []
    for rd in race_drivers:
        driver = _resolve_driver(rd.driver_ref, db)
        if not driver:
            continue

        recent = db.query(models.Race_Results).filter(
            models.Race_Results.driver_ref == rd.driver_ref,
            models.Race_Results.season >= season - 1,
        ).order_by(
            models.Race_Results.season.desc(),
            models.Race_Results.round.desc(),
        ).limit(10).all()

        rating = float(driver.rating) if driver.rating else 50.0
        if recent:
            avg_pos = float(np.mean([r.position if r.position else 20 for r in recent]))
            pts_avg = float(np.mean([r.points if r.points else 0 for r in recent]))
        else:
            avg_pos, pts_avg = 15.0, 0.0

        form_index = float(max(0.0, min(100.0,
            rating * 0.4 + (20.0 - avg_pos) / 20.0 * 40.0 + pts_avg / 25.0 * 20.0
        )))
        constructor = _resolve_constructor(rd.constructor_ref, db)
        candidates.append({
            "driver_id": driver.id,
            "driver_name": f"{driver.given_name} {driver.family_name}",
            "constructor": constructor.name if constructor else rd.constructor_ref.replace("_", " ").title(),
            "predicted_position": avg_pos,
            "confidence": round(form_index * 0.8, 1),
            "form_index": round(form_index, 1),
        })

    candidates.sort(key=lambda x: x["predicted_position"])
    podium = candidates[:3]

    if not podium:
        raise HTTPException(status_code=404, detail="Insufficient driver data for statistical prediction")

    podium_predictions = [
        PodiumPrediction(
            position=i + 1,
            driver_id=p["driver_id"],
            driver_name=p["driver_name"],
            constructor=p["constructor"],
            predicted_finish_position=round(p["predicted_position"], 2),
            confidence_score=p["confidence"],
            form_index=p["form_index"],
        )
        for i, p in enumerate(podium)
    ]
    return RacePredictionResponse(
        season=season,
        round=round_num,
        circuit_name=race_name,
        podium=podium_predictions,
        overall_confidence=round(float(np.mean([p.confidence_score for p in podium_predictions])), 1),
        generated_at=datetime.utcnow().isoformat() + "Z",
    )


@router.post("/podium", response_model=RacePredictionResponse)
async def predict_podium(request: RaceRequest, db: Session = Depends(get_db)):
    """
    Predict the podium for a given season and round.
    Falls back to statistical prediction when the ML model is unavailable.
    """
    model, scaler, features_cols = load_model()

    try:
        race_drivers = db.query(models.Race_Results).filter(
            models.Race_Results.season == request.season,
            models.Race_Results.round == request.round
        ).all()

        if not race_drivers:
            raise HTTPException(status_code=404, detail="No drivers found for this race")

        race_name = race_drivers[0].race_name

        # Statistical fallback when model unavailable
        if model is None:
            return _statistical_podium_fallback(
                request.season, request.round, race_name, race_drivers, db
            )

        # Resolve circuit once (outside driver loop)
        circuit = _resolve_circuit(race_name, db)
        circuit_id = circuit.id if circuit else 0

        predictions = []

        for race_driver in race_drivers:
            driver = _resolve_driver(race_driver.driver_ref, db)
            constructor = _resolve_constructor(race_driver.constructor_ref, db)

            if not driver:
                continue

            features_dict = build_driver_features(
                driver_id=driver.id,
                grid_position=float(race_driver.grid if race_driver.grid else 20),
                circuit_id=circuit_id,
                season=request.season,
                constructor_ref=race_driver.constructor_ref,
                db=db
            )

            if not features_dict:
                continue

            try:
                X = np.array([[features_dict.get(col, 0) for col in features_cols]])
                X_scaled = scaler.transform(X)
                predicted_position = float(model.predict(X_scaled)[0])
                predicted_position = max(1, min(20, predicted_position))

                confidence = calculate_confidence_score(
                    predicted_position,
                    features_dict['driver_form_index'],
                    features_dict['constructor_reliability']
                )

                predictions.append({
                    'driver_id': driver.id,
                    'driver_name': f"{driver.given_name} {driver.family_name}",
                    'constructor': constructor.name if constructor else race_driver.constructor_ref.replace('_', ' ').title(),
                    'predicted_position': predicted_position,
                    'confidence': confidence,
                    'form_index': features_dict['driver_form_index']
                })
            except Exception as e:
                logger.warning(f"Skipping {race_driver.driver_ref} during prediction: {e}")
                continue

        if not predictions:
            # All drivers failed ML prediction — fall back to stats
            return _statistical_podium_fallback(
                request.season, request.round, race_name, race_drivers, db
            )

        predictions.sort(key=lambda x: x['predicted_position'])
        podium = predictions[:3]

        podium_predictions = [
            PodiumPrediction(
                position=i + 1,
                driver_id=p['driver_id'],
                driver_name=p['driver_name'],
                constructor=p['constructor'],
                predicted_finish_position=round(p['predicted_position'], 2),
                confidence_score=round(p['confidence'], 1),
                form_index=round(p['form_index'], 1)
            )
            for i, p in enumerate(podium)
        ]

        overall_confidence = round(float(np.mean([p.confidence_score for p in podium_predictions])), 1)

        return RacePredictionResponse(
            season=request.season,
            round=request.round,
            circuit_name=race_name,
            podium=podium_predictions,
            overall_confidence=overall_confidence,
            generated_at=datetime.utcnow().isoformat() + "Z"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/overtake", response_model=OvertakePredictionResponse)
async def predict_overtakes(request: RaceRequest, db: Session = Depends(get_db)):
    """
    Predict overtake probabilities for all drivers in a race.
    """
    model, scaler, features_cols = load_model()
    
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model not loaded. Please run train_model.py first."
        )
    
    try:
        race_drivers = db.query(models.Race_Results).filter(
            models.Race_Results.season == request.season,
            models.Race_Results.round == request.round
        ).all()

        if not race_drivers:
            raise HTTPException(status_code=404, detail="Race not found")

        race_name = race_drivers[0].race_name
        circuit = _resolve_circuit(race_name, db)
        circuit_id = circuit.id if circuit else 0

        overtake_predictions = []

        for race_driver in race_drivers:
            driver = _resolve_driver(race_driver.driver_ref, db)

            if not driver or not race_driver.grid:
                continue

            features_dict = build_driver_features(
                driver_id=driver.id,
                grid_position=float(race_driver.grid),
                circuit_id=circuit_id,
                season=request.season,
                constructor_ref=race_driver.constructor_ref,
                db=db
            )
            
            if not features_dict:
                continue
            
            X = np.array([[features_dict.get(col, 0) for col in features_cols]])
            X_scaled = scaler.transform(X)
            predicted_position = float(model.predict(X_scaled)[0])
            
            # Calculate position gain
            grid_pos = float(race_driver.grid)
            positions_gained = grid_pos - min(20, max(1, predicted_position))
            
            # Overtake probability based on grid position and form
            base_probability = (features_dict['driver_overtake_ability'] * 10 + 50)
            form_boost = (features_dict['driver_form_index'] / 100) * 20
            overtake_prob = min(100, base_probability + form_boost)
            
            overtake_predictions.append(OvertakeProbability(
                driver_id=driver.id,
                driver_name=f"{driver.given_name} {driver.family_name}",
                grid_position=int(grid_pos),
                predicted_positions_gained=round(max(0, positions_gained), 1),
                overtake_probability=round(overtake_prob, 1),
                expected_finish_position=round(predicted_position, 1)
            ))
        
        return OvertakePredictionResponse(
            season=request.season,
            round=request.round,
            predictions=sorted(overtake_predictions, key=lambda x: x.overtake_probability, reverse=True),
            generated_at=datetime.utcnow().isoformat() + "Z"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Overtake prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/win-probabilities")
async def get_win_probabilities(season: int, round: int, db: Session = Depends(get_db)):
    """Return win/podium probabilities for all drivers in a given race."""

    # Fetch all results for the requested race
    race_results = db.query(models.Race_Results).filter(
        models.Race_Results.season == season,
        models.Race_Results.round == round
    ).order_by(models.Race_Results.position).all()

    if not race_results:
        raise HTTPException(status_code=404, detail="No race data found for this season/round")

    race_name = race_results[0].race_name

    # Try to use ML model; fall back to statistical estimation if unavailable
    model, scaler, features_cols = load_model()
    use_model = model is not None and scaler is not None and features_cols is not None

    driver_scores: list[dict] = []

    for result in race_results:
        driver_obj = _resolve_driver(result.driver_ref, db)
        constructor_obj = _resolve_constructor(result.constructor_ref, db)

        full_name = (
            f"{driver_obj.given_name} {driver_obj.family_name}"
            if driver_obj
            else result.driver_ref.split("_")[-1].title()
        )
        driver_code = result.driver_ref.upper()[:3]
        team = constructor_obj.name if constructor_obj else result.constructor_ref.replace("_", " ").title()
        rating = float(driver_obj.rating) if driver_obj else 50.0

        if use_model and driver_obj:
            # Build feature vector using the shared helper
            features_dict = build_driver_features(
                driver_id=driver_obj.id,
                grid_position=float(result.grid if result.grid else 10),
                circuit_id=0,  # No circuit lookup needed for probability estimation
                season=season,
                constructor_ref=result.constructor_ref,
                db=db,
            )

            if features_dict:
                X = np.array([[features_dict.get(col, 0) for col in features_cols]])
                X_scaled = scaler.transform(X)
                predicted_position = float(model.predict(X_scaled)[0])
                predicted_position = max(1.0, min(20.0, predicted_position))

                # Score is inverse of predicted finishing position; lower = better
                raw_score = 1.0 / predicted_position
                form_index = features_dict.get("driver_form_index", 50.0)
                confidence = calculate_confidence_score(
                    predicted_position,
                    form_index,
                    features_dict.get("constructor_reliability", 0.8),
                )
            else:
                raw_score = 1.0 / 15.0
                confidence = 50.0
        else:
            # --- Statistical fallback ---
            # Count wins and podiums for this driver in the requested season up to this round
            season_results = db.query(models.Race_Results).filter(
                models.Race_Results.driver_ref == result.driver_ref,
                models.Race_Results.season == season,
                models.Race_Results.round <= round,
            ).all()

            total_races = len(season_results) if season_results else 1
            wins = sum(1 for r in season_results if r.position == 1)
            podiums = sum(1 for r in season_results if r.position and r.position <= 3)

            win_rate = wins / total_races
            podium_rate = podiums / total_races

            # Blend win rate with normalised driver rating so drivers with no
            # wins still have a meaningful differentiated score
            rating_score = rating / 100.0
            raw_score = win_rate * 0.6 + rating_score * 0.4
            confidence = round(
                (podium_rate * 0.5 + rating_score * 0.5) * 100, 1
            )

        driver_scores.append({
            "driver_code": driver_code,
            "driver_name": full_name,
            "team": team,
            "raw_score": raw_score,
            "confidence": round(confidence, 1),
        })

    # Normalise raw scores so win probabilities sum to 1.0
    total_score = sum(d["raw_score"] for d in driver_scores) or 1.0

    # For podium probability we use a softer exponent so mid-field drivers still
    # get a realistic share (cube-root of win_probability scaled up).
    probabilities = []
    for d in driver_scores:
        win_prob = round(d["raw_score"] / total_score, 4)
        # Podium probability: sum of top-3 individual win probabilities approximated
        # per driver as a boosted version of their win probability
        podium_prob = round(min(1.0, win_prob ** (1 / 2.5) * 1.8), 4)
        probabilities.append({
            "driver_code": d["driver_code"],
            "driver_name": d["driver_name"],
            "team": d["team"],
            "win_probability": win_prob,
            "podium_probability": podium_prob,
            "confidence": d["confidence"],
        })

    # Sort by descending win probability
    probabilities.sort(key=lambda x: x["win_probability"], reverse=True)

    return {
        "season": season,
        "round": round,
        "race_name": race_name,
        "probabilities": probabilities,
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }
