from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import Agent
from app.models.candidate import Candidate
from app.models.medical_token import MedicalToken
from app.models.visa import Visa
from app.models.ticket import Ticket
from app.models.payment import Payment
from app.models.expense import Expense


async def generate_number(db: AsyncSession, model, prefix: str) -> str:
    count_stmt = select(func.count()).select_from(model)
    result = await db.execute(count_stmt)
    count = result.scalar() or 0
    return f"{prefix}-{count + 1:06d}"


async def generate_agent_code(db: AsyncSession) -> str:
    return await generate_number(db, Agent, "AGT")


async def generate_candidate_code(db: AsyncSession) -> str:
    return await generate_number(db, Candidate, "C")


async def generate_token_code(db: AsyncSession) -> str:
    return await generate_number(db, MedicalToken, "MED")


async def generate_visa_code(db: AsyncSession) -> str:
    return await generate_number(db, Visa, "VISA")


async def generate_ticket_code(db: AsyncSession) -> str:
    return await generate_number(db, Ticket, "TKT")


async def generate_payment_code(db: AsyncSession) -> str:
    return await generate_number(db, Payment, "PAY")


async def generate_receipt_number(db: AsyncSession) -> str:
    return await generate_number(db, Payment, "REC")


async def generate_expense_code(db: AsyncSession) -> str:
    return await generate_number(db, Expense, "EXP")
