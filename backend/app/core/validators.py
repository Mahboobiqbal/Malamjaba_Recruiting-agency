import re
from datetime import date

from app.core.exceptions import ValidationException


def validate_cnic(value: str) -> str:
    pattern = r"^\d{5}-\d{7}-\d$"
    if not re.match(pattern, value):
        raise ValidationException("CNIC must be in format XXXXX-XXXXXXX-X")
    return value


def validate_phone(value: str) -> str:
    cleaned = re.sub(r"[\s\-\+]", "", value)
    if not re.match(r"^03\d{9}$", cleaned):
        raise ValidationException("Phone number must be a valid Pakistani mobile number (03XXXXXXXXX)")
    return value


def validate_passport(value: str) -> str:
    cleaned = value.strip().upper()
    if not re.match(r"^[A-Z0-9]{5,15}$", cleaned):
        raise ValidationException("Passport number must be 5-15 alphanumeric characters")
    return cleaned


def validate_email_field(value: str) -> str:
    if value and not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", value):
        raise ValidationException("Invalid email address")
    return value


def validate_positive_amount(value: float) -> float:
    if value < 0:
        raise ValidationException("Amount must be positive")
    return value


def validate_not_zero(value: float) -> float:
    if value == 0:
        raise ValidationException("Amount cannot be zero")
    return value


def validate_date_not_past(value: date) -> date:
    if value < date.today():
        raise ValidationException("Date cannot be in the past")
    return value


def validate_date_after(start: date, end: date) -> date:
    if end <= start:
        raise ValidationException("End date must be after start date")
    return end
