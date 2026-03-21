"""
Script to populate driver career statistics from Ergast API
Fetches wins, podiums, poles, and points for all drivers
"""
import os
import json
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import requests

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set")
    exit(1)

# Fetch all driver statistics from Ergast API
def fetch_driver_stats():
    """Fetch cumulative driver statistics from Ergast F1 API"""
    print("Fetching driver statistics from Ergast API...")
    
    stats_by_driver = {}
    
    try:
        # Fetch all seasons to get historical data
        for season in range(1950, 2026):
            url = f"https://api.jolpi.ca/ergast/f1/{season}/results.json?limit=1000"
            response = requests.get(url, timeout=10)
            
            if response.status_code != 200:
                continue
                
            data = response.json()
            races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
            
            for race in races:
                for result in race.get("Results", []):
                    driver_id = result["Driver"]["driverId"]
                    
                    if driver_id not in stats_by_driver:
                        stats_by_driver[driver_id] = {
                            "given_name": result["Driver"].get("givenName", ""),
                            "family_name": result["Driver"].get("familyName", ""),
                            "wins": 0,
                            "podiums": 0,
                            "poles": 0,
                            "points": 0,
                            "championships": 0
                        }
                    
                    # Count wins (position = 1)
                    position = result.get("position")
                    if position == "1":
                        stats_by_driver[driver_id]["wins"] += 1
                    
                    # Count podiums (position <= 3)
                    if position in ["1", "2", "3"]:
                        stats_by_driver[driver_id]["podiums"] += 1
                    
                    # Count pole positions (grid = 1)
                    grid = result.get("grid")
                    if grid == "1":
                        stats_by_driver[driver_id]["poles"] += 1
                    
                    # Add points
                    points = result.get("points", 0)
                    stats_by_driver[driver_id]["points"] += float(points) if points else 0
            
            print(f"  ✓ Processed season {season}")
    
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None
    
    return stats_by_driver

# Update database with statistics
def update_driver_stats(stats_by_driver):
    """Update drivers table with calculated statistics"""
    engine = create_engine(DATABASE_URL)
    
    updated = 0
    try:
        with engine.connect() as connection:
            for driver_id, stats in stats_by_driver.items():
                update_sql = text("""
                    UPDATE drivers 
                    SET 
                        wins = :wins,
                        podiums = :podiums,
                        poles = :poles,
                        points_total = :points
                    WHERE given_name = :given_name 
                    AND family_name = :family_name
                """)
                
                result = connection.execute(update_sql, {
                    "wins": stats["wins"],
                    "podiums": stats["podiums"],
                    "poles": stats["poles"],
                    "points": int(stats["points"]),
                    "given_name": stats["given_name"],
                    "family_name": stats["family_name"]
                })
                
                if result.rowcount > 0:
                    updated += 1
                    print(f"  ✓ {stats['given_name']} {stats['family_name']}: {stats['wins']}W {stats['podiums']}P {stats['poles']}PL")
            
            connection.commit()
    
    except Exception as e:
        print(f"✗ Failed to update driver stats: {e}")
        engine.dispose()
        return False
    
    engine.dispose()
    return True

if __name__ == "__main__":
    print("=" * 70)
    print("DRIVER STATISTICS POPULATION")
    print("=" * 70)
    
    stats = fetch_driver_stats()
    
    if stats:
        print(f"\n✓ Fetched statistics for {len(stats)} drivers")
        print("\nUpdating database...")
        if update_driver_stats(stats):
            print(f"\n✓ Successfully updated {len(stats)} drivers with career statistics")
        else:
            print("\n✗ Failed to update database")
    else:
        print("\n✗ Failed to fetch driver statistics")
