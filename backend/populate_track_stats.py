"""
Populate circuit statistics by matching circuit names
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set")
    exit(1)

# F1 tracks with data
track_data = [
    ("Bahrain International Circuit", 5.412, 57, "1:31.447", "Lewis Hamilton", 2020, "Permanent Circuit", 3, 45),
    ("Jeddah Corniche Circuit", 6.174, 50, "1:27.145", "Charles Leclerc", 2022, "Street Circuit", 4, 65),
    ("Albert Park Grand Prix Circuit", 5.303, 58, "1:27.657", "Lewis Hamilton", 2017, "Permanent Circuit", 2, 55),
    ("Suzuka", 5.807, 53, "1:30.983", "Sebastian Vettel", 2019, "Permanent Circuit", 2, 60),
    ("Shanghai International Circuit", 5.451, 56, "1:32.238", "Lewis Hamilton", 2022, "Permanent Circuit", 3, 50),
    ("Circuit de Monaco", 3.337, 78, "1:14.260", "Lewis Hamilton", 2019, "Street Circuit", 1, 90),
    ("Circuit Gilles Villeneuve", 4.361, 70, "1:13.622", "Lewis Hamilton", 2017, "Street Circuit", 3, 55),
    ("Baku City Circuit", 6.003, 51, "1:45.047", "Charles Leclerc", 2018, "Street Circuit", 3, 70),
    ("Circuit de Barcelona-Catalunya", 4.657, 66, "1:18.149", "Lewis Hamilton", 2022, "Permanent Circuit", 3, 55),
    ("Red Bull Ring", 4.318, 71, "1:05.619", "Max Verstappen", 2023, "Permanent Circuit", 3, 50),
    ("Silverstone Circuit", 5.891, 52, "1:27.369", "Lewis Hamilton", 2020, "Permanent Circuit", 4, 60),
    ("Hungaroring", 4.381, 70, "1:16.627", "Lewis Hamilton", 2020, "Permanent Circuit", 1, 70),
    ("Circuit de Spa", 7.004, 44, "1:46.286", "Lewis Hamilton", 2020, "Permanent Circuit", 3, 65),
    ("Circuit Zandvoort", 4.259, 72, "1:11.097", "Max Verstappen", 2022, "Permanent Circuit", 4, 50),
    ("Monza", 5.793, 53, "1:21.046", "Lewis Hamilton", 2020, "Permanent Circuit", 1, 45),
    ("Marina Bay Street Circuit", 5.065, 62, "1:41.905", "Sebastian Vettel", 2019, "Street Circuit", 4, 85),
    ("Autodromo Hermanos Rodriguez", 4.304, 71, "1:17.774", "Lewis Hamilton", 2017, "Permanent Circuit", 3, 50),
    ("Autodromo Jose Carlos Pace", 4.309, 71, "1:10.540", "Juan Pablo Montoya", 2004, "Permanent Circuit", 3, 75),
    ("Circuit of The Americas", 5.513, 56, "1:36.169", "Charles Leclerc", 2022, "Permanent Circuit", 4, 55),
    ("Las Vegas Street Circuit", 6.12, 50, "1:34.565", "Lewis Hamilton", 2023, "Street Circuit", 3, 60),
]

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        updated_count = 0
        
        for circuit_name, lap_dist, laps, lap_rec_time, lap_rec_hold, lap_rec_year, track_type, drs, difficulty in track_data:
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
                WHERE name = :circuit_name
            """)
            
            result = connection.execute(update_sql, {
                "circuit_name": circuit_name,
                "lap_distance": lap_dist,
                "laps": laps,
                "lap_record_time": lap_rec_time,
                "lap_record_holder": lap_rec_hold,
                "lap_record_year": lap_rec_year,
                "track_type": track_type,
                "drs_zones": drs,
                "difficulty": difficulty
            })
            
            if result.rowcount > 0:
                updated_count += 1
                print(f"✓ {circuit_name:<35} (Difficulty: {difficulty}/100)")
        
        connection.commit()
        print(f"\n✓ Updated {updated_count} circuits with statistics")
        
except Exception as e:
    print(f"✗ Failed to update circuits: {e}")
    exit(1)
