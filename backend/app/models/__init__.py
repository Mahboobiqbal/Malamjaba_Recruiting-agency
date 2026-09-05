from app.models.user import User, Role, Permission, UserRole
from app.models.agent import Agent
from app.models.candidate import Candidate
from app.models.medical_token import MedicalToken
from app.models.visa import Visa
from app.models.ticket import Ticket
from app.models.payment import Payment
from app.models.expense import Expense
from app.models.document import CandidateDocument
from app.models.ledger import LedgerEntry
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.models.settings import CompanySetting, SystemSetting
from app.models.backup_log import BackupLog

ALL_MODELS = [
    User, Role, Permission, UserRole,
    Agent, Candidate, MedicalToken, Visa, Ticket,
    Payment, Expense, CandidateDocument, LedgerEntry,
    AuditLog, Notification, CompanySetting, SystemSetting, BackupLog,
]
