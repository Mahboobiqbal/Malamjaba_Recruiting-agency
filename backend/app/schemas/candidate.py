from datetime import date, datetime

from pydantic import BaseModel

from app.schemas.agent import AgentResponse


class CandidateBase(BaseModel):
    full_name: str
    father_name: str | None = None
    cnic: str | None = None
    passport_number: str
    passport_issue_date: date | None = None
    passport_expiry_date: date | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    mobile: str
    alternate_mobile: str | None = None
    address: str | None = None
    city: str | None = None
    country: str | None = None
    profession: str | None = None
    employer: str | None = None
    job_visa_category: str | None = None
    agent_id: int | None = None
    reference: str | None = None
    notes: str | None = None


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(BaseModel):
    full_name: str | None = None
    father_name: str | None = None
    cnic: str | None = None
    passport_number: str | None = None
    passport_issue_date: date | None = None
    passport_expiry_date: date | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    mobile: str | None = None
    alternate_mobile: str | None = None
    address: str | None = None
    city: str | None = None
    country: str | None = None
    profession: str | None = None
    employer: str | None = None
    job_visa_category: str | None = None
    agent_id: int | None = None
    reference: str | None = None
    notes: str | None = None


class CandidateResponse(CandidateBase):
    id: int
    candidate_code: str
    registration_date: date
    status: str
    created_by: int | None
    created_at: datetime
    updated_at: datetime
    agent: AgentResponse | None = None

    model_config = {"from_attributes": True}


class CandidateListResponse(BaseModel):
    items: list[CandidateResponse]
    total: int
    page: int
    per_page: int


class CandidateStatusUpdate(BaseModel):
    status: str
