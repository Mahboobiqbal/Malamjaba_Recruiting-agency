from datetime import datetime

from pydantic import BaseModel


class BackupLogResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    file_size: int | None
    backup_type: str
    created_by: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class BackupCreateRequest(BaseModel):
    backup_type: str = "manual"
