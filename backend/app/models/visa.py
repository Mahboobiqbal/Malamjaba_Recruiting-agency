from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Visa(Base):
    __tablename__ = "visas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    visa_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    candidate_id: Mapped[int] = mapped_column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    agent_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    visa_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    country: Mapped[str | None] = mapped_column(String(50), nullable=True)
    visa_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    issue_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="processing")
    profession: Mapped[str | None] = mapped_column(String(100), nullable=True)
    employer: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sponsor: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sponsor_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    wakala_reference: Mapped[str | None] = mapped_column(String(50), nullable=True)
    visa_fee: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    agent_fee: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    other_charges: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    total_cost: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    paid_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    remaining_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    candidate: Mapped["Candidate"] = relationship(back_populates="visas", lazy="selectin")
    agent: Mapped["Agent | None"] = relationship(back_populates="visas", lazy="selectin")
    payments: Mapped[list["Payment"]] = relationship(back_populates="visa", lazy="selectin")


from app.models.agent import Agent
from app.models.candidate import Candidate
