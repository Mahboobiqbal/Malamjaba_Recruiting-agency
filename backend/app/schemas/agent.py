from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class AgentBase(BaseModel):
    name: str
    father_name: str | None = None
    cnic: str
    mobile: str
    whatsapp: str | None = None
    address: str | None = None
    city: str | None = None
    email: str | None = None
    commission_rate: float = 0
    bank_info: str | None = None
    status: str = "active"
    notes: str | None = None


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: str | None = None
    father_name: str | None = None
    cnic: str | None = None
    mobile: str | None = None
    whatsapp: str | None = None
    address: str | None = None
    city: str | None = None
    email: str | None = None
    commission_rate: float | None = None
    bank_info: str | None = None
    status: str | None = None
    notes: str | None = None


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
