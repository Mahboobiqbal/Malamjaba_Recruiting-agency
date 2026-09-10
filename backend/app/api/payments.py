from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_permission
from app.models.payment import Payment
from app.models.candidate import Candidate
from app.models.medical_token import MedicalToken
from app.models.ticket import Ticket
from app.models.visa import Visa
from app.models.ledger import LedgerEntry
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse, PaymentListResponse
from app.services.number_generator import generate_payment_code, generate_receipt_number
from app.core.exceptions import NotFoundException, ValidationException

router = APIRouter(prefix="/payments", tags=["Payments"])

LOAD_PAYMENT_OPTIONS = [
    selectinload(Payment.candidate).options(
        selectinload(Candidate.agent),
        selectinload(Candidate.payments),
        selectinload(Candidate.visas),
        selectinload(Candidate.tickets),
        selectinload(Candidate.medical_tokens),
    ),
    selectinload(Payment.agent),
    selectinload(Payment.visa),
    selectinload(Payment.ticket),
    selectinload(Payment.medical_token),
]


def _payment_effect_expression():
    return func.coalesce(
        func.sum(case((Payment.payment_type == "refund", -Payment.amount), else_=Payment.amount)),
        0,
    )


async def _sum_effective_payments(
    db: AsyncSession,
    *,
    visa_id: int | None = None,
    ticket_id: int | None = None,
    medical_token_id: int | None = None,
    exclude_payment_id: int | None = None,
) -> float:
    stmt = select(_payment_effect_expression())
    if visa_id is not None:
        stmt = stmt.where(Payment.visa_id == visa_id)
    if ticket_id is not None:
        stmt = stmt.where(Payment.ticket_id == ticket_id)
    if medical_token_id is not None:
        stmt = stmt.where(Payment.medical_token_id == medical_token_id)
    if exclude_payment_id is not None:
        stmt = stmt.where(Payment.id != exclude_payment_id)

    result = await db.execute(stmt)
    return float(result.scalar() or 0)


async def _resolve_payment_context(
    db: AsyncSession,
    *,
    candidate_id: int | None,
    visa_id: int | None,
    ticket_id: int | None,
    medical_token_id: int | None,
) -> tuple[int | None, Visa | None, Ticket | None, MedicalToken | None]:
    linked_targets = [target_id for target_id in (visa_id, ticket_id, medical_token_id) if target_id is not None]
    if len(linked_targets) > 1:
        raise ValidationException("Select only one linked payment target")

    resolved_candidate_id = candidate_id
    visa = None
    ticket = None
    medical_token = None

    if visa_id is not None:
        result = await db.execute(select(Visa).where(Visa.id == visa_id))
        visa = result.scalar_one_or_none()
        if not visa:
            raise NotFoundException("Visa not found")
        resolved_candidate_id = resolved_candidate_id or visa.candidate_id
        if resolved_candidate_id != visa.candidate_id:
            raise ValidationException("Selected candidate does not match the visa")

    if ticket_id is not None:
        result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
        ticket = result.scalar_one_or_none()
        if not ticket:
            raise NotFoundException("Ticket not found")
        resolved_candidate_id = resolved_candidate_id or ticket.candidate_id
        if resolved_candidate_id != ticket.candidate_id:
            raise ValidationException("Selected candidate does not match the ticket")

    if medical_token_id is not None:
        result = await db.execute(select(MedicalToken).where(MedicalToken.id == medical_token_id))
        medical_token = result.scalar_one_or_none()
        if not medical_token:
            raise NotFoundException("Medical token not found")
        resolved_candidate_id = resolved_candidate_id or medical_token.candidate_id
        if resolved_candidate_id != medical_token.candidate_id:
            raise ValidationException("Selected candidate does not match the medical token")

    if resolved_candidate_id is None:
        raise ValidationException("Select a candidate or a linked payment target")

    return resolved_candidate_id, visa, ticket, medical_token


