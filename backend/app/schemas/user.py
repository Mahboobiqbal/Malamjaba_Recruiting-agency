from datetime import datetime

from pydantic import BaseModel


class RoleBase(BaseModel):
    name: str
    description: str | None = None


class RoleCreate(RoleBase):
    pass


class RoleResponse(RoleBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PermissionResponse(BaseModel):
    id: int
    role_id: int
    permission: str

    model_config = {"from_attributes": True}


class UserBase(BaseModel):
    username: str
    full_name: str
    email: str | None = None
    phone: str | None = None


class UserCreate(UserBase):
    password: str
    role_ids: list[int] = []


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    is_active: bool | None = None
    role_ids: list[int] | None = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_superadmin: bool
    last_login: datetime | None
    created_at: datetime
    updated_at: datetime
    roles: list[RoleResponse] = []

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
