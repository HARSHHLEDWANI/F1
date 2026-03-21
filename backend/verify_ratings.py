"""
Verify driver ratings in database
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        result = connection.execute(text("""
            SELECT given_name, family_name, number, team, wins, podiums, rating
            FROM drivers
            ORDER BY rating DESC
            LIMIT 10
        """))
        
        print("=" * 80)
        print("TOP 10 DRIVERS BY PERFORMANCE RATING")
        print("=" * 80)
        print(f"{'Name':<25} | {'#':<3} | {'Team':<20} | {'W':<3} | {'P':<3} | {'Rating':<8}")
        print("-" * 80)
        
        for row in result:
            name = f"{row[0]} {row[1]}"
            print(f"{name:<25} | {str(row[2]) or 'N/A':<3} | {(row[3] or 'TBA'):<20} | {row[4]:<3} | {row[5]:<3} | {row[6]:>3}%")
        
except Exception as e:
    print(f"Error: {e}")
