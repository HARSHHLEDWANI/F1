"""
Correct team assignments for 2025 F1 season based on actual driver names in database
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set")
    exit(1)

# Accurate 2025 F1 Driver-Team assignments based on the actual database names
driver_team_mapping = [
    ("Alexander", "Albon", "Williams"),
    ("Fernando", "Alonso", "Aston Martin"),
    ("Andrea Kimi", "Antonelli", "Sauber"),
    ("Oliver", "Bearman", "Ferrari"),  # Test driver/reserve
    ("Valtteri", "Bottas", "Sauber"),
    ("Franco", "Colapinto", "Williams"),
    ("Jack", "Doohan", "Alpine"),  # Replaced or reserve
    ("Pierre", "Gasly", "Alpine"),
    ("Lewis", "Hamilton", "Mercedes"),
    ("Nico", "Hülkenberg", "Haas"),
    ("Liam", "Lawson", "RB"),
    ("Charles", "Leclerc", "Ferrari"),
    ("Kevin", "Magnussen", "Haas"),
    ("Lando", "Norris", "McLaren"),
    ("Esteban", "Ocon", "Alpine"),
    ("Oscar", "Piastri", "McLaren"),
    ("Sergio", "Pérez", "Red Bull"),
    ("Daniel", "Ricciardo", "McLaren"),  # Test/reserve
    ("George", "Russell", "Mercedes"),
    ("Carlos", "Sainz", "Ferrari"),
    ("Logan", "Sargeant", "Williams"),  # Reserve/withdrawn
    ("Lance", "Stroll", "Aston Martin"),
    ("Yuki", "Tsunoda", "RB"),
    ("Max", "Verstappen", "Red Bull"),
    ("Guanyu", "Zhou", "Sauber"),
]

engine = create_engine(DATABASE_URL)

updated_count = 0
try:
    with engine.connect() as connection:
        for given_name, family_name, team in driver_team_mapping:
            update_sql = text("""
                UPDATE drivers 
                SET team = :team
                WHERE given_name = :given_name AND family_name = :family_name
            """)
            
            result = connection.execute(update_sql, {
                "team": team,
                "given_name": given_name,
                "family_name": family_name
            })
            
            if result.rowcount > 0:
                updated_count += 1
                print(f"✓ {given_name} {family_name} -> {team}")
        
        connection.commit()
        print(f"\n✓ Successfully assigned teams to {updated_count} drivers")
        
except Exception as e:
    print(f"✗ Failed to assign teams: {e}")
    exit(1)
