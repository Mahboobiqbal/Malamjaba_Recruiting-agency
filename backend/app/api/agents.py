from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_permission
from app.models.agent import Agent
from app.models.candidate import Candidate
from app.models.medical_token import MedicalToken
from app.models.visa import Visa
from app.models.ticket import Ticket
from app.models.payment import Payment
from app.models.user import User
from app.schemas.agent import AgentCreate, AgentUpdate, AgentResponse, AgentListResponse, AgentDetailsResponse, AgentCandidateSummary, AgentModuleSummary, AgentStatusUpdate
from app.services.number_generator import generate_agent_code
from app.core.exceptions import NotFoundException, DuplicateException

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get("", response_model=AgentListResponse)
async def list_agents(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    status: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("agents.view")),
):
    stmt = select(Agent)
    count_stmt = select(func.count()).select_from(Agent)

    if search:
        like_term = f"%{search}%"
        condition = Agent.name.ilike(like_term) | Agent.cnic.ilike(like_term) | Agent.mobile.ilike(like_term)
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)

    if status:
        stmt = stmt.where(Agent.status == status)
        count_stmt = count_stmt.where(Agent.status == status)

    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.order_by(Agent.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    agents = result.scalars().all()

    return AgentListResponse(items=agents, total=total, page=page, per_page=per_page)


@router.post("", response_model=AgentResponse)
async def create_agent(
    data: AgentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("agents.create")),
):
    existing = await db.execute(select(Agent).where(Agent.cnic == data.cnic))
    if existing.scalar_one_or_none():
        raise DuplicateException("Agent with this CNIC already exists")

    agent_code = await generate_agent_code(db)
    agent = Agent(agent_code=agent_code, **data.model_dump())
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return agent


@router.get("/{agent_id}/details", response_model=AgentDetailsResponse)
async def get_agent_details(
    agent_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("agents.view")),
):
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        raise NotFoundException("Agent not found")

    agent_data = AgentDetailsResponse(
        id=agent.id,
        agent_code=agent.agent_code,
        name=agent.name,
        father_name=agent.father_name,
        cnic=agent.cnic,
        mobile=agent.mobile,
        whatsapp=agent.whatsapp,
        address=agent.address,
        city=agent.city,
        email=agent.email,
        commission_rate=float(agent.commission_rate),
        bank_info=agent.bank_info,
        status=agent.status,
        notes=agent.notes,
        created_at=agent.created_at,
        updated_at=agent.updated_at,
    )

    candidates_result = await db.execute(
        select(Candidate).where(Candidate.agent_id == agent_id).order_by(Candidate.created_at.desc())
    )
    candidates = candidates_result.scalars().all()
    agent_data.candidates = [
        AgentCandidateSummary(
            id=c.id,
            candidate_code=c.candidate_code,
            full_name=c.full_name,
            passport_number=c.passport_number,
            mobile=c.mobile,
            status=c.status,
            registration_date=c.registration_date,
            created_at=c.created_at,
        ) for c in candidates
    ]

    candidate_ids = [c.id for c in candidates]

    medical_result = await db.execute(
        select(MedicalToken).where(MedicalToken.agent_id == agent_id).order_by(MedicalToken.created_at.desc())
    )
    medical_tokens = medical_result.scalars().all()
    agent_data.medical_tokens = [
        AgentModuleSummary(
            code=m.token_code,
            candidate_name=next((c.full_name for c in candidates if c.id == m.candidate_id), "N/A"),
            status=m.medical_status,
            amount=float(m.medical_fee),
            date=str(m.medical_date) if m.medical_date else None,
        )
        for m in medical_tokens
    ]

    visa_result = await db.execute(
        select(Visa).where(Visa.agent_id == agent_id).order_by(Visa.created_at.desc())
    )
    visas = visa_result.scalars().all()
    agent_data.visas = [
        AgentModuleSummary(
            code=v.visa_code,
            candidate_name=next((c.full_name for c in candidates if c.id == v.candidate_id), "N/A"),
            status=v.status,
            amount=float(v.total_cost),
            date=str(v.created_at) if v.created_at else None,
        )
        for v in visas
    ]

    ticket_result = await db.execute(
        select(Ticket).where(Ticket.agent_id == agent_id).order_by(Ticket.created_at.desc())
    )
    tickets = ticket_result.scalars().all()
    agent_data.tickets = [
        AgentModuleSummary(
            code=t.ticket_code,
            candidate_name=next((c.full_name for c in candidates if c.id == t.candidate_id), "N/A"),
            status=t.status,
            amount=float(t.total),
            date=str(t.created_at) if t.created_at else None,
        )
        for t in tickets
    ]

    payment_result = await db.execute(
        select(Payment).where(Payment.agent_id == agent_id).order_by(Payment.created_at.desc())
    )
    payments = payment_result.scalars().all()
    agent_data.payments = [
        AgentModuleSummary(
            code=p.payment_code,
            candidate_name=next((c.full_name for c in candidates if c.id == p.candidate_id), "N/A"),
            status=p.payment_type,
            amount=float(p.amount),
            date=str(p.payment_date) if p.payment_date else None,
        )
        for p in payments
    ]

    total_candidates = len(candidates)
    total_medical = len(medical_tokens)
    total_visas = len(visas)
    total_tickets = len(tickets)
    total_payments = len(payments)
    total_paid = sum(float(p.amount) for p in payments)

    agent_data.stats = {
        "total_candidates": total_candidates,
        "total_medical": total_medical,
        "total_visas": total_visas,
        "total_tickets": total_tickets,
        "total_payments": total_payments,
        "total_paid": total_paid,
    }

    return agent_data


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("agents.view")),
):
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        raise NotFoundException("Agent not found")
    return agent


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: int,
    data: AgentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("agents.edit")),
):
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        raise NotFoundException("Agent not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(agent, key, value)

    await db.commit()
    await db.refresh(agent)
    return agent


@router.patch("/{agent_id}/status", response_model=AgentResponse)
async def update_agent_status(
    agent_id: int,
    data: AgentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("agents.edit")),
):
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        raise NotFoundException("Agent not found")

    agent.status = data.status
    await db.commit()
    await db.refresh(agent)
    return agent


@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("agents.delete")),
):
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        raise NotFoundException("Agent not found")
    await db.delete(agent)
    await db.commit()
    return {"message": "Agent deleted successfully", "success": True}
