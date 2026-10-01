import uuid
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from app.core.security import get_current_user_payload

router = APIRouter()

class FamilyMemberCreate(BaseModel):
    name: str
    relation: str
    birthYear: Optional[int] = None
    hairType: Optional[str] = None
    allergiesOrNotes: Optional[str] = None

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user_payload)):
    user_id = current_user.get("sub", "user-id-001")
    return {
        "id": user_id,
        "email": current_user.get("email", "alex@kshurak.com"),
        "fullName": "Alex Mercer",
        "phone": "+919820012345",
        "role": current_user.get("role", "CUSTOMER"),
        "isActive": True,
        "familyProfiles": [
            {
                "id": "fam-1",
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
    }

@router.put("/me")
async def update_my_profile(data: dict, current_user: dict = Depends(get_current_user_payload)):
    return {"success": True, "updated": data}

@router.post("/me/family")
async def add_family_member(member: FamilyMemberCreate, current_user: dict = Depends(get_current_user_payload)):
    new_profile = {
        "id": str(uuid.uuid4()),
        "userId": current_user.get("sub"),
        "name": member.name,
        "relation": member.relation,
        "birthYear": member.birthYear,
        "hairType": member.hairType,
        "allergiesOrNotes": member.allergiesOrNotes,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    return new_profile
