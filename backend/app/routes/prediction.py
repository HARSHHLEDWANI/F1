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


@router.post("/podium", response_model=RacePredictionResponse)
async def predict_podium(request: RaceRequest, db: Session = Depends(get_db)):
    """
    Predict the podium for a given season and round.
    
    Returns top 3 drivers with lowest predicted finishing positions.
    """
    model, scaler, features_cols = load_model()
    
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model not loaded. Please run train_model.py first."
        )
    
    try:
        # Get all drivers participating in this race
        race_drivers = db.query(models.Race_Results).filter(
            models.Race_Results.season == request.season,
            models.Race_Results.round == request.round
        ).all()
        
        if not race_drivers:
            raise HTTPException(status_code=404, detail="No drivers found for this race")
        
        # Get race name from the first driver result
        race_name = race_drivers[0].race_name
        
        predictions = []
        
        for race_driver in race_drivers:
            # Find driver by matching family name with driver_ref
            # Extract family name from driver_ref (last part after underscore)
            driver_family_name = race_driver.driver_ref.split('_')[-1].title()
            # Handle special cases for accented names
            driver_name_map = {
                'Perez': 'Pérez',
                'Hulkenberg': 'Hülkenberg',
            }
            if driver_family_name in driver_name_map:
                driver_family_name = driver_name_map[driver_family_name]
            
            driver = db.query(models.Driver).filter(
                models.Driver.family_name == driver_family_name
            ).first()
            
            # Find constructor by matching name with constructor_ref
            constructor_ref_clean = race_driver.constructor_ref.replace('_', ' ').title()
            constructor = db.query(models.Team).filter(
                models.Team.name.ilike(f'%{constructor_ref_clean}%')
            ).first()
            
            if not driver or not constructor:
                continue
            
            # Find circuit by name (try multiple variations)
            circuit_name_search = race_name.replace(' Grand Prix', '')
            circuit = db.query(models.Circuit).filter(
                models.Circuit.name.ilike(f'%{circuit_name_search}%')
            ).first()
            
            if not circuit:
                continue
            
            # Build features
            features_dict = build_driver_features(
                driver_id=driver.id,
                grid_position=float(race_driver.grid if race_driver.grid else 20),
                circuit_id=circuit.id,
                season=request.season,
                constructor_ref=race_driver.constructor_ref,
                db=db
            )
            
            if not features_dict:
                continue
            
            try:
                # Create feature vector in correct order
                X = np.array([[features_dict.get(col, 0) for col in features_cols]])
                X_scaled = scaler.transform(X)
                
                # Predict
                predicted_position = float(model.predict(X_scaled)[0])
                predicted_position = max(1, min(20, predicted_position))  # Clamp 1-20
                
                confidence = calculate_confidence_score(
                    predicted_position,
                    features_dict['driver_form_index'],
                    features_dict['constructor_reliability']
                )
                
                predictions.append({
                    'driver_id': driver.id,
                    'driver_name': f"{driver.given_name} {driver.family_name}",
                    'constructor': constructor.name,
                    'predicted_position': predicted_position,
                    'confidence': confidence,
                    'form_index': features_dict['driver_form_index']
                })
            except Exception as e:
                print(f"Error predicting for {driver.family_name}: {e}")
                continue
        
        # Sort by predicted position and get top 3
        predictions.sort(key=lambda x: x['predicted_position'])
        podium = predictions[:3]
        
        # Create response
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
        
        overall_confidence = round(np.mean([p.confidence_score for p in podium_predictions]), 1)
        
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
        # Get race
        race = db.query(models.Race).filter(
            models.Race.season == request.season,
            models.Race.round == request.round
        ).first()
        
        if not race:
            raise HTTPException(status_code=404, detail="Race not found")
        
        race_drivers = db.query(models.Race_Results).filter(
            models.Race_Results.season == request.season,
            models.Race_Results.round == request.round
        ).all()
        
        overtake_predictions = []
        
        for race_driver in race_drivers:
            driver = db.query(models.Driver).filter(
                models.Driver.id == race_driver.driver_id
            ).first()
            
            if not driver or not race_driver.grid:
                continue
            
            features_dict = build_driver_features(
                driver_id=driver.id,
                grid_position=float(race_driver.grid),
                circuit_id=race.circuit_id,
                season=request.season,
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
