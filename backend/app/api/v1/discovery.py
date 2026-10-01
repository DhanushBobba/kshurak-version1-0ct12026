from typing import Optional
from fastapi import APIRouter, Query
from app.services.places_service import places_service

router = APIRouter()

@router.get("/barbers/nearby")
async def get_nearby_barbers(
    lat: float = Query(19.0760, description="Latitude (default Mumbai)"),
    lng: float = Query(72.8777, description="Longitude (default Mumbai)"),
    radius_km: float = Query(5.0, ge=0.5, le=25.0, description="Search radius in kilometers"),
    accepting_walkins_only: bool = Query(False),
):
    """
    Module U5: Google Places map & 5km radius view with 5-minute memory caching.
    """
    shops = await places_service.get_nearby_barbers(lat, lng, radius_km)
    if accepting_walkins_only:
        shops = [s for s in shops if s.get("isAcceptingWalkins")]
    return {
        "center": {"lat": lat, "lng": lng},
        "radiusKm": radius_km,
        "count": len(shops),
        "shops": shops,
    }
