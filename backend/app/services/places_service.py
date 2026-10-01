import math
import time
from typing import List, Dict, Any, Optional

class PlacesService:
    """
    Module U5: Google Places map & 5km radius discovery service with 5-minute TTL caching layer.
    """

    def __init__(self):
        # 5-minute cache: (lat_round, lng_round) -> { "data": [...], "expires_at": timestamp }
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl_seconds = 300 # 5 minutes

    def _haversine_distance_km(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate great-circle distance in kilometers between two points."""
        r = 6371.0 # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2.0) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return r * c

    def _get_cache_key(self, lat: float, lng: float, radius_km: float) -> str:
        return f"{round(lat, 3)}:{round(lng, 3)}:{radius_km}"

    async def get_nearby_barbers(self, lat: float, lng: float, radius_km: float = 5.0) -> List[Dict[str, Any]]:
        cache_key = self._get_cache_key(lat, lng, radius_km)
        now = time.time()

        # Check 5-minute cache
        if cache_key in self._cache:
            entry = self._cache[cache_key]
            if entry["expires_at"] > now:
                return entry["data"]

        # Master mock directory of verified partner shops
        master_shops = [
            {
                "id": "shp-001",
                "shopCode": "KSH-SHP-84921",
                "name": "The Grand Royal Barber Club",
                "address": "42 Linking Road, Bandra West",
                "city": "Mumbai",
                "latitude": lat + 0.008,
                "longitude": lng + 0.005,
                "rating": 4.95,
                "reviewCount": 342,
                "isAcceptingWalkins": True,
                "currentWaitMinutes": 15,
                "activeChairs": 4,
                "totalChairs": 5,
                "priceTier": "$$$",
                "heroImageUrl": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80",
                "specialties": ["Skin Fades", "Hot Towel Shave", "Beard Sculpting"],
            },
            {
                "id": "shp-002",
                "shopCode": "KSH-SHP-19283",
                "name": "Obsidian & Gold Studio",
                "address": "15 Turner Road, Bandra West",
                "city": "Mumbai",
                "latitude": lat - 0.012,
                "longitude": lng + 0.008,
                "rating": 4.88,
                "reviewCount": 218,
                "isAcceptingWalkins": True,
                "currentWaitMinutes": 25,
                "activeChairs": 3,
                "totalChairs": 3,
                "priceTier": "$$$$",
                "heroImageUrl": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80",
                "specialties": ["Face Ratio Consultation", "Textured Crop", "Scalp Detox"],
            },
            {
                "id": "shp-003",
                "shopCode": "KSH-SHP-77410",
                "name": "Crown & Razor Parlour",
                "address": "88 Hill Road, Bandra West",
                "city": "Mumbai",
                "latitude": lat + 0.015,
                "longitude": lng - 0.007,
                "rating": 4.82,
                "reviewCount": 165,
                "isAcceptingWalkins": False,
                "currentWaitMinutes": 0,
                "activeChairs": 2,
                "totalChairs": 4,
                "priceTier": "$$",
                "heroImageUrl": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80",
                "specialties": ["Classic Tapers", "Executive Trim", "Kids Styling"],
            },
        ]

        # Calculate haversine distance and filter strictly within radius
        results = []
        for shop in master_shops:
            dist = self._haversine_distance_km(lat, lng, shop["latitude"], shop["longitude"])
            if dist <= radius_km:
                shop_with_dist = shop.copy()
                shop_with_dist["distanceKm"] = round(dist, 2)
                results.append(shop_with_dist)

        # Sort by distance
        results.sort(key=lambda x: x["distanceKm"])

        # Store in 5-minute cache
        self._cache[cache_key] = {
            "data": results,
            "expires_at": now + self._cache_ttl_seconds,
        }

        return results

places_service = PlacesService()
