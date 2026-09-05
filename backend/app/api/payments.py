from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_permission
from app.models.payment import Payment
from app.models.candidate import Candidate
from app.models.visa import Visa
from app.models.ticket import Ticket
from app.models.ledger import LedgerEntry
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentResponse, PaymentListResponse
from app.services.number_generator import generate_payment_code, generate_receipt_number
from app.core.exceptions import NotFoundException, ValidationException

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("", response_model=PaymentListResponse)
async def list_payments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    payment_type: str = Query(None),
    payment_method: str = Query(None),
    candidate_id: int = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("payments.view")),
):
    stmt = select(Payment).options(
        selectinload(Payment.candidate),
    )
    count_stmt = select(func.count()).select_from(Payment)

    if search:
        like_term = f"%{search}%"
        condition = Payment.payment_code.ilike(like_term) | Payment.receipt_number.ilike(like_term)
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)

    if payment_type:
        stmt = stmt.where(Payment.payment_type == payment_type)
        count_stmt = count_stmt.where(Payment.payment_type == payment_type)

    if payment_method:
        stmt = stmt.where(Payment.payment_method == payment_method)
        count_stmt = count_stmt.where(Payment.payment_method == payment_method)

    if candidate_id:
        stmt = stmt.where(Payment.candidate_id == candidate_id)
        count_stmt = count_stmt.where(Payment.candidate_id == candidate_id)

    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.order_by(Payment.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    items = result.scalars().all()

    return PaymentListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("", response_model=PaymentResponse)
async def create_payment(
    data: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("payments.create")),
):
    if data.amount <= 0:
        raise ValidationException("Payment amount must be positive")

    payment_code = await generate_payment_code(db)
    receipt_number = await generate_receipt_number(db)

    payment = Payment(
        payment_code=payment_code,
        receipt_number=receipt_number,
        received_by=current_user.id,
        **data.model_dump(),
    )
    db.add(payment)

    if data.candidate_id:
        stmt = select(Candidate).where(Candidate.id == data.candidate_id)
        result = await db.execute(stmt)
        candidate = result.scalar_one_or_none()
        if candidate:
            balance_stmt = select(func.coalesce(func.sum(LedgerEntry.debit - LedgerEntry.credit), 0)).where(
                LedgerEntry.candidate_id == data.candidate_id
            )
            balance_result = await db.execute(balance_stmt)
            current_balance = float(balance_result.scalar() or 0)

            new_balance = current_balance - data.amount

            ledger_entry = LedgerEntry(
                candidate_id=data.candidate_id,
                entry_type="payment",
                description=f"Payment {payment_code} - {data.payment_method}",
                credit=data.amount,
                balance=new_balance,
                created_by=current_user.id,
            )
            db.add(ledger_entry)

    await db.commit()
    await db.refresh(payment)

    stmt = select(Payment).where(Payment.id == payment.id).options(
        selectinload(Payment.candidate)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("payments.view")),
):
    stmt = select(Payment).where(Payment.id == payment_id).options(
        selectinload(Payment.candidate)
    )
    result = await db.execute(stmt)
    payment = result.scalar_one_or_none()
    if not payment:
        raise NotFoundException("Payment not found")
    return payment
