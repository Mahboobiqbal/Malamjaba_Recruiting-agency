from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    candidate_id: Mapped[int] = mapped_column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    agent_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    airline: Mapped[str | None] = mapped_column(String(50), nullable=True)
    pnr: Mapped[str | None] = mapped_column(String(20), nullable=True)
    ticket_number: Mapped[str | None] = mapped_column(String(30), nullable=True)
    flight_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    departure_airport: Mapped[str | None] = mapped_column(String(10), nullable=True)
    arrival_airport: Mapped[str | None] = mapped_column(String(10), nullable=True)
    departure_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    departure_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    arrival_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    arrival_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    baggage_allowance: Mapped[str | None] = mapped_column(String(20), nullable=True)
    ticket_class: Mapped[str | None] = mapped_column(String(20), nullable=True)
    ticket_price: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    agent_commission: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    other_charges: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    total: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    paid: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    remaining: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    candidate: Mapped["Candidate"] = relationship(back_populates="tickets", lazy="selectin")
    agent: Mapped["Agent | None"] = relationship(back_populates="tickets", lazy="selectin")
    payments: Mapped[list["Payment"]] = relationship(back_populates="ticket", lazy="selectin")


from app.models.agent import Agent
from app.models.candidate import Candidate
