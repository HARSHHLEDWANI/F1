"""
Calculate and populate driver performance ratings based on career statistics
Rating based on: wins, podiums, championships, and points
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set")
    exit(1)

def calculate_performance_rating(wins: int, podiums: int, poles: int, points: int, championships: int) -> int:
    """
    Calculate a driver's performance rating (0-100 scale)
    Based on career achievements
    """
    # Base calculation - normalize each stat to a 0-100 scale
    # Historical context: most drivers never reach 100 wins
    
    # Wins factor (0-30 points) - max realistic: ~100 wins (Hamilton, Schumacher)
    wins_rating = min(30, (wins / 100) * 30)
    
    # Podiums factor (0-20 points) - max realistic: ~200 podiums
    podiums_rating = min(20, (podiums / 200) * 20)
    
    # Pole positions factor (0-15 points) - max realistic: ~200 poles
    poles_rating = min(15, (poles / 200) * 15)
    
    # Championship points factor (0-20 points) - normalize by career length
    # Average ~3 points per race is good, ~5+ is excellent
    points_per_race = points / max(1, wins + podiums + poles + 1)  # rough estimate of races
    points_rating = min(20, (points_per_race / 5) * 20)
    
    # Championships factor (0-15 points) - each championship is major achievement
    champ_rating = min(15, championships * 7.5)
    
    # Final rating
    total_rating = wins_rating + podiums_rating + poles_rating + points_rating + champ_rating
    
    # Cap at 100
    return min(100, max(0, int(total_rating)))

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        # Get all drivers
        result = connection.execute(text("""
            SELECT id, given_name, family_name, wins, podiums, poles, points_total, championships
            FROM drivers
            ORDER BY points_total DESC
        """))
        
        drivers_data = result.fetchall()
        print("=" * 90)
        print("CALCULATING PERFORMANCE RATINGS")
        print("=" * 90)
        
        updated_count = 0
        
        for row in drivers_data:
            driver_id, given_name, family_name, wins, podiums, poles, points, championships = row
            
            rating = calculate_performance_rating(
                wins or 0,
                podiums or 0,
                poles or 0,
                points or 0,
                championships or 0
            )
            
            update_sql = text("""
                UPDATE drivers
                SET rating = :rating
                WHERE id = :driver_id
            """)
            
            connection.execute(update_sql, {
                "rating": rating,
                "driver_id": driver_id
            })
            
            if rating > 0:  # Only print drivers with non-zero ratings
                print(f"{given_name} {family_name:<20} | W:{wins:>2} P:{podiums:>2} PL:{poles:>2} Pts:{points:>3} | Rating: {rating:>3}%")
                updated_count += 1
        
        connection.commit()
        print("\n" + "=" * 90)
        print(f"✓ Updated {updated_count} drivers with performance ratings")
        print("=" * 90)
        
except Exception as e:
    print(f"✗ Error: {e}")
    exit(1)
