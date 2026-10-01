import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Float, Integer, DateTime
from app.core.database import Base

class Shop(Base):
    __tablename__ = "shops"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_code = Column(String(32), unique=True, index=True, nullable=False) # e.g. KSH-SHP-84920
    name = Column(String(128), nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(64), nullable=False, default="Mumbai")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    barber_id = Column(String(36), index=True, nullable=False)
    verification_status = Column(String(32), default="PENDING") # PENDING, APPROVED, REJECTED, SUSPENDED
    license_number = Column(String(64), nullable=True)
    chair_count = Column(Integer, default=3)
    active_chairs = Column(Integer, default=1)
    is_accepting_walkins = Column(Boolean, default=True)
    rating = Column(Float, default=4.9)
    review_count = Column(Integer, default=124)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
