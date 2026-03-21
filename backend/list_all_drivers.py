"""
Get all drivers from database to check current state
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT id, given_name, family_name, number, team FROM drivers ORDER BY id"))
        
        print(f"{'ID':<5} {'Given Name':<20} {'Family Name':<20} {'Number':<8} {'Team':<30}")
        print("-" * 85)
        for row in result:
            team_str = row[4] if row[4] else "Not assigned"
            print(f"{row[0]:<5} {(row[1] or ''):<20} {(row[2] or ''):<20} {str(row[3]) if row[3] else 'N/A':<8} {team_str:<30}")
        
except Exception as e:
    print(f"Error: {e}")
