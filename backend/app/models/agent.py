from datetime import datetime

from sqlalchemy import DateTime, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    father_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cnic: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    mobile: Mapped[str] = mapped_column(String(20), nullable=False)
    whatsapp: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    commission_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    bank_info: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    candidates: Mapped[list["Candidate"]] = relationship(back_populates="agent")
    medical_tokens: Mapped[list["MedicalToken"]] = relationship(back_populates="agent")
    visas: Mapped[list["Visa"]] = relationship(back_populates="agent")
    tickets: Mapped[list["Ticket"]] = relationship(back_populates="agent")
    payments: Mapped[list["Payment"]] = relationship(back_populates="agent")


from app.models.payment import Payment
