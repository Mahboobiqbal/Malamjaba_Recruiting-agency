from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_permission
from app.models.user import User, UserRole, Role
from app.schemas.user import UserCreate, UserUpdate, UserResponse, RoleResponse
from app.services.auth_service import create_user, get_user_roles
from app.core.security import hash_password
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=dict)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.view")),
):
    stmt = select(User)
    count_stmt = select(func.count()).select_from(User)

    if search:
        like_term = f"%{search}%"
        stmt = stmt.where(User.full_name.ilike(like_term) | User.username.ilike(like_term))
        count_stmt = count_stmt.where(User.full_name.ilike(like_term) | User.username.ilike(like_term))

    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.options(selectinload(User.user_roles).selectinload(UserRole.role))
    stmt = stmt.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    users = result.scalars().all()

    items = []
    for u in users:
        ud = UserResponse.model_validate(u)
        ud.roles = [ur.role for ur in u.user_roles]
        items.append(ud)

    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.post("", response_model=UserResponse)
async def create_new_user(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.create")),
):
    user = await create_user(db, data)
    roles = await get_user_roles(db, user)
    resp = UserResponse.model_validate(user)
    resp.roles = roles
    return resp


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.view")),
):
    stmt = select(User).where(User.id == user_id).options(
        selectinload(User.user_roles).selectinload(UserRole.role)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")
    resp = UserResponse.model_validate(user)
    resp.roles = [ur.role for ur in user.user_roles]
    return resp


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.edit")),
):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")

    update_data = data.model_dump(exclude_unset=True)
    role_ids = update_data.pop("role_ids", None)

    for key, value in update_data.items():
        setattr(user, key, value)

    if role_ids is not None:
        del_stmt = select(UserRole).where(UserRole.user_id == user.id)
        existing = await db.execute(del_stmt)
        for ur in existing.scalars().all():
            await db.delete(ur)
        for role_id in role_ids:
            db.add(UserRole(user_id=user.id, role_id=role_id))

    await db.commit()
    await db.refresh(user)
    roles = await get_user_roles(db, user)
    resp = UserResponse.model_validate(user)
    resp.roles = roles
    return resp


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.delete")),
):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")
    await db.delete(user)
    await db.commit()
    return {"message": "User deleted successfully", "success": True}


@router.get("/roles/list", response_model=list[RoleResponse])
async def list_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.view")),
):
    stmt = select(Role)
    result = await db.execute(stmt)
    roles = result.scalars().all()
    return roles
