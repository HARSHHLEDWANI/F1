"""
Script to assign teams to drivers based on 2025 F1 grid
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set")
    exit(1)

# 2025 F1 Driver-Team assignments
driver_team_mapping = {
    ("Lewis", "Hamilton"): "Mercedes",
    ("George", "Russell"): "Mercedes",
    ("Fernando", "Alonso"): "Aston Martin",
    ("Lance", "Stroll"): "Aston Martin",
    ("Max", "Verstappen"): "Red Bull",
    ("Sergio", "Perez"): "Red Bull",
    ("Lando", "Norris"): "McLaren",
    ("Oscar", "Piastri"): "McLaren",
    ("Charles", "Leclerc"): "Ferrari",
    ("Carlos", "Sainz"): "Ferrari",
    ("Alexander", "Albon"): "Williams",
    ("Franco", "Colapinto"): "Williams",
    ("Pierre", "Gasly"): "Alpine",
    ("Esteban", "Ocon"): "Alpine",
    ("Nico", "Hulkenberg"): "Haas",
    ("Kevin", "Magnussen"): "Haas",
    ("Yuki", "Tsunoda"): "RB",
    ("Liam", "Lawson"): "RB",
    ("Andrea Kimi", "Antonelli"): "Sauber",
    (" Zhou", "Guanyu"): "Sauber",
}

engine = create_engine(DATABASE_URL)

updated_count = 0
try:
    with engine.connect() as connection:
        for (first_name, last_name), team in driver_team_mapping.items():
            update_sql = text("""
                UPDATE drivers 
                SET team = :team
                WHERE given_name = :given_name AND family_name = :family_name
            """)
            
            result = connection.execute(update_sql, {
                "team": team,
                "given_name": first_name,
                "family_name": last_name
            })
            
            if result.rowcount > 0:
                updated_count += 1
        
        connection.commit()
        print(f"✓ Successfully assigned teams to {updated_count} drivers")
        
except Exception as e:
    print(f"✗ Failed to assign teams: {e}")
    exit(1)
