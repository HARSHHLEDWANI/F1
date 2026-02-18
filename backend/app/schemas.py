from pydantic import BaseModel, EmailStr
from typing import Optional
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

    class Config:
        from_attributes = True


class PredictionCreate(BaseModel):
    season: int
    round: int
    predicted_p1: str
    predicted_p2: str
    predicted_p3: str