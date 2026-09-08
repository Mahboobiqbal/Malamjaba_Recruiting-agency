import re
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator


CNIC_REGEX = r"^\d{5}-\d{7}-\d$"
PAK_MOBILE_REGEX = r"^(?:\+92|92|0)?3[0-9]{9}$"


class AgentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Agent full name")
    father_name: str | None = Field(None, max_length=100)
    cnic: str = Field(..., description="CNIC in format XXXXX-XXXXXXX-X")
    mobile: str = Field(..., description="Pakistani mobile number")
    whatsapp: str | None = None
    address: str | None = Field(None, max_length=500)
    city: str | None = Field(None, max_length=50)
    email: str | None = None
    commission_rate: float = Field(0, ge=0, le=100, description="Commission rate 0-100%")
    bank_info: str | None = Field(None, max_length=500)
    status: str = Field("active", pattern=r"^(active|inactive|blocked)$")
    notes: str | None = Field(None, max_length=1000)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        if not re.match(r"^[a-zA-Z\s\-\.]+$", v):
            raise ValueError("Name must contain only letters, spaces, hyphens, and dots")
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
    def validate_cnic(cls, v: str) -> str:
        v = v.strip().replace(" ", "")
        if not re.match(CNIC_REGEX, v):
            raise ValueError("CNIC must be in format XXXXX-XXXXXXX-X (e.g., 35202-1234567-1)")
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

    @field_validator("whatsapp")
    @classmethod
    def validate_whatsapp(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip().replace(" ", "").replace("-", "")
            if v and not re.match(PAK_MOBILE_REGEX, v):
                raise ValueError("Invalid WhatsApp number (same format as mobile)")
            if v:
                if v.startswith("0"):
                    v = "+92" + v[1:]
                elif not v.startswith("+"):
                    v = "+" + v
        return v or None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip().lower()
            if v and not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", v):
                raise ValueError("Invalid email address")
        return v or None


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    father_name: str | None = None
    cnic: str | None = None
    mobile: str | None = None
    whatsapp: str | None = None
    address: str | None = Field(None, max_length=500)
    city: str | None = Field(None, max_length=50)
    email: str | None = None
    commission_rate: float | None = Field(None, ge=0, le=100)
    bank_info: str | None = Field(None, max_length=500)
    status: str | None = Field(None, pattern=r"^(active|inactive|blocked)$")
    notes: str | None = Field(None, max_length=1000)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Name cannot be empty")
            if not re.match(r"^[a-zA-Z\s\-\.]+$", v):
                raise ValueError("Name must contain only letters, spaces, hyphens, and dots")
        return v

    @field_validator("cnic")
    @classmethod
    def validate_cnic(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip().replace(" ", "")
            if not re.match(CNIC_REGEX, v):
                raise ValueError("CNIC must be in format XXXXX-XXXXXXX-X")
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

    @field_validator("whatsapp")
    @classmethod
    def validate_whatsapp(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip().replace(" ", "").replace("-", "")
            if v and not re.match(PAK_MOBILE_REGEX, v):
                raise ValueError("Invalid WhatsApp number")
            if v:
                if v.startswith("0"):
                    v = "+92" + v[1:]
                elif not v.startswith("+"):
                    v = "+" + v
        return v or None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip().lower()
            if v and not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", v):
                raise ValueError("Invalid email address")
        return v or None


class AgentResponse(AgentBase):
    id: int
    agent_code: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AgentListResponse(BaseModel):
    items: list[AgentResponse]
    total: int
    page: int
    per_page: int


class AgentStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(active|inactive|blocked)$")


class AgentCandidateSummary(BaseModel):
    id: int
    candidate_code: str
    full_name: str
    passport_number: str
    mobile: str
    status: str
    registration_date: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AgentModuleSummary(BaseModel):
    code: str
    candidate_name: str
    status: str
    amount: float
    date: str | None = None


class AgentDetailsResponse(AgentResponse):
    candidates: list[AgentCandidateSummary] = []
    medical_tokens: list[AgentModuleSummary] = []
    visas: list[AgentModuleSummary] = []
    tickets: list[AgentModuleSummary] = []
    payments: list[AgentModuleSummary] = []
    stats: dict = {}
