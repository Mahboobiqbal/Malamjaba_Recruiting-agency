from datetime import date, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_permission
from app.models.candidate import Candidate
from app.models.payment import Payment
from app.models.expense import Expense
from app.models.medical_token import MedicalToken
from app.models.visa import Visa
from app.models.ticket import Ticket
from app.models.agent import Agent
from app.models.ledger import LedgerEntry
from app.models.user import User
from app.schemas.report import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardSummary)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("candidates.view")),
):
    total_candidates = (await db.execute(select(func.count()).select_from(Candidate))).scalar() or 0

    new_candidates = (await db.execute(
        select(func.count()).select_from(Candidate).where(Candidate.status == "new")
    )).scalar() or 0

    medical_pending = (await db.execute(
        select(func.count()).select_from(MedicalToken).where(MedicalToken.medical_status.in_(["pending", "token_issued", "scheduled"]))
    )).scalar() or 0

    medical_completed = (await db.execute(
        select(func.count()).select_from(MedicalToken).where(MedicalToken.medical_status == "completed")
    )).scalar() or 0

    visa_processing = (await db.execute(
        select(func.count()).select_from(Visa).where(Visa.status.in_(["processing", "submitted"]))
    )).scalar() or 0

    visa_approved = (await db.execute(
        select(func.count()).select_from(Visa).where(Visa.status == "approved")
    )).scalar() or 0

    tickets_booked = (await db.execute(
        select(func.count()).select_from(Ticket).where(Ticket.status.in_(["confirmed", "issued"]))
    )).scalar() or 0

    # Outstanding: total service fees minus total payments received
    # Calculate from actual medical/visa/ticket records, not ledger
    medical_fees = (await db.execute(
        select(func.coalesce(func.sum(MedicalToken.medical_fee), 0))
    )).scalar() or 0

    visa_fees = (await db.execute(
        select(func.coalesce(func.sum(Visa.total_cost), 0))
    )).scalar() or 0

    ticket_fees = (await db.execute(
        select(func.coalesce(func.sum(Ticket.total), 0))
    )).scalar() or 0

    total_fees = float(medical_fees) + float(visa_fees) + float(ticket_fees)

    total_payments = float((await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0))
    )).scalar() or 0)

    outstanding = total_fees - total_payments

    today_start = datetime.combine(date.today(), datetime.min.time())
    today_payments = float((await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.payment_date >= today_start)
    )).scalar() or 0)

    # Net received = payments minus refunds
    total_refunds = float((await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.payment_type == "refund")
    )).scalar() or 0)

    total_received = total_payments - total_refunds

    total_expenses = float((await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0))
    )).scalar() or 0)

    pending_payments = (await db.execute(
        select(func.count()).select_from(Candidate).where(Candidate.status != "completed")
    )).scalar() or 0

    net_amount = total_received - total_expenses

    # Agent commission: sum of (total fees per agent * commission_rate)
    agents = (await db.execute(select(Agent))).scalars().all()
    total_agent_commission = 0.0
    for agent in agents:
        rate = float(agent.commission_rate or 0)
        if rate <= 0:
            continue
        agent_medical = (await db.execute(
            select(func.coalesce(func.sum(MedicalToken.medical_fee), 0))
            .join(Candidate, MedicalToken.candidate_id == Candidate.id)
            .where(Candidate.agent_id == agent.id)
        )).scalar() or 0
        agent_visa = (await db.execute(
            select(func.coalesce(func.sum(Visa.total_cost), 0))
            .join(Candidate, Visa.candidate_id == Candidate.id)
            .where(Candidate.agent_id == agent.id)
        )).scalar() or 0
        agent_ticket = (await db.execute(
            select(func.coalesce(func.sum(Ticket.total), 0))
            .join(Candidate, Ticket.candidate_id == Candidate.id)
            .where(Candidate.agent_id == agent.id)
        )).scalar() or 0
        agent_fees = float(agent_medical) + float(agent_visa) + float(agent_ticket)
        total_agent_commission += agent_fees * (rate / 100)

    net_amount = net_amount - total_agent_commission

    return DashboardSummary(
        total_candidates=total_candidates,
        new_candidates=new_candidates,
        medical_pending=medical_pending,
        medical_completed=medical_completed,
        visa_processing=visa_processing,
        visa_approved=visa_approved,
        tickets_booked=tickets_booked,
        pending_payments=pending_payments,
        today_payments=float(today_payments),
        outstanding_balances=outstanding,
        total_received=total_received,
        total_pending=outstanding,
        total_expenses=float(total_expenses),
        total_agent_commission=total_agent_commission,
        net_amount=net_amount,
    )
