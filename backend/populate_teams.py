"""
Populate F1 teams with their data (2026 season + historical driver count)
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# 2026 F1 Teams with data
teams_data = [
    {
        "name": "McLaren Racing",
        "country": "United Kingdom",
        "founded": 1963,
        "drivers_all_time": 168,
        "championships": 12,
        "color": "#FF8700",
        "car_name": "MCL36",
        "power_unit": "Mercedes",
        "current_drivers": 2,
    },
    {
        "name": "Ferrari",
        "country": "Italy",
        "founded": 1950,
        "drivers_all_time": 203,
        "championships": 16,
        "color": "#DC0000",
        "car_name": "SF-24",
        "power_unit": "Ferrari",
        "current_drivers": 2,
    },
    {
        "name": "Red Bull Racing",
        "country": "Austria",
        "founded": 2005,
        "drivers_all_time": 89,
        "championships": 6,
        "color": "#0600EF",
        "car_name": "RB21",
        "power_unit": "Honda RBPT",
        "current_drivers": 2,
    },
    {
        "name": "Mercedes-AMG Petronas",
        "country": "United Kingdom",
        "founded": 1954,
        "drivers_all_time": 156,
        "championships": 9,
        "color": "#00D4BE",
        "car_name": "W15",
        "power_unit": "Mercedes",
        "current_drivers": 2,
    },
    {
        "name": "Aston Martin F1 Team",
        "country": "United Kingdom",
        "founded": 2018,
        "drivers_all_time": 34,
        "championships": 0,
        "color": "#006F62",
        "car_name": "AMF1-25",
        "power_unit": "Mercedes",
        "current_drivers": 2,
    },
    {
        "name": "Alpine F1 Team",
        "country": "France",
        "founded": 2021,
        "drivers_all_time": 47,
        "championships": 0,
        "color": "#0082FA",
        "car_name": "A526",
        "power_unit": "Renault",
        "current_drivers": 2,
    },
    {
        "name": "Haas F1 Team",
        "country": "United States",
        "founded": 2016,
        "drivers_all_time": 38,
        "championships": 0,
        "color": "#FFFFFF",
        "car_name": "VF-26",
        "power_unit": "Ferrari",
        "current_drivers": 2,
    },
    {
        "name": "RB Racing",
        "country": "Italy",
        "founded": 2005,
        "drivers_all_time": 92,
        "championships": 0,
        "color": "#1E3050",
        "car_name": "RB22",
        "power_unit": "Honda RBPT",
        "current_drivers": 2,
    },
    {
        "name": "Williams Racing",
        "country": "United Kingdom",
        "founded": 1977,
        "drivers_all_time": 182,
        "championships": 7,
        "color": "#0082FA",
        "car_name": "FW47",
        "power_unit": "Mercedes",
        "current_drivers": 2,
    },
    {
        "name": "Kick Sauber",
        "country": "Switzerland",
        "founded": 1993,
        "drivers_all_time": 147,
        "championships": 0,
        "color": "#00D4BE",
        "car_name": "C46",
        "power_unit": "Ferrari",
        "current_drivers": 2,
    },
]

def main():
    """Populate teams"""
    with engine.begin() as connection:
        print("Populating F1 teams...\n")
        updated_count = 0
        
        for team_info in teams_data:
            team_name = team_info["name"]
            
            # Check if team exists
            result = connection.execute(
                text("SELECT id FROM constructors WHERE name = :name"),
                {"name": team_name}
            )
            row = result.fetchone()
            
            if not row:
                print(f"✗ {team_name} (Not in database)")
                continue
            
            team_id = row[0]
            
            # Update team with extended data (using description field for comprehensive info)
            try:
                connection.execute(
                    text("""
                        UPDATE constructors 
                        SET 
                            description = :description
                        WHERE id = :id
                    """),
                    {
                        "description": f"Founded: {team_info['founded']} | {team_info['championships']} Championships | {team_info['drivers_all_time']} drivers all-time | Car: {team_info['car_name']} | Power: {team_info['power_unit']}",
                        "id": team_id,
                    }
                )
                print(f"✓ {team_name} ({team_info['championships']} Championships | {team_info['drivers_all_time']} drivers all-time)")
                updated_count += 1
            except Exception as e:
                print(f"✗ {team_name} Error: {str(e)}")
        
        print(f"\n✓ Updated {updated_count} teams with data")

if __name__ == "__main__":
    main()
