import os
import shutil
from datetime import datetime

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db, Base, engine
from app.dependencies import require_permission
from app.models.user import User
from app.models.backup_log import BackupLog
from app.models.settings import CompanySetting

router = APIRouter(prefix="/settings", tags=["Settings"])
settings = get_settings()


@router.get("/company")
async def get_company_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.view")),
):
    stmt = select(CompanySetting)
    result = await db.execute(stmt)
    rows = result.scalars().all()
    return {row.key: row.value for row in rows}


@router.put("/company")
async def update_company_settings(
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.manage")),
):
    for key, value in data.get("settings", data).items():
        stmt = select(CompanySetting).where(CompanySetting.key == key)
        result = await db.execute(stmt)
        row = result.scalar_one_or_none()
        if row:
            row.value = value
        else:
            row = CompanySetting(key=key, value=value, updated_by=current_user.id)
            db.add(row)
    await db.commit()
    return {"message": "Settings updated"}


@router.post("/backup")
async def create_backup(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.manage")),
):
    backup_dir = os.path.abspath(settings.backup_dir)
    os.makedirs(backup_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"backup_{timestamp}.db"
    backup_path = os.path.join(backup_dir, filename)

    # Extract actual database path from DATABASE_URL
    db_url = settings.database_url
    if "sqlite" in db_url:
        db_path = db_url.split("///")[-1] if "///" in db_url else "./dev.db"
        db_path = os.path.abspath(db_path)
    else:
        raise HTTPException(status_code=400, detail="Backup only supported for SQLite databases")

    if not os.path.exists(db_path):
        raise HTTPException(status_code=404, detail=f"Database file not found at {db_path}")

    shutil.copy2(db_path, backup_path)
    file_size = os.path.getsize(backup_path)

    log = BackupLog(
        filename=filename,
        file_path=backup_path,
        file_size=file_size,
        backup_type="manual",
        created_by=current_user.id,
    )
    db.add(log)
    await db.commit()

    return {
        "message": "Backup created successfully",
        "filename": filename,
        "file_size": file_size,
        "created_at": datetime.now().isoformat(),
    }


@router.get("/backups")
async def list_backups(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.manage")),
):
    stmt = select(BackupLog).order_by(BackupLog.created_at.desc())
    result = await db.execute(stmt)
    backups = result.scalars().all()

    return [
        {
            "id": b.id,
            "filename": b.filename,
            "file_size": b.file_size,
            "backup_type": b.backup_type,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        }
        for b in backups
    ]


@router.get("/backups/{backup_id}/download")
async def download_backup(
    backup_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.manage")),
):
    stmt = select(BackupLog).where(BackupLog.id == backup_id)
    result = await db.execute(stmt)
    backup = result.scalar_one_or_none()

    if not backup or not os.path.exists(backup.file_path):
        raise HTTPException(status_code=404, detail="Backup file not found")

    return FileResponse(
        backup.file_path,
        media_type="application/octet-stream",
        filename=backup.filename,
    )


@router.post("/restore/upload")
async def restore_from_upload(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.manage")),
):
    if not file.filename.endswith(".db"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only .db files are allowed.")

    backup_dir = os.path.abspath(settings.backup_dir)
    os.makedirs(backup_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"uploaded_{timestamp}.db"
    upload_path = os.path.join(backup_dir, filename)

    try:
        content = await file.read()
        with open(upload_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    log = BackupLog(
        filename=filename,
        file_path=upload_path,
        file_size=len(content),
        backup_type="upload",
        created_by=current_user.id,
    )
    db.add(log)
    await db.commit()

    db_path = os.path.abspath("./dev.db")
    pre_restore_path = os.path.join(backup_dir, f"pre_restore_{timestamp}.db")
    
    try:
        shutil.copy2(db_path, pre_restore_path)
    except Exception as e:
        pass

    try:
        shutil.copy2(upload_path, db_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to replace database file: {str(e)}. The file may be in use.")

    return {
        "message": "Database restored from uploaded file. Please restart the application.",
        "filename": filename,
    }


@router.post("/restore/{backup_id}")
async def restore_backup(
    backup_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.manage")),
):
    stmt = select(BackupLog).where(BackupLog.id == backup_id)
    result = await db.execute(stmt)
    backup = result.scalar_one_or_none()

    if not backup or not os.path.exists(backup.file_path):
        raise HTTPException(status_code=404, detail="Backup file not found")

    db_path = os.path.abspath("./dev.db")
    backup_dir = os.path.abspath(settings.backup_dir)
    os.makedirs(backup_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    pre_restore_path = os.path.join(backup_dir, f"pre_restore_{timestamp}.db")
    
    try:
        shutil.copy2(db_path, pre_restore_path)
    except Exception:
        pass

    try:
        shutil.copy2(backup.file_path, db_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to restore database: {str(e)}. The file may be in use.")

    return {
        "message": "Database restored successfully. Please restart the application.",
        "restored_from": backup.filename,
    }


@router.post("/reset")
async def reset_all_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.manage")),
):
    from app.models.candidate import Candidate
    from app.models.agent import Agent
    from app.models.medical_token import MedicalToken
    from app.models.visa import Visa
    from app.models.ticket import Ticket
    from app.models.payment import Payment
    from app.models.expense import Expense
    from app.models.ledger import LedgerEntry
    from app.models.document import CandidateDocument
    from app.models.audit_log import AuditLog
    from app.models.notification import Notification
    from app.models.user import User as UserModel

    tables_to_clear = [
        LedgerEntry, CandidateDocument, Payment, Expense,
        Ticket, Visa, MedicalToken, Candidate, Agent,
        AuditLog, Notification, BackupLog, CompanySetting,
    ]

    for table in tables_to_clear:
        stmt = table.__table__.delete()
        await db.execute(stmt)

    await db.execute(UserModel.__table__.delete())

    await db.commit()

    from app.services.auth_service import hash_password
    from datetime import datetime, timezone

    admin = UserModel(
        username="admin",
        password_hash=hash_password("admin123"),
        full_name="Administrator",
        is_active=True,
        is_superadmin=True,
    )
    db.add(admin)
    await db.commit()

    return {
        "message": "All data has been reset. Default admin user (admin/admin123) has been recreated. Please restart the application and login again.",
    }
