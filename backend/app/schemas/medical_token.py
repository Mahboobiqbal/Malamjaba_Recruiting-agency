from datetime import date, datetime

from pydantic import BaseModel

from app.schemas.agent import AgentResponse
from app.schemas.candidate import CandidateResponse


class MedicalTokenBase(BaseModel):
    candidate_id: int
    token_number: str | None = None
    agent_id: int | None = None
    medical_center: str | None = None
    medical_date: date | None = None
    appointment_date: date | None = None
    medical_fee: float = 0
    payment_status: str = "unpaid"
    medical_status: str = "pending"
    remarks: str | None = None


class MedicalTokenCreate(MedicalTokenBase):
    pass


class MedicalTokenUpdate(BaseModel):
    token_number: str | None = None
    agent_id: int | None = None
    medical_center: str | None = None
    medical_date: date | None = None
    appointment_date: date | None = None
    medical_fee: float | None = None
    payment_status: str | None = None
    medical_status: str | None = None
    remarks: str | None = None


class MedicalTokenResponse(MedicalTokenBase):
    id: int
    token_code: str
    created_by: int | None
    created_at: datetime
    updated_at: datetime
    candidate: CandidateResponse | None = None
    agent: AgentResponse | None = None

    model_config = {"from_attributes": True}


class MedicalTokenListResponse(BaseModel):
    items: list[MedicalTokenResponse]
    total: int
    page: int
    per_page: int


class MedicalTokenStatusUpdate(BaseModel):
    medical_status: str | None = None
    payment_status: str | None = None
