from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_permission
from app.models.ticket import Ticket
from app.models.candidate import Candidate
from app.models.vendor import VendorTransaction
from app.models.ledger import LedgerEntry
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketResponse, TicketListResponse, TicketStatusUpdate
from app.services.number_generator import generate_ticket_code
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/tickets", tags=["Tickets"])

LOAD_CANDIDATE_OPTIONS = [
    selectinload(Candidate.agent),
    selectinload(Candidate.payments),
    selectinload(Candidate.visas),
    selectinload(Candidate.tickets),
    selectinload(Candidate.medical_tokens),
]


@router.get("", response_model=TicketListResponse)
async def list_tickets(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    status: str = Query(None),
    date_from: str = Query(None),
    date_to: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("tickets.view")),
):
    stmt = select(Ticket).options(
        selectinload(Ticket.candidate).options(*LOAD_CANDIDATE_OPTIONS),
        selectinload(Ticket.agent),
    )
    count_stmt = select(func.count()).select_from(Ticket)

    if search:
        like_term = f"%{search}%"
        condition = Ticket.ticket_code.ilike(like_term) | Ticket.pnr.ilike(like_term) | Ticket.ticket_number.ilike(like_term)
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)

    if status:
        stmt = stmt.where(Ticket.status == status)
        count_stmt = count_stmt.where(Ticket.status == status)

    if date_from:
        stmt = stmt.where(Ticket.created_at >= date_from)
        count_stmt = count_stmt.where(Ticket.created_at >= date_from)
    if date_to:
        stmt = stmt.where(Ticket.created_at <= date_to + " 23:59:59")
        count_stmt = count_stmt.where(Ticket.created_at <= date_to + " 23:59:59")

    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.order_by(Ticket.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    items = result.scalars().all()

    return TicketListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("", response_model=TicketResponse)
async def create_ticket(
    data: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("tickets.create")),
):
    vendor_txn_id = data.vendor_transaction_id
    ticket_code = await generate_ticket_code(db)
    total = data.ticket_price + data.agent_commission + data.other_charges
    ticket = Ticket(
        ticket_code=ticket_code,
        created_by=current_user.id,
        total=total,
        remaining=total,
        candidate_id=data.candidate_id,
        agent_id=data.agent_id,
        airline=data.airline,
        pnr=data.pnr,
        ticket_number=data.ticket_number,
        flight_number=data.flight_number,
        departure_airport=data.departure_airport,
        arrival_airport=data.arrival_airport,
        departure_date=data.departure_date,
        departure_time=data.departure_time,
        arrival_date=data.arrival_date,
        arrival_time=data.arrival_time,
        baggage_allowance=data.baggage_allowance,
        ticket_class=data.ticket_class,
        ticket_price=data.ticket_price,
        agent_commission=data.agent_commission,
        other_charges=data.other_charges,
        status=data.status,
        remarks=data.remarks,
    )
    db.add(ticket)
    await db.flush()

    if vendor_txn_id:
        txn_result = await db.execute(
            select(VendorTransaction).where(VendorTransaction.id == vendor_txn_id)
        )
        txn = txn_result.scalar_one_or_none()
        if txn:
            txn.service_id = ticket.id
            if not txn.selling_price or txn.selling_price == 0:
                txn.selling_price = data.ticket_price
                txn.profit = data.ticket_price - float(txn.purchase_price)
            if not txn.candidate_id:
                txn.candidate_id = data.candidate_id

    # Create ledger entry for outstanding balance
    ledger_entry = LedgerEntry(
        candidate_id=data.candidate_id,
        entry_type="service",
        reference_type="ticket",
        reference_id=ticket.id,
        description=f"Ticket {ticket_code} - {data.airline} {data.departure_airport} → {data.arrival_airport}",
        debit=total,
        credit=0,
        balance=total,
        created_by=current_user.id,
    )
    db.add(ledger_entry)

    await db.commit()
    await db.refresh(ticket)

    stmt = select(Ticket).where(Ticket.id == ticket.id).options(
        selectinload(Ticket.candidate).options(*LOAD_CANDIDATE_OPTIONS), selectinload(Ticket.agent)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/lookup/by-reference", response_model=TicketResponse)
async def lookup_ticket_by_reference(
    ticket_number: str = Query(None, max_length=30),
    pnr: str = Query(None, max_length=20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("tickets.view")),
):
    if not ticket_number and not pnr:
        raise HTTPException(status_code=400, detail="Provide ticket_number or pnr")
    
    stmt = select(Ticket).options(
        selectinload(Ticket.candidate).options(*LOAD_CANDIDATE_OPTIONS), 
        selectinload(Ticket.agent)
    )
    
    if ticket_number:
        stmt = stmt.where(Ticket.ticket_number == ticket_number)
    elif pnr:
        stmt = stmt.where(Ticket.pnr == pnr)
    
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise NotFoundException("Ticket not found")
    return ticket


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("tickets.view")),
):
    stmt = select(Ticket).where(Ticket.id == ticket_id).options(
        selectinload(Ticket.candidate).options(*LOAD_CANDIDATE_OPTIONS), selectinload(Ticket.agent)
    )
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise NotFoundException("Ticket not found")
    return ticket


@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: int,
    data: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("tickets.edit")),
):
    stmt = select(Ticket).where(Ticket.id == ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise NotFoundException("Ticket not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ticket, key, value)

    ticket.total = ticket.ticket_price + ticket.agent_commission + ticket.other_charges
    ticket.remaining = ticket.total - ticket.paid

    await db.commit()
    await db.refresh(ticket)

    stmt = select(Ticket).where(Ticket.id == ticket.id).options(
        selectinload(Ticket.candidate).options(*LOAD_CANDIDATE_OPTIONS), selectinload(Ticket.agent)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.patch("/{ticket_id}/status", response_model=TicketResponse)
async def update_ticket_status(
    ticket_id: int,
    data: TicketStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("tickets.edit")),
):
    stmt = select(Ticket).where(Ticket.id == ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise NotFoundException("Ticket not found")

    ticket.status = data.status
    await db.commit()
    await db.refresh(ticket)

    stmt = select(Ticket).where(Ticket.id == ticket.id).options(
        selectinload(Ticket.candidate).options(*LOAD_CANDIDATE_OPTIONS), selectinload(Ticket.agent)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.delete("/{ticket_id}")
async def delete_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("tickets.delete")),
):
    stmt = select(Ticket).where(Ticket.id == ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise NotFoundException("Ticket not found")
    
    # Delete associated ledger entries
    delete_ledger = select(LedgerEntry).where(
        LedgerEntry.reference_type == "ticket",
        LedgerEntry.reference_id == ticket_id,
    )
    ledger_result = await db.execute(delete_ledger)
    for entry in ledger_result.scalars().all():
        await db.delete(entry)
    
    await db.delete(ticket)
    await db.commit()
    return {"message": "Ticket deleted successfully", "success": True}
