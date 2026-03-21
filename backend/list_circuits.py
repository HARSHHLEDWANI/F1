"""
Check circuit references in database
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT id, circuit_ref, name, country FROM circuits LIMIT 20"))
        
        print("Current circuits in database:")
        print("-" * 80)
        for row in result:
            print(f"{row[0]:<3} | {(row[1] or 'N/A'):<20} | {row[2]:<30} | {row[3]}")
        
except Exception as e:
    print(f"Error: {e}")
