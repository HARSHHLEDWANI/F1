from app.database import SessionLocal
from app import models

def seed_all():
    db = SessionLocal()

    try:
        print("🌱 Seeding database...")

        # 🔥 CLEAR OLD DATA FIRST
        db.query(models.Driver).delete()

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

        db.commit()
        print("✅ Seeding complete")

    except Exception as e:
        print("❌ ERROR:", str(e))
        db.rollback()

    finally:
        db.close()