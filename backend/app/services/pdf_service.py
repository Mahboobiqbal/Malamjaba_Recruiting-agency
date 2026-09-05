import os
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from app.config import get_settings

settings = get_settings()

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


async def get_company_info(db) -> dict:
    from sqlalchemy import select
    from app.models.settings import CompanySetting
    stmt = select(CompanySetting)
    result = await db.execute(stmt)
    settings_list = result.scalars().all()
    return {s.key: s.value or "" for s in settings_list}


async def render_medical_token_pdf(db, token) -> str:
    company = await get_company_info(db)
    template = env.get_template("medical_token.html")
    return template.render(
        company_name=company.get("company_name", "Malamjaba Recruiting Agency"),
        company_address=company.get("address", ""),
        company_phone=company.get("phone", ""),
        company_email=company.get("email", ""),
        token_code=token.token_code,
        token_number=token.token_number or "N/A",
        medical_center=token.medical_center or "N/A",
        medical_date=str(token.medical_date) if token.medical_date else "N/A",
        medical_fee=f"PKR {token.medical_fee:,.0f}",
        medical_status=token.medical_status,
        candidate_name=token.candidate.full_name if token.candidate else "N/A",
        candidate_code=token.candidate.candidate_code if token.candidate else "N/A",
        passport_number=token.candidate.passport_number if token.candidate else "N/A",
        mobile=token.candidate.mobile if token.candidate else "N/A",
        generated_date=datetime.now().strftime("%d %B %Y %I:%M %p"),
    )


async def render_payment_receipt_pdf(db, payment) -> str:
    company = await get_company_info(db)
    template = env.get_template("payment_receipt.html")
    return template.render(
        company_name=company.get("company_name", "Malamjaba Recruiting Agency"),
        company_address=company.get("address", ""),
        company_phone=company.get("phone", ""),
        company_email=company.get("email", ""),
        payment_code=payment.payment_code,
        receipt_number=payment.receipt_number,
        payment_date=payment.payment_date.strftime("%d %B %Y %I:%M %p"),
        payment_type=payment.payment_type,
        payment_method=payment.payment_method,
        amount=f"PKR {payment.amount:,.0f}",
        candidate_name=payment.candidate.full_name if payment.candidate else "N/A",
        candidate_code=payment.candidate.candidate_code if payment.candidate else "N/A",
        description=payment.description or "",
        generated_date=datetime.now().strftime("%d %B %Y %I:%M %p"),
    )


async def render_candidate_registration_pdf(db, candidate) -> str:
    company = await get_company_info(db)
    template = env.get_template("candidate_registration.html")
    return template.render(
        company_name=company.get("company_name", "Malamjaba Recruiting Agency"),
        company_address=company.get("address", ""),
        company_phone=company.get("phone", ""),
        company_email=company.get("email", ""),
        candidate_code=candidate.candidate_code,
        full_name=candidate.full_name,
        father_name=candidate.father_name or "N/A",
        cnic=candidate.cnic or "N/A",
        passport_number=candidate.passport_number,
        gender=candidate.gender or "N/A",
        date_of_birth=str(candidate.date_of_birth) if candidate.date_of_birth else "N/A",
        mobile=candidate.mobile,
        address=candidate.address or "N/A",
        city=candidate.city or "N/A",
        country=candidate.country or "N/A",
        profession=candidate.profession or "N/A",
        employer=candidate.employer or "N/A",
        job_visa_category=candidate.job_visa_category or "N/A",
        agent_name=candidate.agent.name if candidate.agent else "N/A",
        registration_date=candidate.registration_date.strftime("%d %B %Y"),
    )


async def render_candidate_ledger_pdf(db, candidate, entries, summary) -> str:
    company = await get_company_info(db)
    template = env.get_template("candidate_ledger.html")
    entry_data = []
    for e in entries:
        entry_data.append({
            "date": e.created_at.strftime("%d %b %Y"),
            "description": e.description,
            "debit": f"PKR {e.debit:,.0f}" if e.debit > 0 else "-",
            "credit": f"PKR {e.credit:,.0f}" if e.credit > 0 else "-",
            "balance": f"PKR {e.balance:,.0f}",
        })
    return template.render(
        company_name=company.get("company_name", "Malamjaba Recruiting Agency"),
        company_address=company.get("address", ""),
        company_phone=company.get("phone", ""),
        company_email=company.get("email", ""),
        candidate_name=candidate.full_name,
        candidate_code=candidate.candidate_code,
        entries=entry_data,
        total_charges=f"PKR {summary['total_charges']:,.0f}",
        total_payments=f"PKR {summary['total_payments']:,.0f}",
        balance=f"PKR {summary['balance']:,.0f}",
        generated_date=datetime.now().strftime("%d %B %Y %I:%M %p"),
    )
