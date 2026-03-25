from app.database import SessionLocal
from app import models

def seed_all():
    db = SessionLocal()

    # 🚨 prevent duplicate seeding
    if db.query(models.Driver).count() > 0:
        print("✅ Already seeded")
        return

    print("🌱 Seeding database...")

    # ================= DRIVERS =================
    drivers = [
        {"given_name": "Max", "family_name": "Verstappen", "nationality": "Dutch", "number": 1, "team": "Red Bull", "rating": 98},
        {"given_name": "Lewis", "family_name": "Hamilton", "nationality": "British", "number": 44, "team": "Mercedes", "rating": 95},
        {"given_name": "Charles", "family_name": "Leclerc", "nationality": "Monegasque", "number": 16, "team": "Ferrari", "rating": 94},
        {"given_name": "Lando", "family_name": "Norris", "nationality": "British", "number": 4, "team": "McLaren", "rating": 93},
        {"given_name": "Fernando", "family_name": "Alonso", "nationality": "Spanish", "number": 14, "team": "Aston Martin", "rating": 92},
    ]

    for d in drivers:
        db.add(models.Driver(**d))

    # ================= TEAMS =================
    teams = [
        {"name": "Red Bull"},
        {"name": "Mercedes"},
        {"name": "Ferrari"},
        {"name": "McLaren"},
        {"name": "Aston Martin"},
    ]

    for t in teams:
        db.add(models.Team(**t))

    # ================= TRACKS =================
    tracks = [
        {"name": "Monaco Circuit", "country": "Monaco", "locality": "Monte Carlo"},
        {"name": "Silverstone", "country": "UK", "locality": "Silverstone"},
        {"name": "Spa-Francorchamps", "country": "Belgium", "locality": "Spa"},
    ]

    for t in tracks:
        db.add(models.Track(**t))

    # ================= RACES =================
    races = [
        {"season": 2024, "round": 1, "race_name": "Bahrain GP"},
        {"season": 2024, "round": 2, "race_name": "Saudi Arabia GP"},
        {"season": 2024, "round": 3, "race_name": "Australian GP"},
    ]

    for r in races:
        db.add(models.Race(**r))

    db.commit()
    db.close()

    print("✅ Database seeded successfully")