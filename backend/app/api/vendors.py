from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_permission
from app.models.vendor import Vendor, VendorTransaction, VendorPayment
from app.models.candidate import Candidate
from app.models.ticket import Ticket
from app.models.visa import Visa
from app.models.user import User
from app.schemas.vendor import (
    VendorCreate, VendorUpdate, VendorResponse, VendorListResponse,
    VendorTransactionCreate, VendorTransactionUpdate, VendorTransactionResponse, VendorTransactionListResponse,
    VendorPaymentCreate, VendorPaymentResponse, VendorPaymentListResponse,
    VendorLedgerResponse, VendorLedgerEntry, VendorSummary, VendorTransactionAssign,
)
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/vendors", tags=["Vendors"])


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


async def generate_vendor_code(db) -> str:
    count = (await db.execute(select(func.count()).select_from(Vendor))).scalar() or 0
    return f"V-{count + 1:06d}"


async def generate_transaction_code(db) -> str:
    count = (await db.execute(select(func.count()).select_from(VendorTransaction))).scalar() or 0
    return f"VT-{count + 1:06d}"


async def generate_payment_code(db) -> str:
    count = (await db.execute(select(func.count()).select_from(VendorPayment))).scalar() or 0
    return f"VPAY-{count + 1:06d}"


# ─── Static routes (before /{vendor_id}) ───

