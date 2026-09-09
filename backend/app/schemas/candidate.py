import re
from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator, model_validator

from app.schemas.agent import AgentResponse

CNIC_REGEX = r"^\d{5}-\d{7}-\d$"
PAK_MOBILE_REGEX = r"^(?:\+92|92|0)?3[0-9]{9}$"
PASSPORT_REGEX = r"^[A-Z0-9]{5,20}$"


class CandidateBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    father_name: str | None = Field(None, max_length=100)
    cnic: str | None = Field(None, description="CNIC in format XXXXX-XXXXXXX-X")
    passport_number: str = Field(..., min_length=5, max_length=20)
    passport_issue_date: date | None = None
    passport_expiry_date: date | None = None
    date_of_birth: date | None = None
    gender: str | None = Field(None, pattern=r"^(male|female)$")
    mobile: str = Field(..., description="Pakistani mobile number")
    alternate_mobile: str | None = None
    address: str | None = Field(None, max_length=500)
    city: str | None = Field(None, max_length=50)
    country: str | None = Field(None, max_length=50)
    profession: str | None = Field(None, max_length=100)
    employer: str | None = Field(None, max_length=100)
    job_visa_category: str | None = Field(None, max_length=50)
    agent_id: int | None = None
    reference: str | None = Field(None, max_length=100)
    notes: str | None = Field(None, max_length=1000)


