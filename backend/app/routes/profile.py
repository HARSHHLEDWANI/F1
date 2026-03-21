from fastapi import APIRouter, Depends
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/profile")
def get_profile(current_user = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "name": current_user.name,
        "plan": current_user.plan,
        "favorite_team": current_user.favorite_team,
        "favorite_driver": current_user.favorite_driver
    }
