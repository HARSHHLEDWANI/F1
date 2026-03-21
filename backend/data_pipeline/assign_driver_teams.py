"""
Assign drivers to their 2026 teams in the database.
Maps drivers by family name to official F1 team names.
"""

# 2026 F1 Driver Roster
DRIVER_ROSTER = {
    "Red Bull": ["Verstappen", "Perez"],
    "Mercedes": ["Hamilton", "Russell"],
    "Ferrari": ["Leclerc", "Sainz"],
    "McLaren": ["Piastri", "Norris"],
    "Aston Martin": ["Alonso", "Stroll"],
    "Alpine F1 Team": ["Gasly", "Ocon"],
    "Haas F1 Team": ["Hulkenberg", "Magnussen"],
    "RB F1 Team": ["Tsunoda", "Lawson"],
    "Williams": ["Albon", "Colapinto"],
    "Sauber": ["Bottas", "Zhou"],
}

def assign_teams():
    """Assign drivers to their teams based on the 2026 roster."""
    try:
        from backend.data_pipeline.db import get_connection
        
        conn = get_connection()
        cur = conn.cursor()
        
        for team, drivers in DRIVER_ROSTER.items():
            for driver_name in drivers:
                # Update driver's team field
                cur.execute(
                    "UPDATE drivers SET team = %s WHERE family_name ILIKE %s",
                    (team, f"%{driver_name}%")
                )
        
        conn.commit()
        cur.close()
        conn.close()
        print("Driver teams assigned successfully")
    except Exception as e:
        print(f"Error assigning teams: {e}")

if __name__ == "__main__":
    assign_teams()
