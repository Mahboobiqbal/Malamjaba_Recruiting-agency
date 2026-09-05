from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    candidate_id: int
    document_type: str
    file_name: str
    file_size: int | None
    mime_type: str | None
    uploaded_by: int | None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentResponse
