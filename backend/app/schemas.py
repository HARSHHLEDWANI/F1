from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    is_pro: bool

    class Config:
        from_attributes = True

class Driver(BaseModel):
    id: int
    given_name: str
    family_name: str
    nationality: str

    class Config:
        from_attributes = True


class Team(BaseModel):
    id: int
    name: str
    nationality: str

    class Config:
        from_attributes = True


class Circuit(BaseModel):
    id: int
    name: str
    location: str
    country: str

    class Config:
        from_attributes = True