from pathlib import Path

from app.celery_app.celery import celery_app
from app.core.logging import setup_logging
from app.db.database import SessionLocal
from app.models.file import File
from app.models.file_hash import FileHash
from app.services.duplicate_group_service import (
    create_or_update_duplicate_group,
)
from app.utils.file_hash import calculate_sha256


setup_logging()


@celery_app.task(
    bind=True,
    name="app.tasks.file_tasks.process_file_hash",
    max_retries=3,
)
def process_file_hash(
    self,
    file_id: int,
    user_id: int,
) -> dict:
    """
    Calculate the SHA-256 hash of a file in the background.

    Unexpected processing errors are automatically retried
    up to three times.
    """

    db = SessionLocal()

    try:
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
            return {
                "status": "failed",
                "file_id": file_id,
                "message": "File not found",
            }

        file_record.hash_status = "PROCESSING"
        db.commit()

        # Always verify that the physical file exists before
        # using an existing hash record.
        file_path = Path(file_record.file_path)

        if not file_path.is_file():
            raise FileNotFoundError(
                f"Physical file not found: {file_path}"
            )

        existing_hash = (
            db.query(FileHash)
            .filter(
                FileHash.file_id == file_id,
                FileHash.algorithm == "sha256",
            )
            .first()
        )

        if existing_hash is not None:
            create_or_update_duplicate_group(
                db=db,
                file_id=file_id,
                user_id=user_id,
            )

            file_record.hash_status = "COMPLETED"
            db.commit()

            return {
                "status": "success",
                "file_id": file_id,
                "hash": existing_hash.hash_value,
                "message": "Hash already exists",
            }

        hash_value = calculate_sha256(file_path)

        file_hash = FileHash(
            file_id=file_id,
            algorithm="sha256",
            hash_value=hash_value,
        )

        db.add(file_hash)
        db.commit()

        create_or_update_duplicate_group(
            db=db,
            file_id=file_id,
            user_id=user_id,
        )

        file_record.hash_status = "COMPLETED"
        db.commit()

        return {
            "status": "success",
            "file_id": file_id,
            "hash": hash_value,
            "message": "File hash processed successfully",
        }

    except Exception as exc:
        db.rollback()

        if self.request.retries < self.max_retries:
            try:
                retry_file = (
                    db.query(File)
                    .filter(
                        File.id == file_id,
                        File.user_id == user_id,
                    )
                    .first()
                )

                if retry_file is not None:
                    retry_file.hash_status = "PROCESSING"
                    db.commit()

            except Exception:
                db.rollback()

            raise self.retry(
                exc=exc,
                countdown=10,
            )

        try:
            failed_file = (
                db.query(File)
                .filter(
                    File.id == file_id,
                    File.user_id == user_id,
                )
                .first()
            )

            if failed_file is not None:
                failed_file.hash_status = "FAILED"
                db.commit()

        except Exception:
            db.rollback()

        raise

    finally:
        db.close()