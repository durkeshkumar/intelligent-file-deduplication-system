from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.file import File
from app.models.file_hash import FileHash
from app.utils.file_hash import calculate_sha256


def create_file_hash(
    db: Session,
    file_id: int,
    user_id: int,
) -> FileHash:
    """Calculate and store the SHA-256 hash for a file."""

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

    existing_hash = (
        db.query(FileHash)
        .filter(
            FileHash.file_id == file_id,
        )
        .first()
    )

    if existing_hash is not None:
        return existing_hash

    file_path = Path(file_record.file_path)

    try:
        hash_value = calculate_sha256(file_path)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical file not found in storage",
        )

    file_hash = FileHash(
        file_id=file_id,
        algorithm="sha256",
        hash_value=hash_value,
    )

    db.add(file_hash)
    db.commit()
    db.refresh(file_hash)

    return file_hash