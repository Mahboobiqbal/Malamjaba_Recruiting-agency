import os
import uuid

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_permission
from app.models.document import CandidateDocument
from app.models.candidate import Candidate
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentUploadResponse
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {
    "image/jpeg", "image/png", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload/{candidate_id}", response_model=DocumentUploadResponse)
async def upload_document(
    candidate_id: int,
    file: UploadFile = File(...),
    document_type: str = "other",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("documents.upload")),
):
    stmt = select(Candidate).where(Candidate.id == candidate_id)
    result = await db.execute(stmt)
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise NotFoundException("Candidate not found")

    if file.content_type not in ALLOWED_TYPES:
        from app.core.exceptions import ValidationException
        raise ValidationException("File type not allowed")

    content = await file.read()
    if len(content) > MAX_SIZE:
        from app.core.exceptions import ValidationException
        raise ValidationException("File size exceeds 10MB limit")

    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    filename = f"{candidate.candidate_code}_{document_type}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    doc = CandidateDocument(
        candidate_id=candidate_id,
        document_type=document_type,
        file_name=file.filename,
        file_path=filepath,
        file_size=len(content),
        mime_type=file.content_type,
        uploaded_by=current_user.id,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return DocumentUploadResponse(
        message="Document uploaded successfully",
        document=DocumentResponse.model_validate(doc),
    )


@router.get("/candidate/{candidate_id}")
async def list_candidate_documents(
    candidate_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("documents.view")),
):
    stmt = select(CandidateDocument).where(CandidateDocument.candidate_id == candidate_id)
    result = await db.execute(stmt)
    docs = result.scalars().all()
    return [DocumentResponse.model_validate(d) for d in docs]


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("documents.delete")),
):
    stmt = select(CandidateDocument).where(CandidateDocument.id == document_id)
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise NotFoundException("Document not found")

    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted successfully", "success": True}
