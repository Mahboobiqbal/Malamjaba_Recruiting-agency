from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_permission
from app.models.candidate import Candidate
from app.models.ledger import LedgerEntry
from app.models.user import User
from app.schemas.ledger import LedgerEntryResponse, LedgerSummary, CandidateLedgerResponse
from app.schemas.candidate import CandidateResponse

router = APIRouter(prefix="/ledger", tags=["Ledger"])


@router.get("/candidate/{candidate_id}")
async def get_candidate_ledger(
    candidate_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.view")),
):
    stmt = select(Candidate).where(Candidate.id == candidate_id).options(selectinload(Candidate.agent))
    result = await db.execute(stmt)
    candidate = result.scalar_one_or_none()
    if not candidate:
        return {"detail": "Candidate not found"}, 404

    entries_stmt = (
        select(LedgerEntry)
        .where(LedgerEntry.candidate_id == candidate_id)
        .order_by(LedgerEntry.created_at)
    )
    entries_result = await db.execute(entries_stmt)
    entries = entries_result.scalars().all()

    total_charges = sum(float(e.debit) for e in entries)
    total_payments = sum(float(e.credit) for e in entries)
    balance = total_charges - total_payments

    return {
        "candidate": CandidateResponse.model_validate(candidate),
        "entries": [LedgerEntryResponse.model_validate(e) for e in entries],
        "summary": LedgerSummary(
            total_charges=total_charges,
            total_payments=total_payments,
            balance=balance,
        ),
    }
