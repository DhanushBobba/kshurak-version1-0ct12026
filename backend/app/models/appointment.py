import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from app.core.database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), index=True, nullable=False)
    family_member_id = Column(String(36), nullable=True)
    barber_id = Column(String(36), index=True, nullable=False)
    shop_id = Column(String(36), index=True, nullable=False)
    slot_time = Column(DateTime, nullable=False)
    status = Column(String(32), default="CONFIRMED", index=True) 
    # CONFIRMED, CHECKED_IN_QUEUE, CALLED_TO_CHAIR, IN_CHAIR, COMPLETED, CANCELLED, NO_SHOW
    
    total_amount_cents = Column(Integer, default=50000) # INR 500.00
    deposit_held_cents = Column(Integer, default=15000) # INR 150.00 in escrow
    escrow_status = Column(String(32), default="HELD") # HELD, RELEASED_TO_BARBER, REFUNDED
    
    consultation_card = Column(JSON, nullable=True) # Full consultation card with face ratios & RoboSpec
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
