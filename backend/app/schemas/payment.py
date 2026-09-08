from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.schemas.agent import AgentResponse
from app.schemas.candidate import CandidateResponse


class PaymentBase(BaseModel):
    candidate_id: int | None = None
    agent_id: int | None = None
    payment_date: datetime
    payment_type: str = Field(..., pattern=r"^(full|partial|advance|refund|adjustment)$")
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    payment_method: str = Field(..., pattern=r"^(cash|bank_transfer|online_transfer|other)$")
    reference_number: str | None = Field(None, max_length=50)
    description: str | None = Field(None, max_length=500)
    remarks: str | None = Field(None, max_length=500)

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Payment amount must be greater than 0")
        if v > 999999999:
            raise ValueError("Amount is too large")
        return round(v, 2)


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    candidate_id: int | None = None
    agent_id: int | None = None
    payment_date: datetime | None = None
    payment_type: str | None = Field(None, pattern=r"^(full|partial|advance|refund|adjustment)$")
    amount: float | None = Field(None, gt=0)
    payment_method: str | None = Field(None, pattern=r"^(cash|bank_transfer|online_transfer|other)$")
    reference_number: str | None = Field(None, max_length=50)
    description: str | None = Field(None, max_length=500)
    remarks: str | None = Field(None, max_length=500)


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
