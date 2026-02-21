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