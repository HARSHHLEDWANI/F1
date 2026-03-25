from app.database import SessionLocal
from app import models

def seed_all():
    db = SessionLocal()

    try:
        print("🌱 START SEED")

        # 🔥 FORCE INSERT (no conditions)
        driver = models.Driver(
            given_name="Test",
            family_name="Driver",
            nationality="Test"
        )

        db.add(driver)

        db.commit()
        print("✅ DRIVER INSERTED")

    except Exception as e:
        print("❌ ERROR:", str(e))
        db.rollback()

    finally:
        db.close()