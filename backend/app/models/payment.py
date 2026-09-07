from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    payment_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    receipt_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    candidate_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("candidates.id", ondelete="SET NULL"), nullable=True)
    agent_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    payment_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    payment_type: Mapped[str] = mapped_column(String(20), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(20), nullable=False)
    reference_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    received_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    candidate: Mapped["Candidate | None"] = relationship(back_populates="payments")
    agent: Mapped["Agent | None"] = relationship(foreign_keys=[agent_id], remote_side="Agent.id", lazy="select")
    received_by_user: Mapped["User | None"] = relationship(foreign_keys=[received_by], remote_side="User.id", lazy="select")


from app.models.candidate import Candidate
from app.models.agent import Agent
from app.models.user import User
