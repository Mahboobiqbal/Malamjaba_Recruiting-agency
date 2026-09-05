from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MedicalToken(Base):
    __tablename__ = "medical_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    token_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    candidate_id: Mapped[int] = mapped_column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    token_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    agent_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    medical_center: Mapped[str | None] = mapped_column(String(100), nullable=True)
    medical_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    appointment_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    medical_fee: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    payment_status: Mapped[str] = mapped_column(String(20), default="unpaid")
    medical_status: Mapped[str] = mapped_column(String(20), default="pending")
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    candidate: Mapped["Candidate"] = relationship(back_populates="medical_tokens")
    agent: Mapped["Agent | None"] = relationship(back_populates="medical_tokens")


from app.models.agent import Agent
from app.models.candidate import Candidate
