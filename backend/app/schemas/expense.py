from datetime import datetime

from pydantic import BaseModel


class ExpenseBase(BaseModel):
    date: datetime
    category: str
    description: str | None = None
    amount: float
    payment_method: str
    paid_to: str | None = None
    reference: str | None = None
    remarks: str | None = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseResponse(ExpenseBase):
    id: int
    expense_code: str
    created_by: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ExpenseListResponse(BaseModel):
    items: list[ExpenseResponse]
    total: int
    page: int
    per_page: int
