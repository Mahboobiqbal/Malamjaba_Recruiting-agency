from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_permission
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/financial")
async def get_financial_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("reports.view")),
):
    from sqlalchemy import select, func
    from app.models.payment import Payment
    from app.models.expense import Expense

    total_received = (await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0))
    )).scalar() or 0

    total_expenses = (await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0))
    )).scalar() or 0

    return {
        "total_received": float(total_received),
        "total_expenses": float(total_expenses),
        "net_profit": float(total_received) - float(total_expenses),
    }


@router.get("/agent-performance")
async def get_agent_performance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("reports.view")),
):
    from sqlalchemy import select, func
    from app.models.agent import Agent
    from app.models.candidate import Candidate

    stmt = (
        select(Agent, func.count(Candidate.id).label("candidate_count"))
        .outerjoin(Candidate, Candidate.agent_id == Agent.id)
        .group_by(Agent.id)
    )
    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "agent_id": agent.id,
            "agent_name": agent.name,
            "agent_code": agent.agent_code,
            "candidate_count": count,
        }
        for agent, count in rows
    ]
