from fastapi import FastAPI
from app.routes import predict

app = FastAPI(title="F1 ML Service")

app.include_router(predict.router)  