class CandidateCreate(CandidateBase):
    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Full name is required")
        if not re.match(r"^[a-zA-Z\s\-\.]+$", v):
            raise ValueError("Full name must contain only letters, spaces, hyphens, and dots")
        return v

    @field_validator("father_name")
    @classmethod
    def validate_father_name(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if v and not re.match(r"^[a-zA-Z\s\-\.]+$", v):
                raise ValueError("Father name must contain only letters, spaces, hyphens, and dots")
        return v or None

    @field_validator("cnic")
    @classmethod
    def validate_cnic(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip().replace(" ", "")
            if v and not re.match(CNIC_REGEX, v):
                raise ValueError("CNIC must be in format XXXXX-XXXXXXX-X (e.g., 35202-1234567-1)")
        return v or None

    @field_validator("passport_number")
    @classmethod
    def validate_passport(cls, v: str) -> str:
        v = v.strip().upper()
        if not v:
            raise ValueError("Passport number is required")
        if not re.match(PASSPORT_REGEX, v):
            raise ValueError("Passport number must be 5-20 alphanumeric characters")
        return v

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        v = v.strip().replace(" ", "").replace("-", "")
        if not re.match(PAK_MOBILE_REGEX, v):
            raise ValueError("Invalid Pakistani mobile number (e.g., 03012345678 or +923012345678)")
        if v.startswith("0"):
            v = "+92" + v[1:]
        elif not v.startswith("+"):
            v = "+" + v
        return v

    @field_validator("alternate_mobile")
    @classmethod
    def validate_alternate_mobile(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip().replace(" ", "").replace("-", "")
            if v and not re.match(PAK_MOBILE_REGEX, v):
                raise ValueError("Invalid alternate mobile number")
            if v:
                if v.startswith("0"):
                    v = "+92" + v[1:]
                elif not v.startswith("+"):
                    v = "+" + v
        return v or None

    @field_validator("passport_issue_date", "passport_expiry_date", "date_of_birth")
    @classmethod
    def validate_dates(cls, v: date | None) -> date | None:
        if v is not None and v > date.today():
            raise ValueError("Date cannot be in the future")
        return v

    @model_validator(mode="after")
    def validate_date_logic(self):
        if self.passport_issue_date and self.passport_expiry_date:
            if self.passport_expiry_date <= self.passport_issue_date:
                raise ValueError("Passport expiry date must be after issue date")
        if self.date_of_birth:
            age = (date.today() - self.date_of_birth).days // 365
            if age < 18:
                raise ValueError("Candidate must be at least 18 years old")
            if age > 70:
                raise ValueError("Candidate age cannot exceed 70 years")
        return self


class CandidateUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=100)
    father_name: str | None = None
    cnic: str | None = None
    passport_number: str | None = Field(None, min_length=5, max_length=20)
    passport_issue_date: date | None = None
    passport_expiry_date: date | None = None
    date_of_birth: date | None = None
    gender: str | None = Field(None, pattern=r"^(male|female)$")
    mobile: str | None = None
    alternate_mobile: str | None = None
    address: str | None = Field(None, max_length=500)
    city: str | None = Field(None, max_length=50)
    country: str | None = Field(None, max_length=50)
    profession: str | None = Field(None, max_length=100)
    employer: str | None = Field(None, max_length=100)
    job_visa_category: str | None = Field(None, max_length=50)
    agent_id: int | None = None
    reference: str | None = Field(None, max_length=100)
    notes: str | None = Field(None, max_length=1000)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Full name cannot be empty")
            if not re.match(r"^[a-zA-Z\s\-\.]+$", v):
                raise ValueError("Full name must contain only letters, spaces, hyphens, and dots")
        return v

    @field_validator("cnic")
    @classmethod
    def validate_cnic(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip().replace(" ", "")
            if v and not re.match(CNIC_REGEX, v):
                raise ValueError("CNIC must be in format XXXXX-XXXXXXX-X")
        return v

    @field_validator("passport_number")
    @classmethod
    def validate_passport(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip().upper()
            if not v:
                raise ValueError("Passport number cannot be empty")
            if not re.match(PASSPORT_REGEX, v):
                raise ValueError("Passport number must be 5-20 alphanumeric characters")
        return v

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip().replace(" ", "").replace("-", "")
            if not re.match(PAK_MOBILE_REGEX, v):
                raise ValueError("Invalid Pakistani mobile number")
            if v.startswith("0"):
                v = "+92" + v[1:]
            elif not v.startswith("+"):
                v = "+" + v
        return v

    @field_validator("alternate_mobile")
    @classmethod
    def validate_alternate_mobile(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip().replace(" ", "").replace("-", "")
            if v and not re.match(PAK_MOBILE_REGEX, v):
                raise ValueError("Invalid alternate mobile number")
            if v:
                if v.startswith("0"):
                    v = "+92" + v[1:]
                elif not v.startswith("+"):
                    v = "+" + v
        return v

    @field_validator("passport_issue_date", "passport_expiry_date", "date_of_birth")
    @classmethod
    def validate_dates(cls, v: date | None) -> date | None:
        if v is not None and v > date.today():
            raise ValueError("Date cannot be in the future")
        return v


class CandidateStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(new|processing|medical_pending|medical_completed|visa_processing|visa_approved|ticket_pending|ticket_booked|ready_to_travel|completed|cancelled)$")


# Nested schemas for print document (avoid circular imports)
class MedicalTokenNested(BaseModel):
    id: int
    token_code: str
    token_number: str | None = None
    medical_center: str | None = None
    medical_date: date | None = None
    medical_fee: float
    payment_status: str
    medical_status: str
    model_config = {"from_attributes": True}


class VisaNested(BaseModel):
    id: int
    visa_code: str
    visa_type: str | None = None
    country: str | None = None
    visa_number: str | None = None
    status: str
    visa_fee: float
    agent_fee: float
    other_charges: float
    total_cost: float
    paid_amount: float
    remaining_amount: float
    model_config = {"from_attributes": True}


class TicketNested(BaseModel):
    id: int
    ticket_code: str
    airline: str | None = None
    pnr: str | None = None
    ticket_number: str | None = None
    flight_number: str | None = None
    departure_airport: str | None = None
    arrival_airport: str | None = None
    departure_date: date | None = None
    departure_time: str | None = None
    ticket_price: float
    agent_commission: float
    other_charges: float
    total: float
    paid: float
    remaining: float
    status: str
    model_config = {"from_attributes": True}


class PaymentNested(BaseModel):
    id: int
    payment_code: str
    receipt_number: str
    payment_date: datetime
    payment_type: str
    amount: float
    payment_method: str
    reference_number: str | None = None
    description: str | None = None
    model_config = {"from_attributes": True}


class CandidateResponse(CandidateBase):
    id: int
    candidate_code: str
    registration_date: date
    status: str
    created_by: int | None
    created_at: datetime
    updated_at: datetime
    agent: AgentResponse | None = None
    medical_tokens: list[MedicalTokenNested] = []
    visas: list[VisaNested] = []
    tickets: list[TicketNested] = []
    payments: list[PaymentNested] = []

    model_config = {"from_attributes": True}


class CandidateListResponse(BaseModel):
    items: list[CandidateResponse]
    total: int
    page: int
    per_page: int
