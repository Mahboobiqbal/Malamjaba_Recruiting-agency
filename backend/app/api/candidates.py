from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_permission
from app.models.candidate import Candidate
from app.models.agent import Agent
from app.models.medical_token import MedicalToken
from app.models.visa import Visa
from app.models.ticket import Ticket
from app.models.payment import Payment
from app.models.user import User
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateResponse, CandidateListResponse, CandidateStatusUpdate
from app.services.number_generator import generate_candidate_code
from app.core.exceptions import NotFoundException, DuplicateException

router = APIRouter(prefix="/candidates", tags=["Candidates"])

LOAD_CANDIDATE_OPTIONS = [
    selectinload(Candidate.agent),
    selectinload(Candidate.medical_tokens),
    selectinload(Candidate.visas),
    selectinload(Candidate.tickets),
    selectinload(Candidate.payments),
]


@router.get("", response_model=CandidateListResponse)
async def list_candidates(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    status: str = Query(None),
    agent_id: int = Query(None),
    country: str = Query(None),
    date_from: str = Query(None),
    date_to: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.view")),
):
    stmt = select(Candidate).options(*LOAD_CANDIDATE_OPTIONS)
    count_stmt = select(func.count()).select_from(Candidate)

    if search:
        like_term = f"%{search}%"
        condition = or_(
            Candidate.full_name.ilike(like_term),
            Candidate.passport_number.ilike(like_term),
            Candidate.cnic.ilike(like_term),
            Candidate.mobile.ilike(like_term),
            Candidate.candidate_code.ilike(like_term),
        )
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)

    if status:
        stmt = stmt.where(Candidate.status == status)
        count_stmt = count_stmt.where(Candidate.status == status)

    if agent_id:
        stmt = stmt.where(Candidate.agent_id == agent_id)
        count_stmt = count_stmt.where(Candidate.agent_id == agent_id)

    if country:
        stmt = stmt.where(Candidate.country == country)
        count_stmt = count_stmt.where(Candidate.country == country)

    if date_from:
        stmt = stmt.where(Candidate.created_at >= date_from)
        count_stmt = count_stmt.where(Candidate.created_at >= date_from)
    if date_to:
        stmt = stmt.where(Candidate.created_at <= date_to + " 23:59:59")
        count_stmt = count_stmt.where(Candidate.created_at <= date_to + " 23:59:59")

    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.order_by(Candidate.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    candidates = result.scalars().all()

    return CandidateListResponse(items=candidates, total=total, page=page, per_page=per_page)


@router.post("", response_model=CandidateResponse)
async def create_candidate(
    data: CandidateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.create")),
):
    existing = await db.execute(select(Candidate).where(Candidate.passport_number == data.passport_number))
    if existing.scalar_one_or_none():
        raise DuplicateException("Candidate with this passport number already exists")

    candidate_code = await generate_candidate_code(db)
    candidate = Candidate(
        candidate_code=candidate_code,
        created_by=current_user.id,
        **data.model_dump(),
    )
    db.add(candidate)
    await db.commit()
    await db.refresh(candidate)

    stmt = select(Candidate).where(Candidate.id == candidate.id).options(*LOAD_CANDIDATE_OPTIONS)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(
    candidate_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.view")),
):
    stmt = (
        select(Candidate)
        .where(Candidate.id == candidate_id)
        .options(*LOAD_CANDIDATE_OPTIONS)
    )
    result = await db.execute(stmt)
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise NotFoundException("Candidate not found")
    return candidate


@router.put("/{candidate_id}", response_model=CandidateResponse)
async def update_candidate(
    candidate_id: int,
    data: CandidateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.edit")),
):
    stmt = select(Candidate).where(Candidate.id == candidate_id)
    result = await db.execute(stmt)
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise NotFoundException("Candidate not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(candidate, key, value)

    await db.commit()
    await db.refresh(candidate)

    stmt = select(Candidate).where(Candidate.id == candidate.id).options(*LOAD_CANDIDATE_OPTIONS)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.patch("/{candidate_id}/status", response_model=CandidateResponse)
async def update_candidate_status(
    candidate_id: int,
    data: CandidateStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.edit")),
):
    stmt = select(Candidate).where(Candidate.id == candidate_id)
    result = await db.execute(stmt)
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise NotFoundException("Candidate not found")

    candidate.status = data.status
    await db.commit()
    await db.refresh(candidate)

    stmt = select(Candidate).where(Candidate.id == candidate.id).options(*LOAD_CANDIDATE_OPTIONS)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.delete("/{candidate_id}")
async def delete_candidate(
    candidate_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.delete")),
):
    stmt = select(Candidate).where(Candidate.id == candidate_id)
    result = await db.execute(stmt)
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise NotFoundException("Candidate not found")
    await db.delete(candidate)
    await db.commit()
    return {"message": "Candidate deleted successfully", "success": True}
