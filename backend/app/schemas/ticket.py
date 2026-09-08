from datetime import date, datetime

from pydantic import BaseModel

from app.schemas.agent import AgentResponse
from app.schemas.candidate import CandidateResponse


class TicketBase(BaseModel):
    candidate_id: int
    agent_id: int | None = None
    airline: str | None = None
    pnr: str | None = None
    ticket_number: str | None = None
    flight_number: str | None = None
    departure_airport: str | None = None
    arrival_airport: str | None = None
    departure_date: date | None = None
    departure_time: str | None = None
    arrival_date: date | None = None
    arrival_time: str | None = None
    baggage_allowance: str | None = None
    ticket_class: str | None = None
    ticket_price: float = 0
    agent_commission: float = 0
    other_charges: float = 0
    status: str = "pending"
    remarks: str | None = None


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    agent_id: int | None = None
    airline: str | None = None
    pnr: str | None = None
    ticket_number: str | None = None
    flight_number: str | None = None
    departure_airport: str | None = None
    arrival_airport: str | None = None
    departure_date: date | None = None
    departure_time: str | None = None
    arrival_date: date | None = None
    arrival_time: str | None = None
    baggage_allowance: str | None = None
    ticket_class: str | None = None
    ticket_price: float | None = None
    agent_commission: float | None = None
    other_charges: float | None = None
    status: str | None = None
    remarks: str | None = None


class TicketResponse(TicketBase):
    id: int
    ticket_code: str
    total: float
    paid: float
    remaining: float
    created_by: int | None
    created_at: datetime
    updated_at: datetime
    candidate: CandidateResponse | None = None
    agent: AgentResponse | None = None

    model_config = {"from_attributes": True}


class TicketListResponse(BaseModel):
    items: list[TicketResponse]
    total: int
    page: int
    per_page: int


class TicketStatusUpdate(BaseModel):
    status: str
