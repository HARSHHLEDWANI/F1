"""
Migration script to add circuit/track statistics columns
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set")
    exit(1)

engine = create_engine(DATABASE_URL)

# SQL to add missing columns to circuits table
migration_sql = """
ALTER TABLE circuits
ADD COLUMN IF NOT EXISTS lap_distance FLOAT,
ADD COLUMN IF NOT EXISTS laps INTEGER,
ADD COLUMN IF NOT EXISTS lap_record_time VARCHAR,
ADD COLUMN IF NOT EXISTS lap_record_holder VARCHAR,
ADD COLUMN IF NOT EXISTS lap_record_year INTEGER,
ADD COLUMN IF NOT EXISTS track_type VARCHAR,
ADD COLUMN IF NOT EXISTS drs_zones INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url VARCHAR,
ADD COLUMN IF NOT EXISTS difficulty INTEGER DEFAULT 50;
"""

try:
    with engine.connect() as connection:
        connection.execute(text(migration_sql))
        connection.commit()
        print("✓ Successfully migrated circuits table")
except Exception as e:
    print(f"✗ Migration failed: {e}")
    exit(1)