async def _validate_target_amount(
    db: AsyncSession,
    *,
    amount: float,
    payment_type: str,
    visa: Visa | None = None,
    ticket: Ticket | None = None,
    medical_token: MedicalToken | None = None,
    exclude_payment_id: int | None = None,
):
    if visa is not None:
        paid_total = await _sum_effective_payments(db, visa_id=visa.id, exclude_payment_id=exclude_payment_id)
        if payment_type == "refund":
            if amount > max(paid_total, 0):
                raise ValidationException("Refund amount cannot exceed the paid visa amount")
        else:
            remaining = max(float(visa.total_cost or 0) - paid_total, 0)
            if amount > remaining:
                raise ValidationException("Payment amount cannot exceed the remaining visa balance")

    if ticket is not None:
        paid_total = await _sum_effective_payments(db, ticket_id=ticket.id, exclude_payment_id=exclude_payment_id)
        if payment_type == "refund":
            if amount > max(paid_total, 0):
                raise ValidationException("Refund amount cannot exceed the paid ticket amount")
        else:
            remaining = max(float(ticket.total or 0) - paid_total, 0)
            if amount > remaining:
                raise ValidationException("Payment amount cannot exceed the remaining ticket balance")

    if medical_token is not None:
        paid_total = await _sum_effective_payments(db, medical_token_id=medical_token.id, exclude_payment_id=exclude_payment_id)
        if payment_type == "refund":
            if amount > max(paid_total, 0):
                raise ValidationException("Refund amount cannot exceed the paid medical amount")
        else:
            remaining = max(float(medical_token.medical_fee or 0) - paid_total, 0)
            if amount > remaining:
                raise ValidationException("Payment amount cannot exceed the remaining medical fee")


def _build_ledger_entry(payment: Payment, candidate_id: int, created_by: int) -> LedgerEntry:
    is_refund = payment.payment_type == "refund"
    return LedgerEntry(
        candidate_id=candidate_id,
        entry_type="refund" if is_refund else "payment",
        reference_type="payment",
        reference_id=payment.id,
        description=f"Payment {payment.payment_code} - {payment.payment_method}" + (" (refund)" if is_refund else ""),
        debit=payment.amount if is_refund else 0,
        credit=payment.amount if not is_refund else 0,
        balance=0,
        created_by=created_by,
    )


async def _sync_visa_balance(db: AsyncSession, visa_id: int):
    result = await db.execute(select(Visa).where(Visa.id == visa_id))
    visa = result.scalar_one_or_none()
    if not visa:
        raise NotFoundException("Visa not found")

    net_paid = await _sum_effective_payments(db, visa_id=visa_id)
    paid_amount = round(max(net_paid, 0), 2)
    visa.paid_amount = paid_amount
    visa.remaining_amount = round(max(float(visa.total_cost or 0) - paid_amount, 0), 2)


async def _sync_ticket_balance(db: AsyncSession, ticket_id: int):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise NotFoundException("Ticket not found")

    net_paid = await _sum_effective_payments(db, ticket_id=ticket_id)
    paid_amount = round(max(net_paid, 0), 2)
    ticket.paid = paid_amount
    ticket.remaining = round(max(float(ticket.total or 0) - paid_amount, 0), 2)


async def _sync_medical_payment_status(db: AsyncSession, medical_token_id: int):
    result = await db.execute(select(MedicalToken).where(MedicalToken.id == medical_token_id))
    medical_token = result.scalar_one_or_none()
    if not medical_token:
        raise NotFoundException("Medical token not found")

    net_paid = await _sum_effective_payments(db, medical_token_id=medical_token_id)
    fee = float(medical_token.medical_fee or 0)
    if fee <= 0:
        medical_token.payment_status = "paid" if net_paid >= 0 else "unpaid"
    elif net_paid <= 0:
        medical_token.payment_status = "unpaid"
    elif net_paid >= fee:
        medical_token.payment_status = "paid"
    else:
        medical_token.payment_status = "partial"


async def _sync_related_balances(
    db: AsyncSession,
    *,
    visa_ids: set[int],
    ticket_ids: set[int],
    medical_token_ids: set[int],
):
    for visa_id in visa_ids:
        await _sync_visa_balance(db, visa_id)
    for ticket_id in ticket_ids:
        await _sync_ticket_balance(db, ticket_id)
    for medical_token_id in medical_token_ids:
        await _sync_medical_payment_status(db, medical_token_id)


async def _rebuild_candidate_ledger(db: AsyncSession, candidate_id: int):
    delete_stmt = select(LedgerEntry).where(
        LedgerEntry.reference_type == "payment",
        LedgerEntry.candidate_id == candidate_id,
    )
    result = await db.execute(delete_stmt)
    for entry in result.scalars().all():
        await db.delete(entry)

    payments_stmt = (
        select(Payment)
        .where(Payment.candidate_id == candidate_id)
        .order_by(Payment.created_at, Payment.id)
    )
    result = await db.execute(payments_stmt)
    payments = result.scalars().all()
    for payment in payments:
        db.add(_build_ledger_entry(payment, candidate_id, payment.received_by))

    await _recalculate_ledger(candidate_id, db)


