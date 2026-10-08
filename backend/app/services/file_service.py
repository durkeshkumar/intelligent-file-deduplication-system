import json
import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.audit_log import AuditLog
from app.models.deletion_history import DeletionHistory
from app.models.file import File
from app.models.file_metadata import FileMetadata
from app.schemas.file import FileUploadResponse
from app.tasks.file_tasks import process_file_hash


def upload_file(
    db: Session,
    user_id: int,
    uploaded_file: UploadFile,
) -> FileUploadResponse:
    """
    Save an uploaded file, create file metadata,
    and queue background SHA-256 processing.
    """

    if not uploaded_file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required",
        )

    original_filename = Path(uploaded_file.filename).name

    if not original_filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename",
        )

    storage_path = Path(settings.FILE_STORAGE_PATH)
    storage_path.mkdir(
        parents=True,
        exist_ok=True,
    )

    file_extension = Path(original_filename).suffix.lower()

    stored_filename = (
        f"{uuid.uuid4().hex}{file_extension}"
    )

    file_path = storage_path / stored_filename

    try:
        with file_path.open("wb") as destination:
            while True:
                chunk = uploaded_file.file.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                destination.write(chunk)

        file_size = os.path.getsize(file_path)

        file_record = File(
            user_id=user_id,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=str(file_path),
            file_size=file_size,
            mime_type=uploaded_file.content_type,
            file_extension=file_extension or None,
            is_duplicate=False,
            is_protected=False,
            is_deleted=False,
            hash_status="PENDING",
        )

        db.add(file_record)
        db.flush()

        metadata_record = FileMetadata(
            file_id=file_record.id,
            file_type=file_extension or None,
            detected_type=uploaded_file.content_type,
            description=(
                f"Metadata for uploaded file "
                f"'{original_filename}'"
            ),
            metadata_json=json.dumps(
                {
                    "original_filename": original_filename,
                    "stored_filename": stored_filename,
                    "file_size": file_size,
                    "mime_type": uploaded_file.content_type,
                    "file_extension": (
                        file_extension or None
                    ),
                }
            ),
        )

        db.add(metadata_record)

        db.commit()
        db.refresh(file_record)

        # Queue SHA-256 processing after the database
        # records have been committed.
        process_file_hash.delay(
            file_id=file_record.id,
            user_id=user_id,
        )

        return FileUploadResponse(
            message="File uploaded successfully",
            file=file_record,
        )

    except Exception:
        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise


def delete_file(
    db: Session,
    file_id: int,
    user_id: int,
    deletion_reason: str | None = None,
) -> int:
    """
    Safely delete a file.

    The physical file is removed first.
    The database record is then marked as deleted.
    A deletion-history record and audit-log record
    are created.
    """

    file_record = (
        db.query(File)
        .filter(
            File.id == file_id,
            File.user_id == user_id,
            File.is_deleted.is_(False),
        )
        .first()
    )

    if file_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    if file_record.is_protected:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Protected files cannot be deleted",
        )

    file_size = file_record.file_size
    file_path = Path(file_record.file_path)

    # Delete the physical file.
    if file_path.exists():
        try:
            file_path.unlink()
        except OSError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Unable to delete the physical file: "
                    f"{exc}"
                ),
            )

    try:
        history = DeletionHistory(
            file_id=file_record.id,
            user_id=user_id,
            filename=file_record.original_filename,
            file_size=file_record.file_size,
            deletion_reason=deletion_reason,
        )

        db.add(history)

        audit_log = AuditLog(
            user_id=user_id,
            action="DELETE_FILE",
            entity_type="FILE",
            entity_id=file_record.id,
            description=(
                f"File '{file_record.original_filename}' "
                f"was deleted. "
                f"Storage freed: "
                f"{file_record.file_size} bytes."
            ),
        )

        db.add(audit_log)

        file_record.is_deleted = True

        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "File was removed from storage, "
                "but database update failed"
            ),
        )

    return file_size