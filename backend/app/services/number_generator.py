import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import Agent
from app.models.candidate import Candidate
from app.models.medical_token import MedicalToken
from app.models.visa import Visa
from app.models.ticket import Ticket
from app.models.payment import Payment
from app.models.expense import Expense


async def generate_unique_code(db: AsyncSession, model, column, prefix: str) -> str:
    """Generate a unique code by checking existing codes in the database."""
    max_len = 12 - len(prefix) - 1  # e.g., AGT-XXXXXX
    for _ in range(100):  # retry limit
        short_id = uuid.uuid4().hex[:6].upper()
        code = f"{prefix}-{short_id}"
        exists = await db.execute(select(model).where(column == code))
        if not exists.scalar_one_or_none():
            return code
    raise ValueError(f"Failed to generate unique {prefix} code after 100 attempts")


async def generate_agent_code(db: AsyncSession) -> str:
    from app.models.agent import Agent
    return await generate_unique_code(db, Agent, Agent.agent_code, "AGT")


async def generate_candidate_code(db: AsyncSession) -> str:
    from app.models.candidate import Candidate
    return await generate_unique_code(db, Candidate, Candidate.candidate_code, "C")


async def generate_token_code(db: AsyncSession) -> str:
    from app.models.medical_token import MedicalToken
    return await generate_unique_code(db, MedicalToken, MedicalToken.token_code, "MED")


async def generate_visa_code(db: AsyncSession) -> str:
    from app.models.visa import Visa
    return await generate_unique_code(db, Visa, Visa.visa_code, "VISA")


async def generate_ticket_code(db: AsyncSession) -> str:
    from app.models.ticket import Ticket
    return await generate_unique_code(db, Ticket, Ticket.ticket_code, "TKT")


async def generate_payment_code(db: AsyncSession) -> str:
    from app.models.payment import Payment
    return await generate_unique_code(db, Payment, Payment.payment_code, "PAY")


async def generate_receipt_number(db: AsyncSession) -> str:
    from app.models.payment import Payment
    return await generate_unique_code(db, Payment, Payment.receipt_number, "REC")


async def generate_expense_code(db: AsyncSession) -> str:
    from app.models.expense import Expense
    return await generate_unique_code(db, Expense, Expense.expense_code, "EXP")
