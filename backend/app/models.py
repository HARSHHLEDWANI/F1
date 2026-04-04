from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Boolean
)

from datetime import datetime, date

from app.database import Base
from sqlalchemy import Column, Integer, String, Date ,Float
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_pro = Column(Boolean, default=False)
    predictions_today = Column(Integer, default=0)
    last_prediction_date = Column(Date, default=date.today)
    plan = Column(String, default="FREE")
    favorite_team = Column(String, nullable=True)
    favorite_driver = Column(String, nullable=True)

class Race(Base):
    __tablename__ = "races"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    race_date = Column(Date, nullable=False)
    winner = Column(String)
    highlights = Column(String)

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    given_name = Column(String)
    family_name = Column(String)
    nationality = Column(String)
    image_url = Column(String, nullable=True)
    number = Column(Integer, nullable=True)
    team = Column(String, nullable=True)
    championships = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    podiums = Column(Integer, default=0)
    poles = Column(Integer, default=0)
    points_total = Column(Integer, default=0)
    rating = Column(Integer, default=0)


class Team(Base):
    __tablename__ = "constructors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    nationality = Column(String)


class Circuit(Base):
    __tablename__ = "circuits"

    id = Column(Integer, primary_key=True, index=True)
    circuit_ref = Column(String)
    name = Column(String)
    locality = Column(String)
    country = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    lap_distance = Column(Float, nullable=True)  # in km
    laps = Column(Integer, nullable=True)  # typical race distance
    lap_record_time = Column(String, nullable=True)
    lap_record_holder = Column(String, nullable=True)
    lap_record_year = Column(Integer, nullable=True)
    track_type = Column(String, nullable=True)  # street/permanent circuit
    drs_zones = Column(Integer, default=0)
    image_url = Column(String, nullable=True)
    difficulty = Column(Integer, default=50)  # 0-100 rating

class Race_Results(Base):
    __tablename__ = "race_results"

    id = Column(Integer, primary_key=True, index=True)
    season = Column(Integer, nullable=False)
    round = Column(Integer, nullable=False)
    race_name = Column(String, nullable=False)
    driver_ref = Column(String, nullable=False)
    constructor_ref = Column(String, nullable=False)
    grid = Column(Integer)
    position = Column(Integer)
    points = Column(Float, default=0)
    status = Column(String)
    laps = Column(Integer)
    time = Column(String, nullable=True)

class RaceSchedule(Base):
    """
    One row per race per season — stores schedule & circuit metadata.
    Populated on startup from Jolpica API; falls back to static data.
    """
    __tablename__ = "race_schedule"

    id = Column(Integer, primary_key=True, index=True)
    season = Column(Integer, nullable=False, index=True)
    round = Column(Integer, nullable=False)
    race_name = Column(String, nullable=False)
    date = Column(String, nullable=True)          # ISO date "YYYY-MM-DD"
    time = Column(String, nullable=True)          # UTC time "HH:MM:SSZ"
    circuit_id = Column(String, nullable=True)
    circuit_name = Column(String, nullable=True)
    locality = Column(String, nullable=True)
    country = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    season = Column(Integer, nullable=False)
    round = Column(Integer, nullable=False)

    predicted_p1 = Column(String(50))
    predicted_p2 = Column(String(50))
    predicted_p3 = Column(String(50))

    score = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)