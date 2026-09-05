from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.core.exceptions import UnauthorizedException
from app.models.user import User
from app.schemas.user import UserLogin, TokenResponse, TokenRefresh, UserResponse
from app.services.auth_service import authenticate_user, generate_tokens, get_user_permissions, get_user_roles
from app.core.security import decode_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, data.username, data.password)
    stmt = update(User).where(User.id == user.id).values(last_login=datetime.now(timezone.utc))
    await db.execute(stmt)
    await db.commit()
    return generate_tokens(user.id)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: TokenRefresh, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise UnauthorizedException("Invalid refresh token")
    user_id = payload.get("sub")
    stmt = select(User).where(User.id == int(user_id))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise UnauthorizedException("User not found or inactive")
    return generate_tokens(user.id)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    roles = await get_user_roles(db, current_user)
    user_data = UserResponse.model_validate(current_user)
    user_data.roles = roles
    return user_data


@router.get("/permissions")
async def get_permissions(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    permissions = await get_user_permissions(db, current_user)
    return {"permissions": permissions}
