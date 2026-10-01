import uuid
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, status
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    phone: str
    fullName: str
    password: str = "P@ssword123"

class OtpRequestModel(BaseModel):
    phone: str
    purpose: str = "LOGIN"

class OtpVerifyModel(BaseModel):
    phone: str
    code: str

@router.post("/token")
async def login_for_access_token(req: LoginRequest):
    # Simulated auth lookup
    user_id = str(uuid.uuid4())
    token = create_access_token({"sub": user_id, "email": req.email, "role": "CUSTOMER"})
    return {
        "accessToken": token,
        "refreshToken": str(uuid.uuid4()),
        "tokenType": "bearer",
        "user": {
            "id": user_id,
            "email": req.email,
            "fullName": "Alex Mercer",
            "phone": "+919820012345",
            "role": "CUSTOMER",
            "isActive": True,
            "familyProfiles": [
                {
                    "id": str(uuid.uuid4()),
                    "userId": user_id,
                    "name": "Leo Mercer (Son)",
                    "relation": "SON",
                    "birthYear": 2018,
                    "hairType": "WAVY_2A",
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                }
            ],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        },
    }

@router.post("/register")
async def register_user(req: RegisterRequest):
    user_id = str(uuid.uuid4())
    token = create_access_token({"sub": user_id, "email": req.email, "role": "CUSTOMER"})
    return {
        "accessToken": token,
        "refreshToken": str(uuid.uuid4()),
        "tokenType": "bearer",
        "user": {
            "id": user_id,
            "email": req.email,
            "fullName": req.fullName,
            "phone": req.phone,
            "role": "CUSTOMER",
            "isActive": True,
            "familyProfiles": [],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        },
    }

@router.post("/otp/request")
async def request_otp(req: OtpRequestModel):
    # In production, invokes Twilio or AWS SNS
    return {"success": True, "message": f"6-digit verification code sent to {req.phone}"}

@router.post("/otp/verify")
async def verify_otp(req: OtpVerifyModel):
    if req.code not in ["123456", "000000", "777777"] and len(req.code) != 6:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")
    
    user_id = str(uuid.uuid4())
    token = create_access_token({"sub": user_id, "email": f"{req.phone}@kshurak.com", "role": "CUSTOMER"})
    return {
        "accessToken": token,
        "refreshToken": str(uuid.uuid4()),
        "tokenType": "bearer",
        "user": {
            "id": user_id,
            "email": f"{req.phone}@kshurak.com",
            "fullName": "Verified Customer",
            "phone": req.phone,
            "role": "CUSTOMER",
            "isActive": True,
            "familyProfiles": [],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        },
    }
