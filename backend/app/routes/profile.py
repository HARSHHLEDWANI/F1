from fastapi import APIRouter, Depends
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/profile")
def get_profile(current_user = Depends(get_current_user)):
    return {
        "email": current_user.email,
    }
