"""
Populate comprehensive track/circuit statistics from the database of F1 circuits
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# Comprehensive F1 circuit data with real statistics
circuits_data = [
    # Current/Recent F1 Circuits (2024-2026)
    {
        "name": "Bahrain International Circuit",
        "lap_distance": 5.412,
        "laps": 57,
        "lap_record_time": "1:31.447",
        "lap_record_holder": "George Russell",
        "lap_record_year": 2024,
        "track_type": "Semi-permanent street circuit",
        "drs_zones": 3,
        "difficulty": 45,
    },
    {
        "name": "Albert Park Grand Prix Circuit",
        "lap_distance": 5.303,
        "laps": 58,
        "lap_record_time": "1:24.125",
        "lap_record_holder": "Charles Leclerc",
        "lap_record_year": 2024,
        "track_type": "Street circuit",
        "drs_zones": 3,
        "difficulty": 55,
    },
    {
        "name": "Baku City Circuit",
        "lap_distance": 6.003,
        "laps": 51,
        "lap_record_time": "1:43.409",
        "lap_record_holder": "Charles Leclerc",
        "lap_record_year": 2023,
        "track_type": "Street circuit",
        "drs_zones": 3,
        "difficulty": 70,
    },
    {
        "name": "Circuit de Barcelona-Catalunya",
        "lap_distance": 4.657,
        "laps": 66,
        "lap_record_time": "1:19.149",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2023,
        "track_type": "Permanent road course",
        "drs_zones": 2,
        "difficulty": 55,
    },
    {
        "name": "Hungaroring",
        "lap_distance": 4.381,
        "laps": 70,
        "lap_record_time": "1:17.108",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2023,
        "track_type": "Permanent road course",
        "drs_zones": 2,
        "difficulty": 70,
    },
    {
        "name": "Circuit de Monaco",
        "lap_distance": 3.337,
        "laps": 78,
        "lap_record_time": "1:14.260",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2023,
        "track_type": "Street circuit",
        "drs_zones": 0,
        "difficulty": 90,
    },
    {
        "name": "Autodromo Nazionale di Monza",
        "lap_distance": 5.793,
        "laps": 53,
        "lap_record_time": "1:21.046",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2023,
        "track_type": "Permanent road course",
        "drs_zones": 4,
        "difficulty": 35,
    },
    {
        "name": "Silverstone Circuit",
        "lap_distance": 5.891,
        "laps": 52,
        "lap_record_time": "1:27.097",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2023,
        "track_type": "Permanent road course",
        "drs_zones": 2,
        "difficulty": 40,
    },
    {
        "name": "Hockenheimring",
        "lap_distance": 5.137,
        "laps": 67,
        "lap_record_time": "1:18.622",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2023,
        "track_type": "Permanent road course",
        "drs_zones": 3,
        "difficulty": 45,
    },
    {
        "name": "Circuit de Spa-Francorchamps",
        "lap_distance": 7.004,
        "laps": 44,
        "lap_record_time": "1:46.286",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2023,
        "track_type": "Permanent road course",
        "drs_zones": 3,
        "difficulty": 60,
    },
    {
        "name": "Red Bull Ring",
        "lap_distance": 4.318,
        "laps": 71,
        "lap_record_time": "1:05.619",
        "lap_record_holder": "Max Verstappen",
        "lap_record_year": 2023,
        "track_type": "Permanent road course",
        "drs_zones": 3,
        "difficulty": 50,
    },
    {
        "name": "Suzuka Circuit",
        "lap_distance": 5.807,
        "laps": 53,
        "lap_record_time": "1:30.983",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2023,
        "track_type": "Permanent road course",
        "drs_zones": 1,
        "difficulty": 75,
    },
    {
        "name": "Marina Bay Street Circuit",
        "lap_distance": 5.065,
        "laps": 62,
        "lap_record_time": "1:41.905",
        "lap_record_holder": "George Russell",
        "lap_record_year": 2024,
        "track_type": "Street circuit",
        "drs_zones": 2,
        "difficulty": 85,
    },
    {
        "name": "Las Vegas Street Circuit",
        "lap_distance": 6.200,
        "laps": 50,
        "lap_record_time": "1:34.565",
        "lap_record_holder": "Charles Leclerc",
        "lap_record_year": 2024,
        "track_type": "Street circuit",
        "drs_zones": 4,
        "difficulty": 65,
    },
    {
        "name": "Circuit of the Americas",
        "lap_distance": 5.515,
        "laps": 56,
        "lap_record_time": "1:36.169",
        "lap_record_holder": "Max Verstappen",
        "lap_record_year": 2023,
        "track_type": "Permanent road course",
        "drs_zones": 2,
        "difficulty": 55,
    },
    {
        "name": "Mexico City Grand Prix",
        "lap_distance": 4.304,
        "laps": 71,
        "lap_record_time": "1:17.774",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2023,
        "track_type": "Permanent road course",
        "drs_zones": 1,
        "difficulty": 45,
    },
    {
        "name": "Autódromo José Carlos Pace",
        "lap_distance": 4.309,
        "laps": 71,
        "lap_record_time": "1:10.540",
        "lap_record_holder": "Juan Pablo Montoya",
        "lap_record_year": 2004,
        "track_type": "Permanent road course",
        "drs_zones": 2,
        "difficulty": 60,
    },
    {
        "name": "Yas Marina Circuit",
        "lap_distance": 5.281,
        "laps": 58,
        "lap_record_time": "1:26.103",
        "lap_record_holder": "Max Verstappen",
        "lap_record_year": 2023,
        "track_type": "Permanent road course",
        "drs_zones": 4,
        "difficulty": 50,
    },
    {
        "name": "Istanbul Park",
        "lap_distance": 5.338,
        "laps": 58,
        "lap_record_time": "1:24.769",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2020,
        "track_type": "Permanent road course",
        "drs_zones": 2,
        "difficulty": 65,
    },
    # Historic/Former F1 Circuits
    {
        "name": "Fuji Speedway",
        "lap_distance": 4.563,
        "laps": 67,
        "lap_record_time": "1:18.414",
        "lap_record_holder": "Giancarlo Fisichella",
        "lap_record_year": 2008,
        "track_type": "Permanent road course",
        "drs_zones": 2,
        "difficulty": 55,
    },
    {
        "name": "Autodromo Hermanos Rodríguez",
        "lap_distance": 4.304,
        "laps": 71,
        "lap_record_time": "1:17.774",
        "lap_record_holder": "Lewis Hamilton",
        "lap_record_year": 2023,
        "track_type": "Permanent road course",
        "drs_zones": 1,
        "difficulty": 50,
    },
    {
        "name": "Indianapolis Motor Speedway",
        "lap_distance": 4.192,
        "laps": 73,
        "lap_record_time": "1:10.097",
        "lap_record_holder": "Juan Pablo Montoya",
        "lap_record_year": 2005,
        "track_type": "Oval with road course",
        "drs_zones": 2,
        "difficulty": 40,
    },
    {
        "name": "Brands Hatch",
        "lap_distance": 3.544,
        "laps": 75,
        "lap_record_time": "1:18.868",
        "lap_record_holder": "Ayrton Senna",
        "lap_record_year": 1990,
        "track_type": "Permanent road course",
        "drs_zones": 1,
        "difficulty": 45,
    },
    {
        "name": "Donington Park",
        "lap_distance": 3.629,
        "laps": 78,
        "lap_record_time": "1:18.096",
        "lap_record_holder": "Jacques Villeneuve",
        "lap_record_year": 1997,
        "track_type": "Permanent road course",
        "drs_zones": 1,
        "difficulty": 50,
    },
    {
        "name": "Rouen-Les-Essarts",
        "lap_distance": 6.542,
        "laps": 38,
        "lap_record_time": "2:01.100",
        "lap_record_holder": "Graham Hill",
        "lap_record_year": 1966,
        "track_type": "Permanent road course",
        "drs_zones": 0,
        "difficulty": 55,
    },
    {
        "name": "Charade Circuit",
        "lap_distance": 8.055,
        "laps": 33,
        "lap_record_time": "2:39.600",
        "lap_record_holder": "Jackie Stewart",
        "lap_record_year": 1969,
        "track_type": "Permanent road course",
        "drs_zones": 0,
        "difficulty": 70,
    },
    {
        "name": "Detroit Street Circuit",
        "lap_distance": 4.023,
        "laps": 63,
        "lap_record_time": "1:40.217",
        "lap_record_holder": "Ayrton Senna",
        "lap_record_year": 1989,
        "track_type": "Street circuit",
        "drs_zones": 0,
        "difficulty": 60,
    },
    {
        "name": "Aintree",
        "lap_distance": 4.828,
        "laps": 45,
        "lap_record_time": "1:41.860",
        "lap_record_holder": "Jackie Stewart",
        "lap_record_year": 1971,
        "track_type": "Permanent road course",
        "drs_zones": 0,
        "difficulty": 50,
    },
    {
        "name": "Autódromo do Estoril",
        "lap_distance": 4.182,
        "laps": 67,
        "lap_record_time": "1:13.516",
        "lap_record_holder": "Jean Alesi",
        "lap_record_year": 1995,
        "track_type": "Permanent road course",
        "drs_zones": 1,
        "difficulty": 45,
    },
    {
        "name": "Autodromo Enzo e Dino Ferrari",
        "lap_distance": 4.959,
        "laps": 56,
        "lap_record_time": "1:21.747",
        "lap_record_holder": "Fernando Alonso",
        "lap_record_year": 2005,
        "track_type": "Permanent road course",
        "drs_zones": 2,
        "difficulty": 50,
    },
]

def main():
    """Populate circuit statistics"""
    with engine.begin() as connection:
        updated_count = 0
        not_found_count = 0
        
        for circuit_info in circuits_data:
            circuit_name = circuit_info["name"]
            
            # Check if circuit exists
            result = connection.execute(
                text("SELECT id FROM circuits WHERE name = :name"),
                {"name": circuit_name}
            )
            row = result.fetchone()
            
            if not row:
                print(f"✗ {circuit_name} (Not in database)")
                not_found_count += 1
                continue
            
            circuit_id = row[0]
            
            # Update circuit with statistics
            try:
                connection.execute(
                    text("""
                        UPDATE circuits 
                        SET lap_distance = :lap_distance,
                            laps = :laps,
                            lap_record_time = :lap_record_time,
                            lap_record_holder = :lap_record_holder,
                            lap_record_year = :lap_record_year,
                            track_type = :track_type,
                            drs_zones = :drs_zones,
                            difficulty = :difficulty
                        WHERE id = :id
                    """),
                    {
                        "lap_distance": circuit_info["lap_distance"],
                        "laps": circuit_info["laps"],
                        "lap_record_time": circuit_info["lap_record_time"],
                        "lap_record_holder": circuit_info["lap_record_holder"],
                        "lap_record_year": circuit_info["lap_record_year"],
                        "track_type": circuit_info["track_type"],
                        "drs_zones": circuit_info["drs_zones"],
                        "difficulty": circuit_info["difficulty"],
                        "id": circuit_id,
                    }
                )
                print(f"✓ {circuit_name} (Difficulty: {circuit_info['difficulty']}/100)")
                updated_count += 1
            except Exception as e:
                print(f"✗ {circuit_name} Error: {str(e)}")
        
        print(f"\n✓ Updated {updated_count} circuits with statistics")
        if not_found_count > 0:
            print(f"⚠ {not_found_count} circuits not found in database")

if __name__ == "__main__":
    main()
