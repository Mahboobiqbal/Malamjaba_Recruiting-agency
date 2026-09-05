from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_permission
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseListResponse
from app.services.number_generator import generate_expense_code
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("", response_model=ExpenseListResponse)
async def list_expenses(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    category: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("expenses.view")),
):
    stmt = select(Expense)
    count_stmt = select(func.count()).select_from(Expense)

    if search:
        like_term = f"%{search}%"
        condition = Expense.expense_code.ilike(like_term) | Expense.description.ilike(like_term)
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)

    if category:
        stmt = stmt.where(Expense.category == category)
        count_stmt = count_stmt.where(Expense.category == category)

    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.order_by(Expense.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    items = result.scalars().all()

    return ExpenseListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("", response_model=ExpenseResponse)
async def create_expense(
    data: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("expenses.create")),
):
    expense_code = await generate_expense_code(db)
    expense = Expense(expense_code=expense_code, created_by=current_user.id, **data.model_dump())
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("expenses.view")),
):
    stmt = select(Expense).where(Expense.id == expense_id)
    result = await db.execute(stmt)
    expense = result.scalar_one_or_none()
    if not expense:
        raise NotFoundException("Expense not found")
    return expense


@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("expenses.delete")),
):
    stmt = select(Expense).where(Expense.id == expense_id)
    result = await db.execute(stmt)
    expense = result.scalar_one_or_none()
    if not expense:
        raise NotFoundException("Expense not found")
    await db.delete(expense)
    await db.commit()
    return {"message": "Expense deleted successfully", "success": True}
