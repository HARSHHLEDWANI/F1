from sqlalchemy import Column, Integer, String, Boolean ,Date
from datetime import date
from .database import Base
from sqlalchemy import Column, Integer, String, Date
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_pro = Column(Boolean, default=False)
    predictions_today = Column(Integer, default=0)
    last_prediction_date = Column(Date, default=date.today)

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
    name = Column(String)
    location = Column(String)
    country = Column(String)