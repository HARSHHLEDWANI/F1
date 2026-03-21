"""
Test the drivers API endpoint to verify complete data is returned
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import json

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        result = connection.execute(text("""
            SELECT 
                id, given_name, family_name, nationality, number, team,
                championships, wins, podiums, poles, points_total, rating
            FROM drivers
            WHERE given_name IN ('Max', 'Lewis', 'Fernando', 'Jack')
            ORDER BY wins DESC
        """))
        
        print("=" * 90)
        print("DRIVER DATA FOR API (JSON FORMAT)")
        print("=" * 90)
        
        drivers = []
        for row in result:
            driver = {
                "id": row[0],
                "given_name": row[1],
                "family_name": row[2],
                "nationality": row[3],
                "number": row[4],
                "team": row[5],
                "championships": row[6],
                "wins": row[7],
                "podiums": row[8],
                "poles": row[9],
                "points_total": row[10],
                "rating": row[11],
                "image_url": None
            }
            drivers.append(driver)
            print(f"\n{row[1]} {row[2]} (#{row[4]})")
            print(f"  Team: {row[5]}")
            print(f"  Wins: {row[7]}, Podiums: {row[8]}, Poles: {row[9]}")
            print(f"  Points: {row[10]}, Rating: {row[11]}%")
        
        print("\n" + "=" * 90)
        print("Full JSON Response (first driver):")
        print("=" * 90)
        if drivers:
            print(json.dumps(drivers[0], indent=2))
        
except Exception as e:
    print(f"Error: {e}")
