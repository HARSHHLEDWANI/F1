from app.database import SessionLocal
from app import models

def seed_all():
    db = SessionLocal()

    try:
        print("🌱 Seeding database...")

        # 🚨 prevent duplicate
        if db.query(models.Driver).count() > 0:
            print("✅ Already seeded")
            return

        # ================= DRIVERS =================
        drivers = [
            ("Max", "Verstappen", "Dutch"),
            ("Lewis", "Hamilton", "British"),
            ("Charles", "Leclerc", "Monegasque"),
            ("Lando", "Norris", "British"),
            ("Fernando", "Alonso", "Spanish"),
        ]

        for g, f, n in drivers:
            db.add(models.Driver(
                given_name=g,
                family_name=f,
                nationality=n
            ))

        # ================= TEAMS =================
        if hasattr(models, "Team"):
            teams = ["Red Bull", "Mercedes", "Ferrari", "McLaren"]

            for t in teams:
                db.add(models.Team(name=t))

        # ================= TRACKS =================
        if hasattr(models, "Track"):
            tracks = [
                ("Monaco Circuit", "Monaco", "Monte Carlo"),
                ("Silverstone", "UK", "Silverstone"),
                ("Spa-Francorchamps", "Belgium", "Spa"),
            ]

            for name, country, locality in tracks:
                db.add(models.Track(
                    name=name,
                    country=country,
                    locality=locality
                ))

        # ================= RACES =================
        if hasattr(models, "Race"):
            races = [
                (2024, 1, "Bahrain GP"),
                (2024, 2, "Saudi GP"),
                (2024, 3, "Australian GP"),
            ]

            for season, round_, name in races:
                db.add(models.Race(
                    season=season,
                    round=round_,
                    race_name=name
                ))

        db.commit()
        print("✅ Seeding complete")

    except Exception as e:
        print("❌ ERROR:", str(e))
        db.rollback()

    finally:
        db.close()