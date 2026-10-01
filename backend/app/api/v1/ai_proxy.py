import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Form, Depends
from app.services.ai_service import ai_service
from app.core.security import get_current_user_payload

router = APIRouter()

class TryOnRequest(BaseModel):
    userImageBase64: str
    hairstyleId: str
    preserveFacialHair: bool = True
    colorAdjustment: Optional[str] = None

class HitlReviewRequest(BaseModel):
    correctedFaceShape: str
    adminNotes: str
    approved: bool

@router.post("/face-scan")
async def process_face_scan(
    file: UploadFile = File(...),
    familyMemberId: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user_payload),
):
    """
    Module U3 & U4: PII scrubbing, face landmark ratio calculation, and AI consultation card synthesis.
    """
    image_bytes = await file.read()
    user_id = current_user.get("sub", "anon-user")

    # Step 1: Calculate ratios & check confidence
    face_ratios = await ai_service.analyze_face_biometrics(image_bytes, user_id)

    # Step 2: Generate Consultation Card with RoboSpec
    consultation_card = await ai_service.generate_consultation_card(user_id, face_ratios)
    if familyMemberId:
        consultation_card["familyMemberId"] = familyMemberId

    return {
        "faceRatios": face_ratios,
        "consultationCard": consultation_card,
        "isHitlRequired": face_ratios["isHitlRequired"],
        "confidenceScore": face_ratios["confidenceScore"],
    }

@router.post("/try-on")
async def generate_virtual_try_on(req: TryOnRequest):
    """
    Module U4: Virtual hairstyle diffusion preview via FLUX / Replicate worker.
    """
    result = await ai_service.generate_virtual_tryon(req.userImageBase64, req.hairstyleId)
    return result

@router.get("/consultation/{consultation_id}")
async def get_consultation_card(consultation_id: str):
    face_ratios = {
        "faceLengthToWidthRatio": 1.42,
        "foreheadToFaceHeightRatio": 0.33,
        "cheekboneToJawRatio": 1.22,
        "jawlineAngleDegrees": 118.0,
        "chinShape": "SQUARE",
        "detectedFaceShape": "OVAL",
        "confidenceScore": 91.0,
        "isHitlRequired": False,
    }
    card = await ai_service.generate_consultation_card("user-sample", face_ratios)
    card["id"] = consultation_id
    return card

@router.post("/consultation/{consultation_id}/hitl-review")
async def submit_hitl_review(consultation_id: str, req: HitlReviewRequest, current_user: dict = Depends(get_current_user_payload)):
    """
    Module A4: Human-in-the-loop review for low confidence face scans (<70%).
    """
    return {
        "consultationId": consultation_id,
        "reviewedBy": current_user.get("sub", "admin-reviewer"),
        "status": "APPROVED" if req.approved else "REJECTED",
        "correctedFaceShape": req.correctedFaceShape,
        "notes": req.adminNotes,
    }
