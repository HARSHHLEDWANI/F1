"""
Migration script to add missing columns to drivers table
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

# SQL to add missing columns to drivers table
migration_sql = """
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS number INTEGER,
ADD COLUMN IF NOT EXISTS team VARCHAR,
ADD COLUMN IF NOT EXISTS championships INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS podiums INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS poles INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0;
"""

try:
    with engine.connect() as connection:
        connection.execute(text(migration_sql))
        connection.commit()
        print("✓ Successfully migrated drivers table")
except Exception as e:
    print(f"✗ Migration failed: {e}")
    exit(1)
