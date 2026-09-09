from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_permission
from app.models.medical_token import MedicalToken
from app.models.candidate import Candidate
from app.models.user import User
from app.schemas.medical_token import MedicalTokenCreate, MedicalTokenUpdate, MedicalTokenResponse, MedicalTokenListResponse, MedicalTokenStatusUpdate
from app.services.number_generator import generate_token_code
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/medical-tokens", tags=["Medical Tokens"])


@router.get("", response_model=MedicalTokenListResponse)
async def list_medical_tokens(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    medical_status: str = Query(None),
    payment_status: str = Query(None),
    date_from: str = Query(None),
    date_to: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("medical.view")),
):
    stmt = select(MedicalToken).options(
        selectinload(MedicalToken.candidate).selectinload(Candidate.agent),
        selectinload(MedicalToken.agent),
    )
    count_stmt = select(func.count()).select_from(MedicalToken)

    if search:
        like_term = f"%{search}%"
        condition = MedicalToken.token_code.ilike(like_term) | MedicalToken.token_number.ilike(like_term)
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)

    if medical_status:
        stmt = stmt.where(MedicalToken.medical_status == medical_status)
        count_stmt = count_stmt.where(MedicalToken.medical_status == medical_status)

    if payment_status:
        stmt = stmt.where(MedicalToken.payment_status == payment_status)
        count_stmt = count_stmt.where(MedicalToken.payment_status == payment_status)

    if date_from:
        stmt = stmt.where(MedicalToken.created_at >= date_from)
        count_stmt = count_stmt.where(MedicalToken.created_at >= date_from)
    if date_to:
        stmt = stmt.where(MedicalToken.created_at <= date_to + " 23:59:59")
        count_stmt = count_stmt.where(MedicalToken.created_at <= date_to + " 23:59:59")

    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.order_by(MedicalToken.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    items = result.scalars().all()

    return MedicalTokenListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("", response_model=MedicalTokenResponse)
async def create_medical_token(
    data: MedicalTokenCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("medical.create")),
):
    token_code = await generate_token_code(db)
    token = MedicalToken(token_code=token_code, created_by=current_user.id, **data.model_dump())
    db.add(token)
    await db.commit()
    await db.refresh(token)

    stmt = select(MedicalToken).where(MedicalToken.id == token.id).options(
        selectinload(MedicalToken.candidate).selectinload(Candidate.agent), selectinload(MedicalToken.agent)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/{token_id}", response_model=MedicalTokenResponse)
async def get_medical_token(
    token_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("medical.view")),
):
    stmt = select(MedicalToken).where(MedicalToken.id == token_id).options(
        selectinload(MedicalToken.candidate).selectinload(Candidate.agent), selectinload(MedicalToken.agent)
    )
    result = await db.execute(stmt)
    token = result.scalar_one_or_none()
    if not token:
        raise NotFoundException("Medical token not found")
    return token


@router.put("/{token_id}", response_model=MedicalTokenResponse)
async def update_medical_token(
    token_id: int,
    data: MedicalTokenUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("medical.edit")),
):
    stmt = select(MedicalToken).where(MedicalToken.id == token_id)
    result = await db.execute(stmt)
    token = result.scalar_one_or_none()
    if not token:
        raise NotFoundException("Medical token not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(token, key, value)

    await db.commit()
    await db.refresh(token)

    stmt = select(MedicalToken).where(MedicalToken.id == token.id).options(
        selectinload(MedicalToken.candidate).selectinload(Candidate.agent), selectinload(MedicalToken.agent)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.patch("/{token_id}/status", response_model=MedicalTokenResponse)
async def update_medical_token_status(
    token_id: int,
    data: MedicalTokenStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("medical.edit")),
):
    stmt = select(MedicalToken).where(MedicalToken.id == token_id)
    result = await db.execute(stmt)
    token = result.scalar_one_or_none()
    if not token:
        raise NotFoundException("Medical token not found")

    if data.medical_status is not None:
        token.medical_status = data.medical_status
    if data.payment_status is not None:
        token.payment_status = data.payment_status
    await db.commit()
    await db.refresh(token)

    stmt = select(MedicalToken).where(MedicalToken.id == token.id).options(
        selectinload(MedicalToken.candidate).selectinload(Candidate.agent), selectinload(MedicalToken.agent)
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.delete("/{token_id}")
async def delete_medical_token(
    token_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("medical.delete")),
):
    stmt = select(MedicalToken).where(MedicalToken.id == token_id)
    result = await db.execute(stmt)
    token = result.scalar_one_or_none()
    if not token:
        raise NotFoundException("Medical token not found")
    await db.delete(token)
    await db.commit()
    return {"message": "Medical token deleted successfully", "success": True}
