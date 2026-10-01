from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kshurak Platform Core API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Security & JWT Secrets
    SECRET_KEY: str = os.getenv("SECRET_KEY", "kshurak-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database: Default to async SQLite for local instant development; asyncpg for production
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./kshurak.db"
    )

    # CORS Allowed Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173", # Web Portal
        "http://localhost:5174", # Admin Portal
        "http://localhost:3000",
        "http://localhost:8081", # Expo Metro
        "https://admin.kshurak.com",
        "https://app.kshurak.com",
    ]

    # AI & Diffusion Integrations
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "mock-anthropic-key")
    REPLICATE_API_TOKEN: str = os.getenv("REPLICATE_API_TOKEN", "mock-replicate-key")
    FLUX_DIFFUSION_MODEL_VERSION: str = "black-forest-labs/flux-schnell"

    # Google Places & Maps API
    GOOGLE_PLACES_API_KEY: str = os.getenv("GOOGLE_PLACES_API_KEY", "mock-google-places-key")
    SEARCH_RADIUS_METERS: int = 5000 # 5km default radius

    # Bird Verification API
    BIRD_API_KEY: str = os.getenv("BIRD_API_KEY", "bk_your_actual_key_here")
    BIRD_REGION: str = os.getenv("BIRD_REGION", "us")

    # Model config
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
