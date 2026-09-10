from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    candidate_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    father_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cnic: Mapped[str] = mapped_column(String(20), nullable=True)
    passport_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    passport_issue_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    passport_expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    mobile: Mapped[str] = mapped_column(String(20), nullable=False)
    alternate_mobile: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(50), nullable=True)
    country: Mapped[str | None] = mapped_column(String(50), nullable=True)
    profession: Mapped[str | None] = mapped_column(String(100), nullable=True)
    employer: Mapped[str | None] = mapped_column(String(100), nullable=True)
    job_visa_category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    agent_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    reference: Mapped[str | None] = mapped_column(String(100), nullable=True)
    registration_date: Mapped[date] = mapped_column(Date, default=date.today)
    status: Mapped[str] = mapped_column(String(30), default="new")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    agent: Mapped["Agent | None"] = relationship(back_populates="candidates", lazy="selectin")
    medical_tokens: Mapped[list["MedicalToken"]] = relationship(back_populates="candidate", cascade="all, delete-orphan", lazy="selectin")
    visas: Mapped[list["Visa"]] = relationship(back_populates="candidate", cascade="all, delete-orphan", lazy="selectin")
    tickets: Mapped[list["Ticket"]] = relationship(back_populates="candidate", cascade="all, delete-orphan", lazy="selectin")
    payments: Mapped[list["Payment"]] = relationship(back_populates="candidate", cascade="all, delete-orphan", lazy="selectin")
    documents: Mapped[list["CandidateDocument"]] = relationship(back_populates="candidate", cascade="all, delete-orphan", lazy="selectin")
    ledger_entries: Mapped[list["LedgerEntry"]] = relationship(back_populates="candidate", cascade="all, delete-orphan", lazy="selectin")


from app.models.agent import Agent
from app.models.medical_token import MedicalToken
from app.models.visa import Visa
from app.models.ticket import Ticket
from app.models.payment import Payment
from app.models.document import CandidateDocument
from app.models.ledger import LedgerEntry
