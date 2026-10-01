import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON
from app.core.database import Base

class AuditLog(Base):
    """
    Module A5: Immutable append-only audit log table.
    Records every administrative, security, and financial state transition.
    """
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_id = Column(String(36), index=True, nullable=False)
    actor_role = Column(String(32), nullable=False)
    action = Column(String(64), index=True, nullable=False) # e.g. BARBER_APPROVED, RBAC_UPDATED, ESCROW_RELEASED
    target_type = Column(String(64), nullable=False) # e.g. BARBER, USER, APPOINTMENT, SHOP
    target_id = Column(String(36), index=True, nullable=False)
    changes = Column(JSON, nullable=True) # { "before": {...}, "after": {...} }
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
