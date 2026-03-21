"""
Populate circuit/track statistics with real F1 data
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set")
    exit(1)

# Current active F1 tracks (2025) with statistics
track_data = {
    "bahrain": {
        "lap_distance": 5.412,
        "laps": 57,
        "lap_record_time": "1:31.447",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2020,
        "track_type": "Permanent Circuit",
        "drs_zones": 3,
        "difficulty": 45
    },
    "saudi_arabia": {
        "lap_distance": 6.174,
        "laps": 50,
        "lap_record_time": "1:27.145",
        "lap_record_holder": "Charles Leclerc",
        "lap_record_year": 2022,
        "track_type": "Street Circuit",
        "drs_zones": 4,
        "difficulty": 65
    },
    "australia": {
        "lap_distance": 5.303,
        "laps": 58,
        "lap_record_time": "1:27.657",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2017,
        "track_type": "Permanent Circuit",
        "drs_zones": 2,
        "difficulty": 55
    },
    "japan": {
        "lap_distance": 5.807,
        "laps": 53,
        "lap_record_time": "1:30.983",
        "lap_record_holder": "Sebastian Vettel",
        "lap_record_year": 2019,
        "track_type": "Permanent Circuit",
        "drs_zones": 2,
        "difficulty": 60
    },
    "china": {
        "lap_distance": 5.451,
        "laps": 56,
        "lap_record_time": "1:32.238",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2022,
        "track_type": "Permanent Circuit",
        "drs_zones": 3,
        "difficulty": 50
    },
    "monaco": {
        "lap_distance": 3.337,
        "laps": 78,
        "lap_record_time": "1:14.260",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2019,
        "track_type": "Street Circuit",
        "drs_zones": 1,
        "difficulty": 90
    },
    "canada": {
        "lap_distance": 4.361,
        "laps": 70,
        "lap_record_time": "1:13.622",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2017,
        "track_type": "Street Circuit",
        "drs_zones": 3,
        "difficulty": 55
    },
    "azerbaijan": {
        "lap_distance": 6.003,
        "laps": 51,
        "lap_record_time": "1:45.047",
        "lap_record_holder": "Charles Leclerc",
        "lap_record_year": 2018,
        "track_type": "Street Circuit",
        "drs_zones": 3,
        "difficulty": 70
    },
    "spain": {
        "lap_distance": 4.657,
        "laps": 66,
        "lap_record_time": "1:18.149",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2022,
        "track_type": "Permanent Circuit",
        "drs_zones": 3,
        "difficulty": 55
    },
    "austria": {
        "lap_distance": 4.318,
        "laps": 71,
        "lap_record_time": "1:05.619",
        "lap_record_holder": "Max Verstappen",
        "lap_record_year": 2023,
        "track_type": "Permanent Circuit",
        "drs_zones": 3,
        "difficulty": 50
    },
    "united_kingdom": {
        "lap_distance": 5.891,
        "laps": 52,
        "lap_record_time": "1:27.369",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2020,
        "track_type": "Permanent Circuit",
        "drs_zones": 4,
        "difficulty": 60
    },
    "hungary": {
        "lap_distance": 4.381,
        "laps": 70,
        "lap_record_time": "1:16.627",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2020,
        "track_type": "Permanent Circuit",
        "drs_zones": 1,
        "difficulty": 70
    },
    "belgium": {
        "lap_distance": 7.004,
        "laps": 44,
        "lap_record_time": "1:46.286",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2020,
        "track_type": "Permanent Circuit",
        "drs_zones": 3,
        "difficulty": 65
    },
    "netherlands": {
        "lap_distance": 4.259,
        "laps": 72,
        "lap_record_time": "1:11.097",
        "lap_record_holder": "Max Verstappen",
        "lap_record_year": 2022,
        "track_type": "Permanent Circuit",
        "drs_zones": 4,
        "difficulty": 50
    },
    "italy": {
        "lap_distance": 5.793,
        "laps": 53,
        "lap_record_time": "1:21.046",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2020,
        "track_type": "Permanent Circuit",
        "drs_zones": 1,
        "difficulty": 45
    },
    "singapore": {
        "lap_distance": 5.065,
        "laps": 62,
        "lap_record_time": "1:41.905",
        "lap_record_holder": "Sebastian Vettel",
        "lap_record_year": 2019,
        "track_type": "Street Circuit",
        "drs_zones": 4,
        "difficulty": 85
    },
    "mexico": {
        "lap_distance": 4.304,
        "laps": 71,
        "lap_record_time": "1:17.774",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2017,
        "track_type": "Permanent Circuit",
        "drs_zones": 3,
        "difficulty": 50
    },
    "brazil": {
        "lap_distance": 4.309,
        "laps": 71,
        "lap_record_time": "1:10.540",
        "lap_record_holder": "Juan Pablo Montoya",
        "lap_record_year": 2004,
        "track_type": "Permanent Circuit",
        "drs_zones": 3,
        "difficulty": 75
    },
    "usa": {
        "lap_distance": 5.513,
        "laps": 56,
        "lap_record_time": "1:36.169",
        "lap_record_holder": "Charles Leclerc",
        "lap_record_year": 2022,
        "track_type": "Permanent Circuit",
        "drs_zones": 4,
        "difficulty": 55
    },
    "las_vegas": {
        "lap_distance": 6.12,
        "laps": 50,
        "lap_record_time": "1:34.565",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2023,
        "track_type": "Street Circuit",
        "drs_zones": 3,
        "difficulty": 60
    },
}

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        updated_count = 0
        
        for circuit_ref, data in track_data.items():
            update_sql = text("""
                UPDATE circuits
                SET
                    lap_distance = :lap_distance,
                    laps = :laps,
                    lap_record_time = :lap_record_time,
                    lap_record_holder = :lap_record_holder,
                    lap_record_year = :lap_record_year,
                    track_type = :track_type,
                    drs_zones = :drs_zones,
                    difficulty = :difficulty
                WHERE circuit_ref = :circuit_ref
            """)
            
            result = connection.execute(update_sql, {
                "circuit_ref": circuit_ref,
                "lap_distance": data["lap_distance"],
                "laps": data["laps"],
                "lap_record_time": data["lap_record_time"],
                "lap_record_holder": data["lap_record_holder"],
                "lap_record_year": data["lap_record_year"],
                "track_type": data["track_type"],
                "drs_zones": data["drs_zones"],
                "difficulty": data["difficulty"]
            })
            
            if result.rowcount > 0:
                updated_count += 1
                print(f"✓ {data['track_type']:<20} {circuit_ref:<20} (Difficulty: {data['difficulty']}/100)")
        
        connection.commit()
        print(f"\n✓ Updated {updated_count} circuits with statistics")
        
except Exception as e:
    print(f"✗ Failed to update circuits: {e}")
    exit(1)