async def _rebuild_ledger_for_candidates(db: AsyncSession, candidate_ids: set[int]):
    for candidate_id in candidate_ids:
        await _rebuild_candidate_ledger(db, candidate_id)


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

    resolved_candidate_id, visa, ticket, medical_token = await _resolve_payment_context(
        db,
        candidate_id=data.candidate_id,
        visa_id=data.visa_id,
        ticket_id=data.ticket_id,
        medical_token_id=data.medical_token_id,
    )
    await _validate_target_amount(
        db,
        amount=float(data.amount),
        payment_type=data.payment_type,
        visa=visa,
        ticket=ticket,
        medical_token=medical_token,
    )

    payment_payload = data.model_dump()
    payment_payload["candidate_id"] = resolved_candidate_id
    payment = Payment(
        payment_code=payment_code,
        receipt_number=receipt_number,
        received_by=current_user.id,
        **payment_payload,
    )
    db.add(payment)
    await db.flush()

    db.add(_build_ledger_entry(payment, resolved_candidate_id, current_user.id))

    await _sync_related_balances(
        db,
        visa_ids={visa.id} if visa else set(),
        ticket_ids={ticket.id} if ticket else set(),
        medical_token_ids={medical_token.id} if medical_token else set(),
    )

    await _rebuild_ledger_for_candidates(db, {resolved_candidate_id})

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

    old_candidate_id = payment.candidate_id
    old_visa_id = payment.visa_id
    old_ticket_id = payment.ticket_id
    old_medical_token_id = payment.medical_token_id

    update_data = data.model_dump(exclude_unset=True)
    resolved_candidate_id, visa, ticket, medical_token = await _resolve_payment_context(
        db,
        candidate_id=update_data.get("candidate_id", payment.candidate_id),
        visa_id=update_data.get("visa_id", payment.visa_id),
        ticket_id=update_data.get("ticket_id", payment.ticket_id),
        medical_token_id=update_data.get("medical_token_id", payment.medical_token_id),
    )
    await _validate_target_amount(
        db,
        amount=float(update_data.get("amount", payment.amount)),
        payment_type=update_data.get("payment_type", payment.payment_type),
        visa=visa,
        ticket=ticket,
        medical_token=medical_token,
        exclude_payment_id=payment.id,
    )

    update_data["candidate_id"] = resolved_candidate_id
    for key, value in update_data.items():
        setattr(payment, key, value)

    await db.flush()

    ledger_stmt = select(LedgerEntry).where(
        LedgerEntry.reference_type == "payment",
        LedgerEntry.reference_id == payment_id,
    )
    ledger_result = await db.execute(ledger_stmt)
    for entry in ledger_result.scalars().all():
        await db.delete(entry)

    db.add(_build_ledger_entry(payment, resolved_candidate_id, current_user.id))

    await _sync_related_balances(
        db,
        visa_ids={old_visa_id, payment.visa_id} - {None},
        ticket_ids={old_ticket_id, payment.ticket_id} - {None},
        medical_token_ids={old_medical_token_id, payment.medical_token_id} - {None},
    )

    await _rebuild_ledger_for_candidates(db, {old_candidate_id, resolved_candidate_id} - {None})

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
    visa_id = payment.visa_id
    ticket_id = payment.ticket_id
    medical_token_id = payment.medical_token_id

    ledger_stmt = select(LedgerEntry).where(
        LedgerEntry.reference_type == "payment",
        LedgerEntry.reference_id == payment_id,
    )
    ledger_result = await db.execute(ledger_stmt)
    for entry in ledger_result.scalars().all():
        await db.delete(entry)

    await db.delete(payment)
    await db.flush()

    await _sync_related_balances(
        db,
        visa_ids={visa_id} - {None},
        ticket_ids={ticket_id} - {None},
        medical_token_ids={medical_token_id} - {None},
    )

    if candidate_id:
        await _rebuild_ledger_for_candidates(db, {candidate_id})

    await db.commit()
    return {"message": "Payment deleted successfully", "success": True}
