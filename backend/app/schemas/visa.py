from datetime import date, datetime

from pydantic import BaseModel

from app.schemas.agent import AgentResponse
from app.schemas.candidate import CandidateResponse


class VisaBase(BaseModel):
    candidate_id: int
    agent_id: int | None = None
    visa_type: str | None = None
    country: str | None = None
    visa_number: str | None = None
    reference_number: str | None = None
    issue_date: date | None = None
    expiry_date: date | None = None
    status: str = "processing"
    profession: str | None = None
    employer: str | None = None
    sponsor: str | None = None
    wakala_reference: str | None = None
    visa_fee: float = 0
    agent_fee: float = 0
    other_charges: float = 0
    remarks: str | None = None


class VisaCreate(VisaBase):
    pass


class VisaUpdate(BaseModel):
    agent_id: int | None = None
    visa_type: str | None = None
    country: str | None = None
    visa_number: str | None = None
    reference_number: str | None = None
    issue_date: date | None = None
    expiry_date: date | None = None
    status: str | None = None
    profession: str | None = None
    employer: str | None = None
    sponsor: str | None = None
    wakala_reference: str | None = None
    visa_fee: float | None = None
    agent_fee: float | None = None
    other_charges: float | None = None
    remarks: str | None = None


class VisaResponse(VisaBase):
    id: int
    visa_code: str
    total_cost: float
    paid_amount: float
    remaining_amount: float
    created_by: int | None
    created_at: datetime
    updated_at: datetime
    candidate: CandidateResponse | None = None
    agent: AgentResponse | None = None

    model_config = {"from_attributes": True}


class VisaListResponse(BaseModel):
    items: list[VisaResponse]
    total: int
    page: int
    per_page: int


class VisaStatusUpdate(BaseModel):
    status: str
