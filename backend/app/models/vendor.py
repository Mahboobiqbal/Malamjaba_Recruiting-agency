from datetime import datetime, date

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vendor_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(100), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    bank_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    account_title: Mapped[str | None] = mapped_column(String(100), nullable=True)
    account_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    transactions: Mapped[list["VendorTransaction"]] = relationship(back_populates="vendor", cascade="all, delete-orphan")
    payments: Mapped[list["VendorPayment"]] = relationship(back_populates="vendor", cascade="all, delete-orphan")


class VendorTransaction(Base):
    __tablename__ = "vendor_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    transaction_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    vendor_id: Mapped[int] = mapped_column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    candidate_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("candidates.id", ondelete="SET NULL"), nullable=True)
    service_type: Mapped[str] = mapped_column(String(20), nullable=False)  # ticket or visa
    service_id: Mapped[int | None] = mapped_column(Integer, nullable=True)  # ID of ticket or visa
    passenger_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    origin: Mapped[str | None] = mapped_column(String(50), nullable=True)
    destination: Mapped[str | None] = mapped_column(String(50), nullable=True)
    travel_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    travel_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    airline: Mapped[str | None] = mapped_column(String(50), nullable=True)
    flight_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    visa_country: Mapped[str | None] = mapped_column(String(50), nullable=True)
    visa_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    visa_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    visa_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    ticket_number: Mapped[str | None] = mapped_column(String(30), nullable=True)
    pnr: Mapped[str | None] = mapped_column(String(20), nullable=True)
    purchase_price: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    selling_price: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    profit: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    payment_status: Mapped[str] = mapped_column(String(20), default="unpaid")  # unpaid/partial/paid
    paid_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    remaining: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    payment_method: Mapped[str | None] = mapped_column(String(20), nullable=True)
    reference_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    vendor: Mapped["Vendor"] = relationship(back_populates="transactions")
    candidate: Mapped["Candidate | None"] = relationship(lazy="selectin")


class VendorPayment(Base):
    __tablename__ = "vendor_payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    payment_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    vendor_id: Mapped[int] = mapped_column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    payment_method: Mapped[str] = mapped_column(String(20), default="cash")  # cash/bank_transfer/cheque
    reference_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    vendor: Mapped["Vendor"] = relationship(back_populates="payments")


from app.models.candidate import Candidate
