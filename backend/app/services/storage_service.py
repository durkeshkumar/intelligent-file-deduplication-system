from sqlalchemy.orm import Session

from app.models.duplicate_group import DuplicateGroup
from app.models.file import File


def get_storage_statistics(
    db: Session,
    user_id: int,
) -> dict[str, int]:
    """Calculate storage statistics for a user."""

    files = (
        db.query(File)
        .filter(
            File.user_id == user_id,
            File.is_deleted.is_(False),
        )
        .all()
    )

    total_files = len(files)

    total_storage = sum(
        file.file_size
        for file in files
    )

    duplicate_groups = (
        db.query(DuplicateGroup)
        .join(
            File,
            DuplicateGroup.original_file_id == File.id,
        )
        .filter(
            File.user_id == user_id,
            File.is_deleted.is_(False),
            DuplicateGroup.total_files >= 2,
        )
        .all()
    )

    duplicate_files = sum(
        group.total_files - 1
        for group in duplicate_groups
    )

    duplicate_storage = sum(
        group.total_storage - (
            group.total_storage
            - group.potential_savings
        )
        for group in duplicate_groups
    )

    potential_savings = sum(
        group.potential_savings
        for group in duplicate_groups
    )

    return {
        "total_files": total_files,
        "total_storage": total_storage,
        "duplicate_files": duplicate_files,
        "duplicate_storage": duplicate_storage,
        "potential_savings": potential_savings,
    }