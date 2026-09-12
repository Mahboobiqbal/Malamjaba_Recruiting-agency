from enum import Enum


class Permission(str, Enum):
    USERS_VIEW = "users.view"
    USERS_CREATE = "users.create"
    USERS_EDIT = "users.edit"
    USERS_DELETE = "users.delete"

    CANDIDATES_VIEW = "candidates.view"
    CANDIDATES_CREATE = "candidates.create"
    CANDIDATES_EDIT = "candidates.edit"
    CANDIDATES_DELETE = "candidates.delete"

    AGENTS_VIEW = "agents.view"
    AGENTS_CREATE = "agents.create"
    AGENTS_EDIT = "agents.edit"
    AGENTS_DELETE = "agents.delete"

    MEDICAL_VIEW = "medical.view"
    MEDICAL_CREATE = "medical.create"
    MEDICAL_EDIT = "medical.edit"
    MEDICAL_DELETE = "medical.delete"

    VISA_VIEW = "visa.view"
    VISA_CREATE = "visa.create"
    VISA_EDIT = "visa.edit"
    VISA_DELETE = "visa.delete"

    TICKETS_VIEW = "tickets.view"
    TICKETS_CREATE = "tickets.create"
    TICKETS_EDIT = "tickets.edit"
    TICKETS_DELETE = "tickets.delete"

    PAYMENTS_VIEW = "payments.view"
    PAYMENTS_CREATE = "payments.create"
    PAYMENTS_EDIT = "payments.edit"
    PAYMENTS_DELETE = "payments.delete"

    EXPENSES_VIEW = "expenses.view"
    EXPENSES_CREATE = "expenses.create"
    EXPENSES_EDIT = "expenses.edit"
    EXPENSES_DELETE = "expenses.delete"

    REPORTS_VIEW = "reports.view"
    REPORTS_EXPORT = "reports.export"

    VENDORS_VIEW = "vendors.view"
    VENDORS_CREATE = "vendors.create"
    VENDORS_EDIT = "vendors.edit"
    VENDORS_DELETE = "vendors.delete"

    SETTINGS_VIEW = "settings.view"
    SETTINGS_EDIT = "settings.edit"

    DOCUMENTS_VIEW = "documents.view"
    DOCUMENTS_UPLOAD = "documents.upload"
    DOCUMENTS_DELETE = "documents.delete"

    BACKUP_VIEW = "backup.view"
    BACKUP_CREATE = "backup.create"
    BACKUP_RESTORE = "backup.restore"


ALL_PERMISSIONS = [p.value for p in Permission]

ROLE_PERMISSIONS: dict[str, list[str]] = {
    "super_admin": ALL_PERMISSIONS,
    "admin": [
        Permission.USERS_VIEW, Permission.USERS_CREATE, Permission.USERS_EDIT,
        Permission.CANDIDATES_VIEW, Permission.CANDIDATES_CREATE, Permission.CANDIDATES_EDIT, Permission.CANDIDATES_DELETE,
        Permission.AGENTS_VIEW, Permission.AGENTS_CREATE, Permission.AGENTS_EDIT, Permission.AGENTS_DELETE,
        Permission.MEDICAL_VIEW, Permission.MEDICAL_CREATE, Permission.MEDICAL_EDIT,
        Permission.VISA_VIEW, Permission.VISA_CREATE, Permission.VISA_EDIT,
        Permission.TICKETS_VIEW, Permission.TICKETS_CREATE, Permission.TICKETS_EDIT,
        Permission.PAYMENTS_VIEW, Permission.PAYMENTS_CREATE, Permission.PAYMENTS_EDIT,
        Permission.EXPENSES_VIEW, Permission.EXPENSES_CREATE, Permission.EXPENSES_EDIT,
        Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT,
        Permission.VENDORS_VIEW, Permission.VENDORS_CREATE, Permission.VENDORS_EDIT, Permission.VENDORS_DELETE,
        Permission.SETTINGS_VIEW, Permission.SETTINGS_EDIT,
        Permission.DOCUMENTS_VIEW, Permission.DOCUMENTS_UPLOAD, Permission.DOCUMENTS_DELETE,
        Permission.BACKUP_VIEW, Permission.BACKUP_CREATE, Permission.BACKUP_RESTORE,
    ],
    "accountant": [
        Permission.CANDIDATES_VIEW,
        Permission.AGENTS_VIEW,
        Permission.PAYMENTS_VIEW, Permission.PAYMENTS_CREATE, Permission.PAYMENTS_EDIT,
        Permission.EXPENSES_VIEW, Permission.EXPENSES_CREATE, Permission.EXPENSES_EDIT,
        Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT,
        Permission.VENDORS_VIEW,
    ],
    "manager": [
        Permission.CANDIDATES_VIEW, Permission.CANDIDATES_CREATE, Permission.CANDIDATES_EDIT,
        Permission.AGENTS_VIEW, Permission.AGENTS_CREATE, Permission.AGENTS_EDIT,
        Permission.MEDICAL_VIEW, Permission.MEDICAL_CREATE, Permission.MEDICAL_EDIT,
        Permission.VISA_VIEW, Permission.VISA_CREATE, Permission.VISA_EDIT,
        Permission.TICKETS_VIEW, Permission.TICKETS_CREATE, Permission.TICKETS_EDIT,
        Permission.PAYMENTS_VIEW, Permission.PAYMENTS_CREATE,
        Permission.EXPENSES_VIEW,
        Permission.REPORTS_VIEW,
        Permission.VENDORS_VIEW, Permission.VENDORS_CREATE, Permission.VENDORS_EDIT,
        Permission.DOCUMENTS_VIEW, Permission.DOCUMENTS_UPLOAD,
    ],
    "staff": [
        Permission.CANDIDATES_VIEW, Permission.CANDIDATES_CREATE,
        Permission.AGENTS_VIEW,
        Permission.MEDICAL_VIEW,
        Permission.VISA_VIEW,
        Permission.TICKETS_VIEW,
        Permission.PAYMENTS_VIEW,
        Permission.VENDORS_VIEW,
        Permission.DOCUMENTS_VIEW, Permission.DOCUMENTS_UPLOAD,
    ],
}


def get_role_permissions(role_name: str) -> list[str]:
    return ROLE_PERMISSIONS.get(role_name, [])


def check_permission(user_permissions: list[str], required: str) -> bool:
    return required in user_permissions or "super_admin" in user_permissions
