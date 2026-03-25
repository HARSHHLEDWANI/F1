from app.database import SessionLocal
from app import models

def seed_all():
    db = SessionLocal()

    try:
        print("🌱 Seeding started...")

        # prevent duplicate
        if db.query(models.Driver).count() > 0:
            print("✅ Already seeded")
            return

        # ================= DRIVERS =================
        drivers = [
            {"given_name": "Max", "family_name": "Verstappen", "nationality": "Dutch"},
            {"given_name": "Lewis", "family_name": "Hamilton", "nationality": "British"},
            {"given_name": "Charles", "family_name": "Leclerc", "nationality": "Monegasque"},
        ]

        for d in drivers:
            db.add(models.Driver(**d))

        # ================= TEAMS =================
        if hasattr(models, "Team"):
            teams = [
                {"name": "Red Bull"},
                {"name": "Mercedes"},
                {"name": "Ferrari"},
            ]

            for t in teams:
                db.add(models.Team(**t))

        # ================= TRACKS =================
        if hasattr(models, "Track"):
            tracks = [
                {"name": "Monaco Circuit"},
                {"name": "Silverstone"},
            ]

            for t in tracks:
                db.add(models.Track(**t))

        # ================= RACES =================
        if hasattr(models, "Race"):
            races = [
                {"season": 2024, "round": 1, "race_name": "Bahrain GP"},
                {"season": 2024, "round": 2, "race_name": "Saudi GP"},
            ]

            for r in races:
                db.add(models.Race(**r))

        db.commit()
        print("✅ Seeding complete")

    except Exception as e:
        print("❌ SEED ERROR:", str(e))
        db.rollback()

    finally:
        db.close()