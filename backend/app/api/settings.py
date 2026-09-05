from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_permission
from app.models.user import User
from app.models.settings import CompanySetting, SystemSetting
from app.schemas.settings import CompanySettingResponse, CompanySettingUpdate, SystemSettingResponse, SystemSettingUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/company")
async def get_company_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.view")),
):
    stmt = select(CompanySetting)
    result = await db.execute(stmt)
    settings = result.scalars().all()
    return {s.key: s.value for s in settings}


@router.put("/company")
async def update_company_settings(
    data: CompanySettingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.edit")),
):
    for key, value in data.settings.items():
        stmt = select(CompanySetting).where(CompanySetting.key == key)
        result = await db.execute(stmt)
        setting = result.scalar_one_or_none()
        if setting:
            setting.value = value
            setting.updated_by = current_user.id
        else:
            db.add(CompanySetting(key=key, value=value, updated_by=current_user.id))
    await db.commit()
    return {"message": "Company settings updated", "success": True}


@router.get("/system")
async def get_system_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.view")),
):
    stmt = select(SystemSetting)
    result = await db.execute(stmt)
    settings = result.scalars().all()
    return {s.key: s.value for s in settings}


@router.put("/system")
async def update_system_settings(
    data: SystemSettingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.edit")),
):
    for key, value in data.settings.items():
        stmt = select(SystemSetting).where(SystemSetting.key == key)
        result = await db.execute(stmt)
        setting = result.scalar_one_or_none()
        if setting:
            setting.value = value
            setting.updated_by = current_user.id
        else:
            db.add(SystemSetting(key=key, value=value, updated_by=current_user.id))
    await db.commit()
    return {"message": "System settings updated", "success": True}
