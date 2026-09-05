from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password, decode_token
from app.core.exceptions import UnauthorizedException, NotFoundException, DuplicateException
from app.models.user import User, UserRole, Role, Permission
from app.schemas.user import UserCreate, UserResponse


async def authenticate_user(db: AsyncSession, username: str, password: str) -> User:
    stmt = select(User).where(User.username == username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        raise UnauthorizedException("Invalid username or password")
    if not user.is_active:
        raise UnauthorizedException("Account is deactivated")
    return user


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    existing = await db.execute(select(User).where(User.username == user_data.username))
    if existing.scalar_one_or_none():
        raise DuplicateException("Username already exists")

    user = User(
        username=user_data.username,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        email=user_data.email,
        phone=user_data.phone,
    )
    db.add(user)
    await db.flush()

    for role_id in user_data.role_ids:
        db.add(UserRole(user_id=user.id, role_id=role_id))

    await db.commit()
    await db.refresh(user)
    return user


async def get_user_permissions(db: AsyncSession, user: User) -> list[str]:
    if user.is_superadmin:
        return ["super_admin"]

    stmt = (
        select(Permission.permission)
        .join(Role, Permission.role_id == Role.id)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user.id)
    )
    result = await db.execute(stmt)
    return [row[0] for row in result.all()]


async def get_user_roles(db: AsyncSession, user: User) -> list[Role]:
    stmt = (
        select(Role)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user.id)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


def generate_tokens(user_id: int) -> dict:
    access = create_access_token(data={"sub": str(user_id)})
    refresh = create_refresh_token(data={"sub": str(user_id)})
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}
