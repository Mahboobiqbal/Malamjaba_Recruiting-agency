from datetime import datetime

from pydantic import BaseModel, Field, field_validator, model_validator

from app.schemas.agent import AgentResponse
from app.schemas.candidate import CandidateResponse


class VisaMinimal(BaseModel):
    id: int
    visa_code: str
    visa_type: str | None = None
    country: str | None = None
    total_cost: float
    paid_amount: float
    remaining_amount: float
    model_config = {"from_attributes": True}


class TicketMinimal(BaseModel):
    id: int
    ticket_code: str
    airline: str | None = None
    departure_airport: str | None = None
    arrival_airport: str | None = None
    total: float
    paid: float
    remaining: float
    model_config = {"from_attributes": True}


class MedicalTokenMinimal(BaseModel):
    id: int
    token_code: str
    medical_center: str | None = None
    medical_fee: float
    payment_status: str
    model_config = {"from_attributes": True}


class PaymentBase(BaseModel):
    candidate_id: int | None = None
    agent_id: int | None = None
    visa_id: int | None = None
    ticket_id: int | None = None
    medical_token_id: int | None = None
    payment_date: datetime
    payment_type: str = Field(..., max_length=50)
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

    @model_validator(mode="after")
    def validate_payment_target(self):
        linked_targets = [self.visa_id, self.ticket_id, self.medical_token_id]
        if sum(1 for target_id in linked_targets if target_id is not None) > 1:
            raise ValueError("Select only one linked payment target")
        if self.candidate_id is None and not any(target_id is not None for target_id in linked_targets):
            raise ValueError("Select a candidate or a linked payment target")
        return self


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    candidate_id: int | None = None
    agent_id: int | None = None
    visa_id: int | None = None
    ticket_id: int | None = None
    medical_token_id: int | None = None
    payment_date: datetime | None = None
    payment_type: str | None = Field(None, max_length=50)
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
    visa: VisaMinimal | None = None
    ticket: TicketMinimal | None = None
    medical_token: MedicalTokenMinimal | None = None

    model_config = {"from_attributes": True}


class PaymentListResponse(BaseModel):
    items: list[PaymentResponse]
    total: int
    page: int
    per_page: int
