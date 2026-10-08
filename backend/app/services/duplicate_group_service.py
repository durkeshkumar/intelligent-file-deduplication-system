from sqlalchemy.orm import Session

from app.models.duplicate_group import DuplicateGroup
from app.models.file import File
from app.models.file_hash import FileHash


def create_or_update_duplicate_group(
    db: Session,
    file_id: int,
    user_id: int,
) -> DuplicateGroup | None:
    """
    Create or update a single duplicate group for a SHA-256 hash.

    All files with the same SHA-256 hash belong to one duplicate group.
    The earliest uploaded active file is selected as the original file.
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
        return None

    file_hash = (
        db.query(FileHash)
        .filter(
            FileHash.file_id == file_id,
            FileHash.algorithm == "sha256",
        )
        .first()
    )

    if file_hash is None:
        return None

    matching_hashes = (
        db.query(FileHash)
        .filter(
            FileHash.hash_value == file_hash.hash_value,
            FileHash.algorithm == "sha256",
        )
        .order_by(FileHash.id.asc())
        .all()
    )

    if not matching_hashes:
        return None

    file_ids = [
        hash_record.file_id
        for hash_record in matching_hashes
    ]

    matching_files = (
        db.query(File)
        .filter(
            File.id.in_(file_ids),
            File.user_id == user_id,
            File.is_deleted.is_(False),
        )
        .order_by(
            File.created_at.asc(),
            File.id.asc(),
        )
        .all()
    )

    if len(matching_files) < 2:
        return None

    original_file = matching_files[0]

    total_files = len(matching_files)

    total_storage = sum(
        file.file_size
        for file in matching_files
    )

    potential_savings = total_storage - original_file.file_size

    canonical_hash = matching_hashes[0]

    duplicate_group = (
        db.query(DuplicateGroup)
        .filter(
            DuplicateGroup.hash_id == canonical_hash.id,
        )
        .first()
    )

    if duplicate_group is None:
        existing_groups = (
            db.query(DuplicateGroup)
            .join(
                FileHash,
                DuplicateGroup.hash_id == FileHash.id,
            )
            .filter(
                FileHash.hash_value == file_hash.hash_value,
                FileHash.algorithm == "sha256",
            )
            .all()
        )

        if existing_groups:
            duplicate_group = existing_groups[0]
            duplicate_group.hash_id = canonical_hash.id

            for extra_group in existing_groups[1:]:
                db.delete(extra_group)

    if duplicate_group is None:
        duplicate_group = DuplicateGroup(
            hash_id=canonical_hash.id,
            original_file_id=original_file.id,
            total_files=total_files,
            total_storage=total_storage,
            potential_savings=potential_savings,
        )

        db.add(duplicate_group)

    else:
        duplicate_group.hash_id = canonical_hash.id
        duplicate_group.original_file_id = original_file.id
        duplicate_group.total_files = total_files
        duplicate_group.total_storage = total_storage
        duplicate_group.potential_savings = potential_savings

    # Mark every file in this group as a duplicate.
    for matching_file in matching_files:
        matching_file.is_duplicate = True

    db.commit()
    db.refresh(duplicate_group)

    return duplicate_group


def get_duplicate_group_files(
    db: Session,
    group_id: int,
    user_id: int,
) -> tuple[DuplicateGroup | None, list[File]]:
    """
    Retrieve a duplicate group and all active files
    belonging to its SHA-256 hash.
    """

    group = (
        db.query(DuplicateGroup)
        .join(
            FileHash,
            DuplicateGroup.hash_id == FileHash.id,
        )
        .join(
            File,
            FileHash.file_id == File.id,
        )
        .filter(
            DuplicateGroup.id == group_id,
            File.user_id == user_id,
            File.is_deleted.is_(False),
        )
        .first()
    )

    if group is None:
        return None, []

    group_hash = (
        db.query(FileHash)
        .filter(
            FileHash.id == group.hash_id,
            FileHash.algorithm == "sha256",
        )
        .first()
    )

    if group_hash is None:
        return group, []

    matching_hashes = (
        db.query(FileHash)
        .filter(
            FileHash.hash_value == group_hash.hash_value,
            FileHash.algorithm == "sha256",
        )
        .all()
    )

    file_ids = [
        hash_record.file_id
        for hash_record in matching_hashes
    ]

    files = (
        db.query(File)
        .filter(
            File.id.in_(file_ids),
            File.user_id == user_id,
            File.is_deleted.is_(False),
        )
        .order_by(
            File.created_at.asc(),
            File.id.asc(),
        )
        .all()
    )

    return group, files


def rebuild_duplicate_groups(
    db: Session,
    user_id: int,
) -> int:
    """
    Rebuild duplicate groups and synchronize duplicate flags
    for all active hashed files belonging to the current user.
    """

    # Start by resetting all active files belonging to the user.
    # They will be marked as duplicates again if they belong
    # to a valid duplicate group.
    active_files = (
        db.query(File)
        .filter(
            File.user_id == user_id,
            File.is_deleted.is_(False),
        )
        .all()
    )

    for file_record in active_files:
        file_record.is_duplicate = False

    file_hashes = (
        db.query(FileHash)
        .join(
            File,
            FileHash.file_id == File.id,
        )
        .filter(
            File.user_id == user_id,
            File.is_deleted.is_(False),
            FileHash.algorithm == "sha256",
        )
        .order_by(FileHash.id.asc())
        .all()
    )

    processed_hashes: set[str] = set()
    rebuilt_count = 0

    for file_hash in file_hashes:
        hash_value = file_hash.hash_value

        if hash_value in processed_hashes:
            continue

        processed_hashes.add(hash_value)

        matching_hashes = (
            db.query(FileHash)
            .join(
                File,
                FileHash.file_id == File.id,
            )
            .filter(
                FileHash.hash_value == hash_value,
                FileHash.algorithm == "sha256",
                File.user_id == user_id,
                File.is_deleted.is_(False),
            )
            .order_by(FileHash.id.asc())
            .all()
        )

        if len(matching_hashes) < 2:
            continue

        file_ids = [
            hash_record.file_id
            for hash_record in matching_hashes
        ]

        matching_files = (
            db.query(File)
            .filter(
                File.id.in_(file_ids),
                File.user_id == user_id,
                File.is_deleted.is_(False),
            )
            .order_by(
                File.created_at.asc(),
                File.id.asc(),
            )
            .all()
        )

        if len(matching_files) < 2:
            continue

        original_file = matching_files[0]

        total_files = len(matching_files)

        total_storage = sum(
            file.file_size
            for file in matching_files
        )

        potential_savings = (
            total_storage - original_file.file_size
        )

        canonical_hash = matching_hashes[0]

        duplicate_group = (
            db.query(DuplicateGroup)
            .filter(
                DuplicateGroup.hash_id == canonical_hash.id,
            )
            .first()
        )

        if duplicate_group is None:
            existing_groups = (
                db.query(DuplicateGroup)
                .join(
                    FileHash,
                    DuplicateGroup.hash_id == FileHash.id,
                )
                .filter(
                    FileHash.hash_value == hash_value,
                    FileHash.algorithm == "sha256",
                )
                .all()
            )

            if existing_groups:
                duplicate_group = existing_groups[0]
                duplicate_group.hash_id = canonical_hash.id

                for extra_group in existing_groups[1:]:
                    db.delete(extra_group)

        if duplicate_group is None:
            duplicate_group = DuplicateGroup(
                hash_id=canonical_hash.id,
                original_file_id=original_file.id,
                total_files=total_files,
                total_storage=total_storage,
                potential_savings=potential_savings,
            )

            db.add(duplicate_group)

        else:
            duplicate_group.hash_id = canonical_hash.id
            duplicate_group.original_file_id = original_file.id
            duplicate_group.total_files = total_files
            duplicate_group.total_storage = total_storage
            duplicate_group.potential_savings = potential_savings

        # Mark all files in this valid duplicate group.
        for matching_file in matching_files:
            matching_file.is_duplicate = True

        rebuilt_count += 1

    db.commit()

    return rebuilt_count