@router.get("", response_model=VendorListResponse)
async def list_vendors(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query("", max_length=100),
    status: str = Query("", max_length=20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.view")),
):
    query = select(Vendor)
    count_query = select(func.count()).select_from(Vendor)

    if search:
        like = f"%{search}%"
        query = query.where(Vendor.name.ilike(like) | Vendor.phone.ilike(like) | Vendor.vendor_code.ilike(like))
        count_query = count_query.where(Vendor.name.ilike(like) | Vendor.phone.ilike(like) | Vendor.vendor_code.ilike(like))

    if status:
        query = query.where(Vendor.status == status)
        count_query = count_query.where(Vendor.status == status)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(Vendor.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = result.scalars().all()

    return VendorListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("", response_model=VendorResponse)
async def create_vendor(
    data: VendorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.create")),
):
    vendor = Vendor(
        vendor_code=await generate_vendor_code(db),
        **data.model_dump(),
    )
    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.get("/summary", response_model=VendorSummary)
async def get_vendor_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.view")),
):
    total_purchased = float((await db.execute(
        select(func.coalesce(func.sum(VendorTransaction.purchase_price), 0))
    )).scalar() or 0)

    total_paid = float((await db.execute(
        select(func.coalesce(func.sum(VendorPayment.amount), 0))
    )).scalar() or 0)

    total_owed = total_purchased - total_paid

    total_profit = float((await db.execute(
        select(func.coalesce(func.sum(VendorTransaction.profit), 0))
    )).scalar() or 0)

    transaction_count = (await db.execute(
        select(func.count()).select_from(VendorTransaction)
    )).scalar() or 0

    return VendorSummary(
        total_purchased=total_purchased,
        total_paid=total_paid,
        total_owed=total_owed,
        total_profit=total_profit,
        transaction_count=transaction_count,
    )


@router.get("/transactions/all", response_model=VendorTransactionListResponse)
async def list_all_vendor_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query("", max_length=100),
    service_type: str = Query("", max_length=20),
    payment_status: str = Query("", max_length=20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.view")),
):
    query = select(VendorTransaction).options(
        selectinload(VendorTransaction.vendor),
        selectinload(VendorTransaction.candidate),
    )
    count_query = select(func.count()).select_from(VendorTransaction)

    if service_type:
        query = query.where(VendorTransaction.service_type == service_type)
        count_query = count_query.where(VendorTransaction.service_type == service_type)

    if payment_status:
        query = query.where(VendorTransaction.payment_status == payment_status)
        count_query = count_query.where(VendorTransaction.payment_status == payment_status)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(VendorTransaction.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = result.scalars().all()

    return VendorTransactionListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/transactions/lookup/by-reference")
async def lookup_vendor_transaction_by_reference(
    ticket_number: str = Query(None, max_length=30),
    pnr: str = Query(None, max_length=20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("vendors.view")),
):
    if not ticket_number and not pnr:
        raise HTTPException(status_code=400, detail="Provide ticket_number or pnr")

    stmt = select(VendorTransaction).options(
        selectinload(VendorTransaction.vendor),
        selectinload(VendorTransaction.candidate),
    )
    if ticket_number:
        stmt = stmt.where(VendorTransaction.ticket_number == ticket_number)
    elif pnr:
        stmt = stmt.where(VendorTransaction.pnr == pnr)

    result = await db.execute(stmt)
    txn = result.scalar_one_or_none()
    if not txn:
        raise NotFoundException("No purchase found for this ticket number / PNR")

    return {
        "id": txn.id,
        "transaction_code": txn.transaction_code,
        "vendor_id": txn.vendor_id,
        "passenger_name": txn.passenger_name,
        "origin": txn.origin,
        "destination": txn.destination,
        "travel_date": str(txn.travel_date) if txn.travel_date else None,
        "travel_time": txn.travel_time,
        "airline": txn.airline,
        "flight_number": txn.flight_number,
        "ticket_number": txn.ticket_number,
        "pnr": txn.pnr,
        "purchase_price": float(txn.purchase_price),
        "selling_price": float(txn.selling_price),
        "candidate_id": txn.candidate_id,
        "vendor": {"id": txn.vendor.id, "name": txn.vendor.name, "vendor_code": txn.vendor.vendor_code} if txn.vendor else None,
        "candidate": {"id": txn.candidate.id, "full_name": txn.candidate.full_name, "candidate_code": txn.candidate.candidate_code} if txn.candidate else None,
    }


@router.get("/transactions/lookup/by-visa-number")
async def lookup_vendor_transaction_by_visa_number(
    visa_number: str = Query(..., max_length=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("vendors.view")),
):
    stmt = select(VendorTransaction).options(
        selectinload(VendorTransaction.vendor),
        selectinload(VendorTransaction.candidate),
    ).where(
        VendorTransaction.service_type == "visa",
        VendorTransaction.visa_number == visa_number,
    )

    result = await db.execute(stmt)
    txn = result.scalar_one_or_none()
    if not txn:
        raise NotFoundException("No purchase found for this visa number")

    return {
        "id": txn.id,
        "transaction_code": txn.transaction_code,
        "vendor_id": txn.vendor_id,
        "passenger_name": txn.passenger_name,
        "visa_country": txn.visa_country,
        "visa_type": txn.visa_type,
        "visa_date": str(txn.visa_date) if txn.visa_date else None,
        "purchase_price": float(txn.purchase_price),
        "selling_price": float(txn.selling_price),
        "candidate_id": txn.candidate_id,
        "vendor": {"id": txn.vendor.id, "name": txn.vendor.name, "vendor_code": txn.vendor.vendor_code} if txn.vendor else None,
        "candidate": {"id": txn.candidate.id, "full_name": txn.candidate.full_name, "candidate_code": txn.candidate.candidate_code} if txn.candidate else None,
    }


# ─── Dynamic routes (/{vendor_id}) ───

@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(
    vendor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.view")),
):
    vendor = (await db.execute(select(Vendor).where(Vendor.id == vendor_id))).scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.put("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(
    vendor_id: int,
    data: VendorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.update")),
):
    vendor = (await db.execute(select(Vendor).where(Vendor.id == vendor_id))).scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(vendor, key, value)
    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.delete("/{vendor_id}")
async def delete_vendor(
    vendor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.delete")),
):
    vendor = (await db.execute(select(Vendor).where(Vendor.id == vendor_id))).scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    await db.delete(vendor)
    await db.commit()
    return {"detail": "Vendor deleted"}


# ─── Vendor Transactions ───

@router.get("/{vendor_id}/transactions", response_model=VendorTransactionListResponse)
async def list_vendor_transactions(
    vendor_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.view")),
):
    vendor = (await db.execute(select(Vendor).where(Vendor.id == vendor_id))).scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    query = select(VendorTransaction).where(VendorTransaction.vendor_id == vendor_id)
    count_query = select(func.count()).select_from(VendorTransaction).where(VendorTransaction.vendor_id == vendor_id)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.options(selectinload(VendorTransaction.candidate)).order_by(VendorTransaction.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = result.scalars().all()

    return VendorTransactionListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("/{vendor_id}/transactions", response_model=VendorTransactionResponse)
async def create_vendor_transaction(
    vendor_id: int,
    data: VendorTransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.create")),
):
    vendor = (await db.execute(select(Vendor).where(Vendor.id == vendor_id))).scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    purchase_price = float(data.purchase_price)
    selling_price = float(data.selling_price)
    profit = selling_price - purchase_price

    transaction = VendorTransaction(
        transaction_code=await generate_transaction_code(db),
        vendor_id=vendor_id,
        candidate_id=data.candidate_id,
        service_type=data.service_type,
        service_id=data.service_id or None,
        passenger_name=data.passenger_name,
        origin=data.origin,
        destination=data.destination,
        travel_date=parse_date(data.travel_date),
        travel_time=data.travel_time,
        airline=data.airline,
        flight_number=data.flight_number,
        ticket_number=data.ticket_number,
        pnr=data.pnr,
        visa_country=data.visa_country,
        visa_type=data.visa_type,
        visa_date=parse_date(data.visa_date),
        visa_number=data.visa_number,
        purchase_price=purchase_price,
        selling_price=selling_price,
        profit=profit,
        payment_status="unpaid",
        paid_amount=0,
        remaining=purchase_price,
        payment_method=data.payment_method,
        reference_number=data.reference_number,
        remarks=data.remarks,
        created_by=current_user.id,
    )
    db.add(transaction)
    await db.commit()
    result = await db.execute(
        select(VendorTransaction)
        .options(selectinload(VendorTransaction.vendor), selectinload(VendorTransaction.candidate))
        .where(VendorTransaction.id == transaction.id)
    )
    return result.scalar_one()


@router.put("/{vendor_id}/transactions/{txn_id}", response_model=VendorTransactionResponse)
async def update_vendor_transaction(
    vendor_id: int,
    txn_id: int,
    data: VendorTransactionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.update")),
):
    txn = (await db.execute(
        select(VendorTransaction)
        .options(selectinload(VendorTransaction.vendor), selectinload(VendorTransaction.candidate))
        .where(VendorTransaction.id == txn_id, VendorTransaction.vendor_id == vendor_id)
    )).scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key in ("travel_date", "visa_date") and isinstance(value, str):
            value = parse_date(value)
        setattr(txn, key, value)
    if data.purchase_price is not None or data.selling_price is not None:
        txn.profit = float(txn.selling_price) - float(txn.purchase_price)
    await db.commit()
    await db.refresh(txn)
    result = await db.execute(
        select(VendorTransaction)
        .options(selectinload(VendorTransaction.vendor), selectinload(VendorTransaction.candidate))
        .where(VendorTransaction.id == txn_id)
    )
    return result.scalar_one()


@router.delete("/{vendor_id}/transactions/{txn_id}")
async def delete_vendor_transaction(
    vendor_id: int,
    txn_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.delete")),
):
    txn = (await db.execute(
        select(VendorTransaction)
        .where(VendorTransaction.id == txn_id, VendorTransaction.vendor_id == vendor_id)
    )).scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    await db.delete(txn)
    await db.commit()
    return {"message": "Transaction deleted", "success": True}


# ─── Assign to Candidate ───

async def generate_ticket_code(db) -> str:
    count = (await db.execute(select(func.count()).select_from(Ticket))).scalar() or 0
    return f"TKT-{count + 1:06d}"


async def generate_visa_code(db) -> str:
    count = (await db.execute(select(func.count()).select_from(Visa))).scalar() or 0
    return f"VISA-{count + 1:06d}"


@router.post("/{vendor_id}/transactions/{txn_id}/assign", response_model=VendorTransactionResponse)
async def assign_transaction_to_candidate(
    vendor_id: int,
    txn_id: int,
    data: VendorTransactionAssign,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.create")),
):
    txn = (await db.execute(
        select(VendorTransaction)
        .options(selectinload(VendorTransaction.vendor), selectinload(VendorTransaction.candidate))
        .where(VendorTransaction.id == txn_id, VendorTransaction.vendor_id == vendor_id)
    )).scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    candidate = (await db.execute(select(Candidate).where(Candidate.id == data.candidate_id))).scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    service_id = None
    if txn.service_type == "ticket":
        ticket_price = float(data.ticket_price) if data.ticket_price else (float(txn.selling_price) if txn.selling_price else 0)
        ticket = Ticket(
            ticket_code=await generate_ticket_code(db),
            candidate_id=data.candidate_id,
            airline=data.airline or txn.airline,
            flight_number=data.flight_number or txn.flight_number,
            departure_airport=data.departure_airport or txn.origin,
            arrival_airport=data.arrival_airport or txn.destination,
            departure_date=parse_date(data.departure_date) or txn.travel_date,
            departure_time=data.departure_time or txn.travel_time,
            ticket_price=ticket_price,
            status="pending",
            created_by=current_user.id,
        )
        db.add(ticket)
        await db.flush()
        service_id = ticket.id
    elif txn.service_type == "visa":
        visa_fee = float(data.visa_fee) if data.visa_fee else (float(txn.selling_price) if txn.selling_price else 0)
        visa = Visa(
            visa_code=await generate_visa_code(db),
            candidate_id=data.candidate_id,
            visa_type=data.visa_type or txn.visa_type,
            country=data.country or txn.visa_country,
            visa_fee=visa_fee,
            status="processing",
            created_by=current_user.id,
        )
        db.add(visa)
        await db.flush()
        service_id = visa.id

    txn.service_id = service_id
    txn.candidate_id = data.candidate_id
    await db.commit()

    result = await db.execute(
        select(VendorTransaction)
        .options(selectinload(VendorTransaction.vendor), selectinload(VendorTransaction.candidate))
        .where(VendorTransaction.id == txn_id)
    )
    return result.scalar_one()


# ─── Vendor Payments ───

@router.get("/{vendor_id}/payments", response_model=VendorPaymentListResponse)
async def list_vendor_payments(
    vendor_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.view")),
):
    vendor = (await db.execute(select(Vendor).where(Vendor.id == vendor_id))).scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    query = select(VendorPayment).where(VendorPayment.vendor_id == vendor_id)
    count_query = select(func.count()).select_from(VendorPayment).where(VendorPayment.vendor_id == vendor_id)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(VendorPayment.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = result.scalars().all()

    return VendorPaymentListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("/{vendor_id}/payments", response_model=VendorPaymentResponse)
async def create_vendor_payment(
    vendor_id: int,
    data: VendorPaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.create")),
):
    vendor = (await db.execute(select(Vendor).where(Vendor.id == vendor_id))).scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    payment = VendorPayment(
        payment_code=await generate_payment_code(db),
        vendor_id=vendor_id,
        amount=float(data.amount),
        payment_method=data.payment_method,
        reference_number=data.reference_number,
        remarks=data.remarks,
        created_by=current_user.id,
    )
    db.add(payment)

    # Update unpaid transactions for this vendor (FIFO)
    remaining_payment = float(data.amount)
    transactions = (await db.execute(
        select(VendorTransaction)
        .where(VendorTransaction.vendor_id == vendor_id)
        .where(VendorTransaction.payment_status != "paid")
        .order_by(VendorTransaction.created_at.asc())
    )).scalars().all()

    for txn in transactions:
        if remaining_payment <= 0:
            break
        txn_remaining = float(txn.remaining)
        if remaining_payment >= txn_remaining:
            txn.paid_amount = float(txn.purchase_price)
            txn.remaining = 0
            txn.payment_status = "paid"
            remaining_payment -= txn_remaining
        else:
            txn.paid_amount = float(txn.paid_amount) + remaining_payment
            txn.remaining = txn_remaining - remaining_payment
            txn.payment_status = "partial"
            remaining_payment = 0

    await db.commit()
    await db.refresh(payment)
    return payment


# ─── Vendor Ledger ───

@router.get("/{vendor_id}/ledger", response_model=VendorLedgerResponse)
async def get_vendor_ledger(
    vendor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.view")),
):
    vendor = (await db.execute(select(Vendor).where(Vendor.id == vendor_id))).scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    entries = []
    balance = 0.0

    transactions = (await db.execute(
        select(VendorTransaction)
        .where(VendorTransaction.vendor_id == vendor_id)
        .order_by(VendorTransaction.created_at.asc())
    )).scalars().all()

    for txn in transactions:
        amount = float(txn.purchase_price)
        balance += amount
        entries.append(VendorLedgerEntry(
            date=txn.created_at.strftime("%Y-%m-%d") if txn.created_at else "",
            description=f"Purchase: {txn.service_type.title()} ({txn.transaction_code})",
            debit=amount,
            credit=0,
            balance=balance,
            reference_type="vendor_transaction",
            reference_id=txn.id,
        ))

    payments = (await db.execute(
        select(VendorPayment)
        .where(VendorPayment.vendor_id == vendor_id)
        .order_by(VendorPayment.created_at.asc())
    )).scalars().all()

    for pmt in payments:
        amount = float(pmt.amount)
        balance -= amount
        entries.append(VendorLedgerEntry(
            date=pmt.created_at.strftime("%Y-%m-%d") if pmt.created_at else "",
            description=f"Payment: {pmt.payment_method.replace('_', ' ').title()} ({pmt.payment_code})",
            debit=0,
            credit=amount,
            balance=balance,
            reference_type="vendor_payment",
            reference_id=pmt.id,
        ))

    entries.sort(key=lambda e: e.date)

    total_debit = sum(e.debit for e in entries)
    total_credit = sum(e.credit for e in entries)

    return VendorLedgerResponse(
        vendor=VendorResponse.model_validate(vendor),
        opening_balance=0,
        entries=entries,
        closing_balance=balance,
        total_debit=total_debit,
        total_credit=total_credit,
    )
