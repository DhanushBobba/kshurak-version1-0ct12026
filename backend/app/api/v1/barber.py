import uuid
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Form, Depends
from app.core.security import get_current_user_payload, require_roles

router = APIRouter()

class ChairCapacityUpdate(BaseModel):
    shopId: str
    acceptingWalkins: bool
    activeChairs: int

@router.post("/register")
async def register_barber_partner(
    shopName: str = Form(...),
    licenseNumber: str = Form(...),
    yearsExperience: int = Form(...),
    specialties: str = Form("Fades, Beard Styling"),
    licenseFile: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user_payload),
):
    """
    Module B1: Barber onboarding registration. Puts barber into PENDING status holding screen.
    """
    barber_id = current_user.get("sub", str(uuid.uuid4()))
    return {
        "id": barber_id,
        "userId": barber_id,
        "shopName": shopName,
        "licenseNumber": licenseNumber,
        "verificationStatus": "PENDING", # Triggers Module B1 holding screen
        "yearsExperience": yearsExperience,
        "specialties": [s.strip() for s in specialties.split(",")],
        "rating": 5.0,
        "reviewCount": 0,
        "chairNumber": 1,
        "isAvailableForWalkin": False,
        "submittedAt": datetime.now(timezone.utc).isoformat(),
        "holdingNotice": "Your barber credentials and shop license are currently under compliance review by Kshurak Quality Assurance. Approvals typically complete within 24-48 hours.",
    }

@router.get("/dashboard")
async def get_barber_dashboard(current_user: dict = Depends(get_current_user_payload)):
    """
    Module B3: Live barber dashboard data with queue, active chair state, and daily earnings.
    """
    return {
        "profile": {
            "id": current_user.get("sub", "barber-101"),
            "shopName": "The Grand Royal Barber Club",
            "chairNumber": 1,
            "verificationStatus": "APPROVED",
            "rating": 4.95,
            "reviewCount": 342,
        },
        "activeChairStatus": True,
        "totalChairsInShop": 5,
        "activeChairs": 4,
        "isAcceptingWalkins": True,
        "earningsTodayCents": 245000, # INR 2,450.00
        "completedTodayCount": 7,
        "currentCustomerInChair": {
            "ticketId": "tkt-active-1",
            "customerName": "Rohan Sharma",
            "service": "Precision Fade & Hot Towel Beard",
            "elapsedMinutes": 18,
            "consultationCardId": "card-rohan-01",
        },
    }

@router.put("/chair-capacity")
async def update_chair_capacity(payload: ChairCapacityUpdate, current_user: dict = Depends(get_current_user_payload)):
    return {
        "shopId": payload.shopId,
        "activeChairs": payload.activeChairs,
        "acceptingWalkins": payload.acceptingWalkins,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }

@router.get("/robospec/{appointment_id}")
async def get_in_chair_robospec(appointment_id: str):
    """
    Module B5: In-Chair Technical RoboSpec drawer displaying clipper guards, taper styles, and cowlick warnings.
    """
    return {
        "appointmentId": appointment_id,
        "customerName": "Rohan Sharma",
        "clipperSpecs": {
            "sidesGuardBase": "#1 (3mm) open blended into #2 (6mm) closed",
            "fadeType": "LOW_DROP_FADE",
            "bulkRemovalGuard": "#4 (13mm) flicking out at parietal ridge",
            "napeFinish": "TAPERED_BLENDED",
        },
        "scissorSpecs": {
            "topLengthInches": 2.25,
            "fringeStyle": "TEXTURED_FORWARD",
            "texturizingTechnique": "POINT_CUTTING",
        },
        "growthPatternWatchouts": [
            "Cowlick at front right hairline: leave 0.5 inch extra buffer to prevent sticking up",
            "Crown swirl runs clockwise; avoid cutting shorter than #5 at apex",
        ],
        "recommendedProducts": [
            {"name": "Matte Texture Clay", "type": "MATTE_CLAY", "applicationMethod": "Warm between palms; apply from back to front."},
            {"name": "Sea Salt Spray", "type": "SEA_SALT_SPRAY", "applicationMethod": "Spray 3 mists onto towel-dried hair before texturizing."},
        ],
        "maintenanceCycleWeeks": 3,
    }
