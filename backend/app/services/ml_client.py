import httpx

ML_SERVICE_URL = "http://localhost:8001"

async def predict_lap_time(data: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ML_SERVICE_URL}/predict/lap-time",
            json=data
        )

    return response.json()