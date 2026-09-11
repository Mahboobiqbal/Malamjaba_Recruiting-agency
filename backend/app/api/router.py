from fastapi import APIRouter

from app.api import auth, users, agents, candidates, medical_tokens, visas, tickets, payments, expenses, dashboard, ledger, notifications, settings, reports, documents, vendors

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(agents.router)
api_router.include_router(candidates.router)
api_router.include_router(medical_tokens.router)
api_router.include_router(visas.router)
api_router.include_router(tickets.router)
api_router.include_router(payments.router)
api_router.include_router(expenses.router)
api_router.include_router(dashboard.router)
api_router.include_router(ledger.router)
api_router.include_router(notifications.router)
api_router.include_router(settings.router)
api_router.include_router(reports.router)
api_router.include_router(documents.router)
api_router.include_router(vendors.router)
