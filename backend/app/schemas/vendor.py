from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class VendorBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    contact_person: str | None = Field(None, max_length=100)
    phone: str = Field(..., max_length=20)
    email: str | None = Field(None, max_length=100)
    address: str | None = Field(None, max_length=500)
    bank_name: str | None = Field(None, max_length=100)
    account_title: str | None = Field(None, max_length=100)
    account_number: str | None = Field(None, max_length=50)
    status: str = Field("active", pattern=r"^(active|inactive)$")
    notes: str | None = Field(None, max_length=1000)


class VendorCreate(VendorBase):
    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Phone is required")
        return v


class VendorUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = Field(None, max_length=500)
    bank_name: str | None = None
    account_title: str | None = None
    account_number: str | None = None
    status: str | None = Field(None, pattern=r"^(active|inactive)$")
    notes: str | None = Field(None, max_length=1000)


class VendorResponse(VendorBase):
    id: int
    vendor_code: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VendorListResponse(BaseModel):
    items: list[VendorResponse]
    total: int
    page: int
    per_page: int


class VendorTransactionBase(BaseModel):
    vendor_id: int
    candidate_id: int | None = None
    service_type: str = Field(..., pattern=r"^(ticket|visa)$")
    service_id: int | None = None
    purchase_price: float = Field(0, ge=0)
    selling_price: float = Field(0, ge=0)
    payment_method: str | None = Field(None, max_length=20)
    reference_number: str | None = Field(None, max_length=50)
    remarks: str | None = Field(None, max_length=500)


class VendorTransactionCreate(BaseModel):
    candidate_id: int | None = None
    service_type: str = Field(..., pattern=r"^(ticket|visa)$")
    service_id: int | None = None
    passenger_name: str | None = Field(None, max_length=100)
    origin: str | None = Field(None, max_length=50)
    destination: str | None = Field(None, max_length=50)
    travel_date: str | None = None
    travel_time: str | None = Field(None, max_length=10)
    airline: str | None = Field(None, max_length=50)
    flight_number: str | None = Field(None, max_length=20)
    visa_country: str | None = Field(None, max_length=50)
    visa_type: str | None = Field(None, max_length=50)
    visa_date: str | None = None
    visa_number: str | None = Field(None, max_length=50)
    ticket_number: str | None = Field(None, max_length=30)
    pnr: str | None = Field(None, max_length=20)
    purchase_price: float = Field(0, ge=0)
    selling_price: float = Field(0, ge=0)
    payment_method: str | None = Field(None, max_length=20)
    reference_number: str | None = Field(None, max_length=50)
    remarks: str | None = Field(None, max_length=500)


class VendorTransactionUpdate(BaseModel):
    passenger_name: str | None = None
    origin: str | None = None
    destination: str | None = None
    travel_date: str | None = None
    travel_time: str | None = None
    airline: str | None = None
    flight_number: str | None = None
    ticket_number: str | None = None
    pnr: str | None = None
    visa_country: str | None = None
    visa_type: str | None = None
    visa_date: str | None = None
    purchase_price: float | None = None
    selling_price: float | None = None
    payment_method: str | None = None
    reference_number: str | None = None
    remarks: str | None = None


class VendorTransactionResponse(VendorTransactionBase):
    id: int
    transaction_code: str
    passenger_name: str | None = None
    origin: str | None = None
    destination: str | None = None
    travel_date: str | None = None
    travel_time: str | None = None
    airline: str | None = None
    flight_number: str | None = None
    visa_country: str | None = None
    visa_type: str | None = None
    visa_date: str | None = None
    visa_number: str | None = None
    ticket_number: str | None = None
    pnr: str | None = None
    profit: float
    payment_status: str
    paid_amount: float
    remaining: float
    created_by: int | None
    created_at: datetime
    updated_at: datetime
    vendor: VendorResponse | None = None

    model_config = {"from_attributes": True}

    @field_validator("travel_date", "visa_date", mode="before")
    @classmethod
    def date_to_str(cls, v):
        if hasattr(v, "isoformat"):
            return v.isoformat()
        return v


class VendorTransactionListResponse(BaseModel):
    items: list[VendorTransactionResponse]
    total: int
    page: int
    per_page: int


class VendorPaymentBase(BaseModel):
    vendor_id: int
    amount: float = Field(..., gt=0)
    payment_method: str = Field("cash", pattern=r"^(cash|bank_transfer|cheque)$")
    reference_number: str | None = Field(None, max_length=50)
    remarks: str | None = Field(None, max_length=500)


class VendorPaymentCreate(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str = Field("cash", pattern=r"^(cash|bank_transfer|cheque)$")
    reference_number: str | None = Field(None, max_length=50)
    remarks: str | None = Field(None, max_length=500)


class VendorPaymentResponse(VendorPaymentBase):
    id: int
    payment_code: str
    created_by: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class VendorPaymentListResponse(BaseModel):
    items: list[VendorPaymentResponse]
    total: int
    page: int
    per_page: int


class VendorLedgerEntry(BaseModel):
    date: str
    description: str
    debit: float
    credit: float
    balance: float
    reference_type: str | None = None
    reference_id: int | None = None


class VendorLedgerResponse(BaseModel):
    vendor: VendorResponse
    opening_balance: float
    entries: list[VendorLedgerEntry]
    closing_balance: float
    total_debit: float
    total_credit: float


class VendorSummary(BaseModel):
    total_purchased: float = 0
    total_paid: float = 0
    total_owed: float = 0
    total_profit: float = 0
    transaction_count: int = 0


class VendorTransactionAssign(BaseModel):
    candidate_id: int
    ticket_price: float = Field(0, ge=0)
    airline: str | None = None
    flight_number: str | None = None
    departure_airport: str | None = None
    arrival_airport: str | None = None
    departure_date: str | None = None
    departure_time: str | None = None
    visa_fee: float = Field(0, ge=0)
    visa_type: str | None = None
    country: str | None = None
