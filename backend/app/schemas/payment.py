from datetime import datetime

from pydantic import BaseModel

from app.schemas.agent import AgentResponse
from app.schemas.candidate import CandidateResponse


class PaymentBase(BaseModel):
    candidate_id: int | None = None
    agent_id: int | None = None
    payment_date: datetime
    payment_type: str
    amount: float
    payment_method: str
    reference_number: str | None = None
    description: str | None = None
    remarks: str | None = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    candidate_id: int | None = None
    agent_id: int | None = None
    payment_date: datetime | None = None
    payment_type: str | None = None
    amount: float | None = None
    payment_method: str | None = None
    reference_number: str | None = None
    description: str | None = None
    remarks: str | None = None


class PaymentResponse(PaymentBase):
    id: int
    payment_code: str
    receipt_number: str
    received_by: int | None
    created_at: datetime
    candidate: CandidateResponse | None = None
    agent: AgentResponse | None = None

    model_config = {"from_attributes": True}


class PaymentListResponse(BaseModel):
    items: list[PaymentResponse]
    total: int
    page: int
    per_page: int
