from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_permission
from app.models.payment import Payment
from app.models.candidate import Candidate
from app.models.ledger import LedgerEntry
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse, PaymentListResponse
from app.services.number_generator import generate_payment_code, generate_receipt_number
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/payments", tags=["Payments"])

LOAD_PAYMENT_OPTIONS = [
    selectinload(Payment.candidate).selectinload(Candidate.agent),
    selectinload(Payment.agent),
    selectinload(Payment.visa),
    selectinload(Payment.ticket),
    selectinload(Payment.medical_token),
]


async def _recalculate_ledger(candidate_id: int, db: AsyncSession):
    entries_stmt = (
        select(LedgerEntry)
        .where(LedgerEntry.candidate_id == candidate_id)
        .order_by(LedgerEntry.created_at)
    )
    result = await db.execute(entries_stmt)
    entries = result.scalars().all()
    balance = 0.0
    for entry in entries:
        balance += float(entry.debit or 0) - float(entry.credit or 0)
        entry.balance = balance


@router.get("", response_model=PaymentListResponse)
async def list_payments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    payment_type: str = Query(None),
    payment_method: str = Query(None),
    candidate_id: int = Query(None),
    agent_id: int = Query(None),
    visa_id: int = Query(None),
    ticket_id: int = Query(None),
    medical_token_id: int = Query(None),
    date_from: str = Query(None),
    date_to: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("payments.view")),
):
    stmt = select(Payment).options(*LOAD_PAYMENT_OPTIONS)
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

    if agent_id:
        stmt = stmt.where(Payment.agent_id == agent_id)
        count_stmt = count_stmt.where(Payment.agent_id == agent_id)

    if visa_id:
        stmt = stmt.where(Payment.visa_id == visa_id)
        count_stmt = count_stmt.where(Payment.visa_id == visa_id)

    if ticket_id:
        stmt = stmt.where(Payment.ticket_id == ticket_id)
        count_stmt = count_stmt.where(Payment.ticket_id == ticket_id)

    if medical_token_id:
        stmt = stmt.where(Payment.medical_token_id == medical_token_id)
        count_stmt = count_stmt.where(Payment.medical_token_id == medical_token_id)

    if date_from:
        stmt = stmt.where(Payment.payment_date >= date_from)
        count_stmt = count_stmt.where(Payment.payment_date >= date_from)
    if date_to:
        stmt = stmt.where(Payment.payment_date <= date_to + " 23:59:59")
        count_stmt = count_stmt.where(Payment.payment_date <= date_to + " 23:59:59")

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
    payment_code = await generate_payment_code(db)
    receipt_number = await generate_receipt_number(db)

    payment = Payment(
        payment_code=payment_code,
        receipt_number=receipt_number,
        received_by=current_user.id,
        **data.model_dump(),
    )
    db.add(payment)
    await db.flush()

    if data.candidate_id:
        balance_stmt = select(func.coalesce(func.sum(LedgerEntry.debit - LedgerEntry.credit), 0)).where(
            LedgerEntry.candidate_id == data.candidate_id
        )
        balance_result = await db.execute(balance_stmt)
        current_balance = float(balance_result.scalar() or 0)

        new_balance = current_balance - data.amount

        ledger_entry = LedgerEntry(
            candidate_id=data.candidate_id,
            entry_type="payment",
            reference_type="payment",
            reference_id=payment.id,
            description=f"Payment {payment_code} - {data.payment_method}",
            credit=data.amount,
            balance=new_balance,
            created_by=current_user.id,
        )
        db.add(ledger_entry)

    await db.commit()
    await db.refresh(payment)

    stmt = select(Payment).where(Payment.id == payment.id).options(*LOAD_PAYMENT_OPTIONS)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("payments.view")),
):
    stmt = select(Payment).where(Payment.id == payment_id).options(*LOAD_PAYMENT_OPTIONS)
    result = await db.execute(stmt)
    payment = result.scalar_one_or_none()
    if not payment:
        raise NotFoundException("Payment not found")
    return payment


@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int,
    data: PaymentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("payments.edit")),
):
    stmt = select(Payment).where(Payment.id == payment_id)
    result = await db.execute(stmt)
    payment = result.scalar_one_or_none()
    if not payment:
        raise NotFoundException("Payment not found")

    old_amount = float(payment.amount)
    old_candidate_id = payment.candidate_id

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(payment, key, value)

    await db.flush()

    new_amount = float(payment.amount)
    new_candidate_id = payment.candidate_id

    if old_candidate_id:
        ledger_stmt = select(LedgerEntry).where(
            LedgerEntry.reference_type == "payment",
            LedgerEntry.reference_id == payment_id,
        )
        ledger_result = await db.execute(ledger_stmt)
        old_entry = ledger_result.scalar_one_or_none()
        if old_entry:
            old_entry.credit = new_amount
            old_entry.description = f"Payment {payment.payment_code} - {payment.payment_method} (updated)"

    if new_candidate_id and new_candidate_id != old_candidate_id:
        balance_stmt = select(func.coalesce(func.sum(LedgerEntry.debit - LedgerEntry.credit), 0)).where(
            LedgerEntry.candidate_id == new_candidate_id
        )
        balance_result = await db.execute(balance_stmt)
        current_balance = float(balance_result.scalar() or 0)
        new_balance = current_balance - new_amount

        ledger_entry = LedgerEntry(
            candidate_id=new_candidate_id,
            entry_type="payment",
            reference_type="payment",
            reference_id=payment.id,
            description=f"Payment {payment.payment_code} - {payment.payment_method}",
            credit=new_amount,
            balance=new_balance,
            created_by=current_user.id,
        )
        db.add(ledger_entry)

    if old_candidate_id:
        await _recalculate_ledger(old_candidate_id, db)
    if new_candidate_id and new_candidate_id != old_candidate_id:
        await _recalculate_ledger(new_candidate_id, db)

    await db.commit()
    await db.refresh(payment)

    stmt = select(Payment).where(Payment.id == payment.id).options(*LOAD_PAYMENT_OPTIONS)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.delete("/{payment_id}")
async def delete_payment(
    payment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("payments.delete")),
):
    stmt = select(Payment).where(Payment.id == payment_id)
    result = await db.execute(stmt)
    payment = result.scalar_one_or_none()
    if not payment:
        raise NotFoundException("Payment not found")

    candidate_id = payment.candidate_id

    if candidate_id:
        ledger_stmt = select(LedgerEntry).where(
            LedgerEntry.reference_type == "payment",
            LedgerEntry.reference_id == payment_id,
        )
        ledger_result = await db.execute(ledger_stmt)
        for entry in ledger_result.scalars().all():
            await db.delete(entry)

    await db.delete(payment)
    await db.flush()

    if candidate_id:
        await _recalculate_ledger(candidate_id, db)

    await db.commit()
    return {"message": "Payment deleted successfully", "success": True}
