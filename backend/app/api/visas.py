from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_permission
from app.models.visa import Visa
from app.models.candidate import Candidate
from app.models.ledger import LedgerEntry
from app.models.vendor import VendorTransaction
from app.models.user import User
from app.schemas.visa import VisaCreate, VisaUpdate, VisaResponse, VisaListResponse, VisaStatusUpdate
from app.services.number_generator import generate_visa_code
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/visas", tags=["Visas"])

LOAD_CANDIDATE_OPTIONS = [
    selectinload(Candidate.agent),
    selectinload(Candidate.payments),
    selectinload(Candidate.visas),
    selectinload(Candidate.tickets),
    selectinload(Candidate.medical_tokens),
]


@router.get("", response_model=VisaListResponse)
async def list_visas(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    status: str = Query(None),
    country: str = Query(None),
    date_from: str = Query(None),
    date_to: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("visa.view")),
):
    stmt = select(Visa).options(
        selectinload(Visa.candidate).options(*LOAD_CANDIDATE_OPTIONS),
        selectinload(Visa.agent),
    )
    count_stmt = select(func.count()).select_from(Visa)

    if search:
        like_term = f"%{search}%"
        condition = Visa.visa_code.ilike(like_term) | Visa.visa_number.ilike(like_term)
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)

    if status:
        stmt = stmt.where(Visa.status == status)
        count_stmt = count_stmt.where(Visa.status == status)

    if country:
        stmt = stmt.where(Visa.country == country)
        count_stmt = count_stmt.where(Visa.country == country)

    if date_from:
        stmt = stmt.where(Visa.created_at >= date_from)
        count_stmt = count_stmt.where(Visa.created_at >= date_from)
    if date_to:
        stmt = stmt.where(Visa.created_at <= date_to + " 23:59:59")
        count_stmt = count_stmt.where(Visa.created_at <= date_to + " 23:59:59")

    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.order_by(Visa.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    items = result.scalars().all()

    return VisaListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("", response_model=VisaResponse)
async def create_visa(
    data: VisaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("visa.create")),
):
    vendor_txn_id = data.vendor_transaction_id
    visa_code = await generate_visa_code(db)
    total_cost = data.visa_fee + data.agent_fee + data.other_charges
    visa_data = data.model_dump(exclude={"vendor_transaction_id"})
    visa = Visa(
        visa_code=visa_code,
        created_by=current_user.id,
        total_cost=total_cost,
        remaining_amount=total_cost,
        **visa_data,
    )
    db.add(visa)
    await db.flush()

    if vendor_txn_id:
        txn_result = await db.execute(
            select(VendorTransaction).where(VendorTransaction.id == vendor_txn_id)
        )
        txn = txn_result.scalar_one_or_none()
        if txn:
            txn.service_id = visa.id
            if not txn.selling_price or txn.selling_price == 0:
                txn.selling_price = data.visa_fee
                txn.profit = data.visa_fee - float(txn.purchase_price)
            if not txn.candidate_id:
                txn.candidate_id = data.candidate_id

    # Create ledger entry for outstanding balance
    ledger_entry = LedgerEntry(
        candidate_id=data.candidate_id,
        entry_type="service",
        reference_type="visa",
        reference_id=visa.id,
        description=f"Visa {visa_code} - {data.country} ({data.visa_type})",
        debit=total_cost,
        credit=0,
        balance=total_cost,
        created_by=current_user.id,
    )
    db.add(ledger_entry)

    await db.commit()
    await db.refresh(visa)

    stmt = select(Visa).where(Visa.id == visa.id).options(
        selectinload(Visa.candidate).options(*LOAD_CANDIDATE_OPTIONS), selectinload(Visa.agent)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/{visa_id}", response_model=VisaResponse)
async def get_visa(
    visa_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("visa.view")),
):
    stmt = select(Visa).where(Visa.id == visa_id).options(
        selectinload(Visa.candidate).options(*LOAD_CANDIDATE_OPTIONS), selectinload(Visa.agent)
    )
    result = await db.execute(stmt)
    visa = result.scalar_one_or_none()
    if not visa:
        raise NotFoundException("Visa not found")
    return visa


@router.put("/{visa_id}", response_model=VisaResponse)
async def update_visa(
    visa_id: int,
    data: VisaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("visa.edit")),
):
    stmt = select(Visa).where(Visa.id == visa_id)
    result = await db.execute(stmt)
    visa = result.scalar_one_or_none()
    if not visa:
        raise NotFoundException("Visa not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(visa, key, value)

    visa.total_cost = visa.visa_fee + visa.agent_fee + visa.other_charges
    visa.remaining_amount = visa.total_cost - visa.paid_amount

    await db.commit()
    await db.refresh(visa)

    stmt = select(Visa).where(Visa.id == visa.id).options(
        selectinload(Visa.candidate).options(*LOAD_CANDIDATE_OPTIONS), selectinload(Visa.agent)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.patch("/{visa_id}/status", response_model=VisaResponse)
async def update_visa_status(
    visa_id: int,
    data: VisaStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("visa.edit")),
):
    stmt = select(Visa).where(Visa.id == visa_id)
    result = await db.execute(stmt)
    visa = result.scalar_one_or_none()
    if not visa:
        raise NotFoundException("Visa not found")

    visa.status = data.status
    await db.commit()
    await db.refresh(visa)

    stmt = select(Visa).where(Visa.id == visa.id).options(
        selectinload(Visa.candidate).options(*LOAD_CANDIDATE_OPTIONS), selectinload(Visa.agent)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.delete("/{visa_id}")
async def delete_visa(
    visa_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("visa.delete")),
):
    stmt = select(Visa).where(Visa.id == visa_id)
    result = await db.execute(stmt)
    visa = result.scalar_one_or_none()
    if not visa:
        raise NotFoundException("Visa not found")
    
    # Delete associated ledger entries
    delete_ledger = select(LedgerEntry).where(
        LedgerEntry.reference_type == "visa",
        LedgerEntry.reference_id == visa_id,
    )
    ledger_result = await db.execute(delete_ledger)
    for entry in ledger_result.scalars().all():
        await db.delete(entry)
    
    await db.delete(visa)
    await db.commit()
    return {"message": "Visa deleted successfully", "success": True}
