from datetime import datetime

from pydantic import BaseModel

from app.schemas.candidate import CandidateResponse


class LedgerEntryBase(BaseModel):
    candidate_id: int
    entry_type: str
    reference_type: str | None = None
    reference_id: int | None = None
    description: str
    debit: float = 0
    credit: float = 0


class LedgerEntryResponse(LedgerEntryBase):
    id: int
    balance: float
    created_by: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class LedgerSummary(BaseModel):
    total_charges: float
    total_payments: float
    balance: float


class CandidateLedgerResponse(BaseModel):
    candidate: CandidateResponse
    entries: list[LedgerEntryResponse]
    summary: LedgerSummary
