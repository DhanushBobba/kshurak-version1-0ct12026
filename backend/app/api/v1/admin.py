import uuid
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.security import get_current_user_payload

router = APIRouter()

class BarberReviewAction(BaseModel):
    action: str # APPROVE or REJECT
    reasonCode: Optional[str] = None # e.g. INVALID_LICENSE, HYGIENE_NONCOMPLIANCE

class RbacUpdate(BaseModel):
    role: str # CUSTOMER, BARBER, ADMIN
    isActive: bool

# Master in-memory data structures for Admin portal
pending_barbers = [
    {
        "id": "brb-pending-01",
        "userId": "usr-barber-01",
        "barberName": "Dinesh Rathore",
        "shopName": "Imperial Cut & Shave Lounge",
        "licenseNumber": "MH-BARB-2024-8912",
        "yearsExperience": 7,
        "specialties": ["Razor Fade", "Hot Oil Beard Massage", "Hair Tattoo"],
        "verificationStatus": "PENDING",
        "licenseDocUrl": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
        "submittedAt": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": "brb-pending-02",
        "userId": "usr-barber-02",
        "barberName": "Aakash Mehta",
        "shopName": "Aakash Studio Co.",
        "licenseNumber": "MH-BARB-2022-4411",
        "yearsExperience": 4,
        "specialties": ["Mullet Burst", "Face Ratio Precision"],
        "verificationStatus": "PENDING",
        "licenseDocUrl": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
        "submittedAt": datetime.now(timezone.utc).isoformat(),
    },
]

audit_records = [
    {
        "id": str(uuid.uuid4()),
        "actorId": "admin-super-01",
        "actorRole": "SUPER_ADMIN",
        "action": "BARBER_VERIFIED",
        "targetType": "BARBER",
        "targetId": "brb-approved-99",
        "changes": {"status": {"before": "PENDING", "after": "APPROVED"}},
        "ipAddress": "103.21.244.12",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": str(uuid.uuid4()),
        "actorId": "admin-sec-02",
        "actorRole": "ADMIN",
        "action": "RBAC_ROLE_ELEVATED",
        "targetType": "USER",
        "targetId": "usr-emp-44",
        "changes": {"role": {"before": "CUSTOMER", "after": "ADMIN"}},
        "ipAddress": "103.21.244.18",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    },
]

@router.get("/verification-queue")
async def get_pending_barber_queue():
    """Module A1: Pending Barber Queue list."""
    return pending_barbers

@router.put("/verification/{barber_id}")
async def review_barber_application(barber_id: str, payload: BarberReviewAction, current_user: dict = Depends(get_current_user_payload)):
    """Module A1: Barber approve/reject with reason codes."""
    for b in pending_barbers:
        if b["id"] == barber_id:
            b["verificationStatus"] = "APPROVED" if payload.action == "APPROVE" else "REJECTED"
            b["reasonCode"] = payload.reasonCode
            
            # Record in immutable audit log
            audit_records.insert(0, {
                "id": str(uuid.uuid4()),
                "actorId": current_user.get("sub", "admin-user"),
                "actorRole": current_user.get("role", "ADMIN"),
                "action": f"BARBER_{payload.action}",
                "targetType": "BARBER",
                "targetId": barber_id,
                "changes": {"status": b["verificationStatus"], "reasonCode": payload.reasonCode},
                "ipAddress": "127.0.0.1",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            return b
    raise HTTPException(status_code=404, detail="Barber application not found")

@router.get("/shops")
async def get_shop_directory():
    """Module A2: Master Shop Directory & ID Generator."""
    return [
        {
            "id": "shp-001",
            "shopCode": "KSH-SHP-84921",
            "name": "The Grand Royal Barber Club",
            "address": "42 Linking Road, Bandra West, Mumbai",
            "latitude": 19.084,
            "longitude": 72.882,
            "chairCount": 5,
            "activeChairs": 4,
            "isAcceptingWalkins": True,
            "verificationStatus": "APPROVED",
            "registeredDate": "2024-01-15",
        },
        {
            "id": "shp-002",
            "shopCode": "KSH-SHP-19283",
            "name": "Obsidian & Gold Studio",
            "address": "15 Turner Road, Bandra West, Mumbai",
            "latitude": 19.064,
            "longitude": 72.885,
            "chairCount": 3,
            "activeChairs": 3,
            "isAcceptingWalkins": True,
            "verificationStatus": "APPROVED",
            "registeredDate": "2024-03-02",
        },
    ]

@router.put("/users/{user_id}/rbac")
async def update_user_rbac(user_id: str, payload: RbacUpdate, current_user: dict = Depends(get_current_user_payload)):
    """Module A3: RBAC switches, suspensions, resets."""
    audit_records.insert(0, {
        "id": str(uuid.uuid4()),
        "actorId": current_user.get("sub", "admin-user"),
        "actorRole": "SUPER_ADMIN",
        "action": "USER_RBAC_MODIFIED",
        "targetType": "USER",
        "targetId": user_id,
        "changes": {"role": payload.role, "isActive": payload.isActive},
        "ipAddress": "127.0.0.1",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return {"userId": user_id, "role": payload.role, "isActive": payload.isActive, "updatedAt": datetime.now(timezone.utc).isoformat()}

@router.get("/hitl/queue")
async def get_hitl_scan_queue():
    """Module A4: Low-confidence scan review (<70%)."""
    return [
        {
            "scanId": "scan-hitl-001",
            "userId": "usr-client-901",
            "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
            "confidenceScore": 64.2,
            "flaggedReason": "Cheekbone shadow occlusion; jawline landmark ambiguity (below 70% threshold)",
            "detectedFaceShape": "ROUND",
            "suggestedAlternative": "OVAL",
            "capturedAt": datetime.now(timezone.utc).isoformat(),
        },
        {
            "scanId": "scan-hitl-002",
            "userId": "usr-client-902",
            "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
            "confidenceScore": 68.1,
            "flaggedReason": "Head tilt detected > 12 degrees off horizontal axis",
            "detectedFaceShape": "SQUARE",
            "suggestedAlternative": "OBLONG",
            "capturedAt": datetime.now(timezone.utc).isoformat(),
        },
    ]

@router.get("/audit-logs")
async def get_audit_logs(limit: int = Query(50)):
    """Module A5: Immutable append-only audit log viewer."""
    return audit_records[:limit]
