from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    is_pro: bool

    class Config:
        from_attributes = True

class Driver(BaseModel):
    id: int
    given_name: str
    family_name: str
    nationality: str
    image_url: Optional[str] = None
    number: Optional[int] = None
    team: Optional[str] = None
    championships: int = 0
    wins: int = 0
    podiums: int = 0
    poles: int = 0
    points_total: int = 0
    rating: int = 0

    class Config:
        from_attributes = True


class Team(BaseModel):
    id: int
    name: str
    nationality: str

    class Config:
        from_attributes = True

class Circuit(BaseModel):
    id: int
    circuit_ref: Optional[str] = None
    name: str
    locality: str
    country: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    lap_distance: Optional[float] = None
    laps: Optional[int] = None
    lap_record_time: Optional[str] = None
    lap_record_holder: Optional[str] = None
    lap_record_year: Optional[int] = None
    track_type: Optional[str] = None
    drs_zones: int = 0


# ML Prediction Schemas
class Race(BaseModel):
    """Race information for prediction selection."""
    id: int
    season: int
    round: int
    race_name: str
    
    class Config:
        from_attributes = True


class RaceRequest(BaseModel):
    """Request for race prediction."""
    season: int
    round: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "season": 2026,
                "round": 5
            }
        }


class PodiumPrediction(BaseModel):
    """Predicted podium position."""
    position: int  # 1, 2, or 3
    driver_id: int
    driver_name: str
    constructor: str
    predicted_finish_position: float
    confidence_score: float  # 0-100
    form_index: float  # 0-100
    
    class Config:
        json_schema_extra = {
            "example": {
                "position": 1,
                "driver_id": 1,
                "driver_name": "Max Verstappen",
                "constructor": "Red Bull",
                "predicted_finish_position": 1.2,
                "confidence_score": 92.5,
                "form_index": 98.0
            }
        }


class RacePredictionResponse(BaseModel):
    """Complete race prediction response."""
    season: int
    round: int
    circuit_name: str
    podium: List[PodiumPrediction]
    overall_confidence: float
    generated_at: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "season": 2026,
                "round": 5,
                "circuit_name": "Monaco",
                "podium": [],
                "overall_confidence": 85.0,
                "generated_at": "2026-03-20T10:30:00Z"
            }
        }


class OvertakeProbability(BaseModel):
    """Overtake probability prediction."""
    driver_id: int
    driver_name: str
    grid_position: int
    predicted_positions_gained: float
    overtake_probability: float  # 0-100
    expected_finish_position: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "driver_id": 1,
                "driver_name": "Max Verstappen",
                "grid_position": 2,
                "predicted_positions_gained": 1.5,
                "overtake_probability": 87.5,
                "expected_finish_position": 0.5
            }
        }


class OvertakePredictionResponse(BaseModel):
    """Overtake prediction for all drivers."""
    season: int
    round: int
    predictions: List[OvertakeProbability]
    generated_at: str
    image_url: Optional[str] = None
    difficulty: int = 50

    class Config:
        from_attributes = True


class PredictionCreate(BaseModel):
    season: int
    round: int
    predicted_p1: str
    predicted_p2: str
    predicted_p3: str

class UpdatePreferences(BaseModel):
    favorite_team: Optional[str] = None
    favorite_driver: Optional[str] = None