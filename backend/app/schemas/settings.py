from datetime import datetime

from pydantic import BaseModel


class CompanySettingResponse(BaseModel):
    key: str
    value: str | None

    model_config = {"from_attributes": True}


class CompanySettingUpdate(BaseModel):
    settings: dict[str, str]


class SystemSettingResponse(BaseModel):
    key: str
    value: str | None

    model_config = {"from_attributes": True}


class SystemSettingUpdate(BaseModel):
    settings: dict[str, str]
