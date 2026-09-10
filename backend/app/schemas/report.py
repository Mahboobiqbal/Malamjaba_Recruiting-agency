from datetime import date

from pydantic import BaseModel

from app.schemas.agent import AgentResponse


class DashboardSummary(BaseModel):
    total_candidates: int = 0
    new_candidates: int = 0
    medical_pending: int = 0
    medical_completed: int = 0
    visa_processing: int = 0
    visa_approved: int = 0
    tickets_booked: int = 0
    pending_payments: int = 0
    today_payments: float = 0
    outstanding_balances: float = 0
    total_received: float = 0
    total_pending: float = 0
    total_expenses: float = 0
    total_agent_commission: float = 0
    net_amount: float = 0


class DateRangeParams(BaseModel):
    start_date: date | None = None
    end_date: date | None = None


class AgentReportResponse(BaseModel):
    agent: AgentResponse
    candidate_count: int
    total_commission: float
    total_paid: float
    outstanding: float


class FinancialReportResponse(BaseModel):
    date: str
    total_received: float
    total_expenses: float
    net_profit: float
