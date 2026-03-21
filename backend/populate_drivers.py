"""
Script to populate driver numbers and teams from JSON files
"""
import os
import json
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set")
    exit(1)

# Load drivers.json to get driver numbers
with open("../drivers.json") as f:
    drivers_data = json.load(f)

# Create a mapping of driver names to numbers
driver_name_to_number = {}
for driver in drivers_data:
    full_name = f"{driver['givenName']} {driver['familyName']}"
    driver_name_to_number[full_name] = driver.get("permanentNumber")

print(f"Loaded {len(driver_name_to_number)} drivers from JSON")

engine = create_engine(DATABASE_URL)

# Update drivers with their numbers
try:
    with engine.connect() as connection:
        for driver in drivers_data:
            given_name = driver.get("givenName")
            family_name = driver.get("familyName")
            number = driver.get("permanentNumber")
            
            # Update the driver with their number
            update_sql = text("""
                UPDATE drivers 
                SET number = :number
                WHERE given_name = :given_name AND family_name = :family_name
            """)
            
            connection.execute(update_sql, {
                "number": int(number) if number else None,
                "given_name": given_name,
                "family_name": family_name
            })
        
        connection.commit()
        print(f"✓ Updated driver numbers from JSON")
        
except Exception as e:
    print(f"✗ Failed to update driver numbers: {e}")
    exit(1)

# For teams, we'd need to map drivers to their current team
# This is a placeholder - you may need to create a drivers_teams table or similar
# For now, we can set default teams or handle this separately

print("✓ Driver population complete")
