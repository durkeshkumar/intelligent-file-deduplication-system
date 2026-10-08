from sqlalchemy.orm import Session

from app.models.file import File
from app.models.file_hash import FileHash


def find_duplicate_files(
    db: Session,
    file_id: int,
    user_id: int,
) -> list[File]:
    """
    Find files belonging to the same user that have
    exactly the same SHA-256 hash.
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
        return []

    file_hash = (
        db.query(FileHash)
        .filter(
            FileHash.file_id == file_id,
            FileHash.algorithm == "sha256",
        )
        .first()
    )

    if file_hash is None:
        return []

    duplicate_hashes = (
        db.query(FileHash)
        .filter(
            FileHash.hash_value == file_hash.hash_value,
            FileHash.algorithm == "sha256",
        )
        .all()
    )

    duplicate_file_ids = [
        hash_record.file_id
        for hash_record in duplicate_hashes
        if hash_record.file_id != file_id
    ]

    if not duplicate_file_ids:
        return []

    return (
        db.query(File)
        .filter(
            File.id.in_(duplicate_file_ids),
            File.user_id == user_id,
            File.is_deleted.is_(False),
        )
        .order_by(
            File.created_at.asc()
        )
        .all()
    )