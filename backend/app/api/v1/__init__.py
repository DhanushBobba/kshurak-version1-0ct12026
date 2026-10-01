from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.appointments import router as appointments_router
from app.api.v1.discovery import router as discovery_router
from app.api.v1.ai_proxy import router as ai_proxy_router
from app.api.v1.barber import router as barber_router
from app.api.v1.admin import router as admin_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_v1_router.include_router(users_router, prefix="/users", tags=["Users"])
api_v1_router.include_router(appointments_router, prefix="/appointments", tags=["Appointments & Queue"])
api_v1_router.include_router(discovery_router, prefix="/discovery", tags=["Discovery (5km Radius)"])
api_v1_router.include_router(ai_proxy_router, prefix="/ai-proxy", tags=["AI Proxy & Diffusion"])
api_v1_router.include_router(barber_router, prefix="/barber", tags=["Barber Partner Services"])
api_v1_router.include_router(admin_router, prefix="/admin", tags=["Admin Platform Management"])
