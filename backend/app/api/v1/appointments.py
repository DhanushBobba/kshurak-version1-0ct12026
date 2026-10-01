import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user_payload
from app.services.websocket_hub import queue_hub

router = APIRouter()

class BookingRequest(BaseModel):
    barberId: str
    shopId: str
    serviceIds: List[str]
    slotId: str
    startTime: str
    familyMemberId: Optional[str] = None
    consultationCardId: Optional[str] = None
    notes: Optional[str] = None

# In-memory store for instant demonstration
live_queues = {
    "shp-001": [
        {
            "ticketId": "tkt-1",
            "appointmentId": "apt-1",
            "shopId": "shp-001",
            "barberId": "barber-101",
            "customerId": "cust-01",
            "customerName": "Rohan Sharma",
            "customerPhone": "+919820011111",
            "positionInLine": 1,
            "estimatedWaitMinutes": 5,
            "joinedAt": datetime.now(timezone.utc).isoformat(),
            "status": "WAITING",
            "consultationCardSummary": "Skin Drop Fade (#1 open) + Textured Crop",
        },
        {
            "ticketId": "tkt-2",
            "appointmentId": "apt-2",
            "shopId": "shp-001",
            "barberId": "barber-101",
            "customerId": "cust-02",
            "customerName": "Vikram Malhotra",
            "customerPhone": "+919820022222",
            "positionInLine": 2,
            "estimatedWaitMinutes": 25,
            "joinedAt": datetime.now(timezone.utc).isoformat(),
            "status": "WAITING",
            "consultationCardSummary": "Classic Scissor Taper + Beard Lineup",
        },
    ]
}

@router.get("/slots")
async def get_slots(shop_id: str, barber_id: str, date: str):
    base_time = datetime.fromisoformat(f"{date}T09:00:00")
    slots = []
    for i in range(8):
        start = base_time + timedelta(hours=i)
        end = start + timedelta(minutes=45)
        slots.append({
            "id": f"slot-{i}",
            "barberId": barber_id,
            "shopId": shop_id,
            "startTime": start.isoformat(),
            "endTime": end.isoformat(),
            "isAvailable": i not in [1, 4], # simulate some occupied slots
            "chairNumber": 1,
        })
    return slots

@router.post("/book")
async def create_booking(payload: BookingRequest, current_user: dict = Depends(get_current_user_payload)):
    apt_id = str(uuid.uuid4())
    customer_id = current_user.get("sub", "cust-default")
    
    appointment = {
        "id": apt_id,
        "customerId": customer_id,
        "familyMemberId": payload.familyMemberId,
        "barberId": payload.barberId,
        "shopId": payload.shopId,
        "services": [
            {
                "id": "srv-1",
                "name": "Precision Haircut & Face-Ratio Styling",
                "durationMinutes": 45,
                "priceCents": 60000,
                "depositRequiredCents": 15000,
            }
        ],
        "slot": {
            "id": payload.slotId,
            "barberId": payload.barberId,
            "shopId": payload.shopId,
            "startTime": payload.startTime,
            "endTime": (datetime.fromisoformat(payload.startTime) + timedelta(minutes=45)).isoformat(),
            "isAvailable": False,
            "chairNumber": 1,
        },
        "status": "CONFIRMED",
        "escrow": {
            "totalAmountCents": 60000,
            "depositHeldInEscrowCents": 15000,
            "remainingDueInChairCents": 45000,
            "platformFeeCents": 3000,
            "taxCents": 5400,
            "currency": "INR",
            "escrowStatus": "HELD",
            "transactionReference": f"TXN-ESCROW-{uuid.uuid4().hex[:8].upper()}",
        },
        "consultationCardId": payload.consultationCardId,
        "customerArrivalAlertSent": False,
        "notes": payload.notes,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    return appointment

@router.get("/queue/{shop_id}")
async def get_shop_queue(shop_id: str):
    entries = live_queues.get(shop_id, [])
    return {
        "shopId": shop_id,
        "isQueueAccepting": True,
        "totalActiveChairs": 3,
        "occupiedChairs": 1,
        "waitingCount": len(entries),
        "averageWaitPerPersonMinutes": 20,
        "entries": entries,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }

@router.post("/{appointment_id}/queue/check-in")
async def check_in_queue(appointment_id: str, current_user: dict = Depends(get_current_user_payload)):
    shop_id = "shp-001"
    queue = live_queues.setdefault(shop_id, [])
    
    new_ticket = {
        "ticketId": str(uuid.uuid4()),
        "appointmentId": appointment_id,
        "shopId": shop_id,
        "barberId": "barber-101",
        "customerId": current_user.get("sub", "cust-me"),
        "customerName": "You (Customer)",
        "customerPhone": "+919820012345",
        "positionInLine": len(queue) + 1,
        "estimatedWaitMinutes": len(queue) * 20,
        "joinedAt": datetime.now(timezone.utc).isoformat(),
        "status": "WAITING",
        "consultationCardSummary": "AI Custom Styling Spec Attached",
    }
    queue.append(new_ticket)
    
    # Broadcast via websocket
    await queue_hub.broadcast_to_shop(shop_id, "QUEUE_JOINED", new_ticket)
    return new_ticket

@router.patch("/queue/ticket/{ticket_id}")
async def update_queue_status(ticket_id: str, payload: dict):
    new_status = payload.get("status")
    # Broadcast update
    await queue_hub.broadcast_to_shop("shp-001", "POSITION_UPDATED", {"ticketId": ticket_id, "status": new_status})
    return {"ticketId": ticket_id, "status": new_status}

@router.get("/{appointment_id}/arrival-alert")
async def get_arrival_alert(appointment_id: str):
    # Top-of-screen arrival banner data
    return {
        "alertActive": True,
        "minutesUntilCall": 4,
        "barberName": "Master Barber Kabir",
        "chairNumber": 1,
        "message": "You are 1 spot away! Please proceed to Chair #1.",
    }
