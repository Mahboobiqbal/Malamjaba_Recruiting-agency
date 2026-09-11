import logging
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger(__name__)


FIELD_LABELS = {
    "gender": "Gender",
    "full_name": "Full Name",
    "father_name": "Father Name",
    "cnic": "CNIC",
    "mobile": "Mobile Number",
    "whatsapp": "WhatsApp Number",
    "email": "Email",
    "passport_number": "Passport Number",
    "passport_expiry": "Passport Expiry",
    "date_of_birth": "Date of Birth",
    "qualification": "Qualification",
    "marital_status": "Marital Status",
    "address": "Address",
    "city": "City",
    "province": "Province",
    "nationality": "Nationality",
    "religion": "Religion",
    "medical_status": "Medical Status",
    "agent_id": "Agent",
    "status": "Status",
    "name": "Name",
    "phone": "Phone",
    "contact_person": "Contact Person",
    "bank_name": "Bank Name",
    "account_number": "Account Number",
    "service_type": "Service Type",
    "ticket_price": "Ticket Price",
    "agent_commission": "Agent Commission",
    "other_charges": "Other Charges",
    "purchase_price": "Purchase Price",
    "selling_price": "Selling Price",
    "amount": "Amount",
    "password": "Password",
    "username": "Username",
    "role": "Role",
    "commission_rate": "Commission Rate",
    "visa_fee": "Visa Fee",
    "medical_fee": "Medical Fee",
    "total_cost": "Total Cost",
    "visa_number": "Visa Number",
    "sponsor_number": "Sponsor Number",
    "visa_type": "Visa Type",
    "country": "Country",
}

PATTERN_HINTS = {
    "^(male|female)$": "Please select Male or Female",
    "^(single|married|divorced|widowed)$": "Please select Single, Married, Divorced, or Widowed",
    "^(active|inactive|blocked)$": "Please select a valid status",
    "^(pending|reserved|confirmed|issued|cancelled|refunded)$": "Please select a valid status",
    "^(unpaid|partial|paid)$": "Please select a valid payment status",
    "^(ticket|visa)$": "Please select Ticket or Visa",
    "^(cash|bank_transfer|cheque|credit)$": "Please select a valid payment method",
    r"^\d{5}-\d{7}-\d$": "Use format XXXXX-XXXXXXX-X (e.g., 35202-1234567-1)",
    r"^(?:\+92|92|0)?3[0-9]{9}$": "Use format 03012345678 or +923012345678",
    r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$": "Use format example@email.com",
    "^[a-zA-Z\\s\\-\\.]+$": "Only letters, spaces, hyphens, and dots allowed",
}


def friendly_validation_error(err: dict) -> str:
    loc = err.get("loc", [])
    field = loc[-1] if len(loc) > 1 else loc[0] if loc else "field"
    label = FIELD_LABELS.get(field, field.replace("_", " ").title())

    ctx = err.get("ctx", {}) or {}
    pattern = ctx.get("pattern", None)
    if pattern:
        hint = PATTERN_HINTS.get(pattern, None)
        if hint:
            return f"{label}: {hint}"
        return f"{label}: Invalid value"

    err_type = err.get("type", "")
    original_msg = err.get("msg", "")

    if err_type == "value_error.missing":
        return f"{label} is required"

    if err_type == "string_too_short":
        return f"{label} is too short"

    if err_type == "value_error":
        if "match pattern" in original_msg:
            return f"{label}: Invalid value"
        return f"{label}: {original_msg}" if original_msg else f"{label}: Invalid value"

    if original_msg:
        clean = original_msg.replace("Value error, ", "")
        return f"{label}: {clean}"

    return f"{label}: Invalid value"


class AppException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail


class NotFoundException(AppException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail)


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=401, detail=detail)


class ForbiddenException(AppException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=403, detail=detail)


class ValidationException(AppException):
    def __init__(self, detail: str = "Validation error"):
        super().__init__(status_code=422, detail=detail)


class DuplicateException(AppException):
    def __init__(self, detail: str = "Record already exists"):
        super().__init__(status_code=409, detail=detail)


class DatabaseException(AppException):
    def __init__(self, detail: str = "Database error"):
        super().__init__(status_code=500, detail=detail)


def register_exception_handlers(app):
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        messages = []
        for err in exc.errors():
            msg = friendly_validation_error(err)
            messages.append(msg)
        return JSONResponse(
            status_code=422,
            content={"detail": messages[0] if len(messages) == 1 else "; ".join(messages)},
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception: %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content={"detail": f"An unexpected error occurred: {str(exc)}"},
        )
