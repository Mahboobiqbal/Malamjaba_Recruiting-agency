import re
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class ExpenseBase(BaseModel):
    date: datetime
    category: str = Field(..., pattern=r"^(office|medical|visa|ticket|agent_commission|transportation|salary|utility|other)$")
    description: str | None = Field(None, max_length=500)
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    payment_method: str = Field(..., pattern=r"^(cash|bank_transfer|online_transfer|other)$")
    paid_to: str | None = Field(None, max_length=100)
    reference: str | None = Field(None, max_length=50)
    remarks: str | None = Field(None, max_length=500)

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        if v > 999999999:
            raise ValueError("Amount is too large")
        return round(v, 2)


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
