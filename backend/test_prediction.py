#!/usr/bin/env python3
import sys
import os
import asyncio
sys.path.insert(0, os.path.dirname(__file__))

from app.routes.prediction import load_model, predict_podium
from app.database import get_db
from app.schemas import RaceRequest
from sqlalchemy.orm import Session

# Test the prediction function
async def test_prediction():
    model, scaler, features = load_model()
    if not model:
        print("Model not loaded")
        return

    print("Model loaded successfully")

    # Test with a simple request
    request = RaceRequest(season=2024, round=1)

    db = next(get_db())
    try:
        # Call the actual prediction function
        result = await predict_podium(request, db)
        print("Prediction successful!")
        print(f"Season: {result.season}, Round: {result.round}")
        print(f"Circuit: {result.circuit_name}")
        print(f"Podium count: {len(result.podium)}")
        if result.podium:
            print(f"Podium: {[p.driver_name for p in result.podium]}")
        else:
            print("No podium predictions generated")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_prediction())