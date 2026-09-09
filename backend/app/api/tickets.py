from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_permission
from app.models.ticket import Ticket
from app.models.candidate import Candidate
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketResponse, TicketListResponse, TicketStatusUpdate
from app.services.number_generator import generate_ticket_code
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/tickets", tags=["Tickets"])


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
        selectinload(Ticket.candidate).selectinload(Candidate.agent),
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
    ticket_code = await generate_ticket_code(db)
    total = data.ticket_price + data.agent_commission + data.other_charges
    ticket = Ticket(
        ticket_code=ticket_code,
        created_by=current_user.id,
        total=total,
        remaining=total,
        **data.model_dump(),
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    stmt = select(Ticket).where(Ticket.id == ticket.id).options(
        selectinload(Ticket.candidate).selectinload(Candidate.agent), selectinload(Ticket.agent)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("tickets.view")),
):
    stmt = select(Ticket).where(Ticket.id == ticket_id).options(
        selectinload(Ticket.candidate).selectinload(Candidate.agent), selectinload(Ticket.agent)
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
        selectinload(Ticket.candidate).selectinload(Candidate.agent), selectinload(Ticket.agent)
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
        selectinload(Ticket.candidate).selectinload(Candidate.agent), selectinload(Ticket.agent)
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
    await db.delete(ticket)
    await db.commit()
    return {"message": "Ticket deleted successfully", "success": True}
