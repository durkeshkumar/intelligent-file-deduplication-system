from datetime import date, datetime, time
from math import ceil

from fastapi import (
    APIRouter,
    Depends,
    File as FastAPIFile,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse as FastAPIFileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.deletion_history import DeletionHistory
from app.models.duplicate_group import DuplicateGroup
from app.models.file import File
from app.models.user import User
from app.schemas.file import (
    DeletionHistoryListResponse,
    DuplicateCheckResponse,
    DuplicateGroupDetailResponse,
    DuplicateGroupListResponse,
    FileListResponse,
    FileResponse,
    FileUploadResponse,
    StorageStatisticsResponse,
)
from app.services.duplicate_group_service import (
    create_or_update_duplicate_group,
    get_duplicate_group_files,
    rebuild_duplicate_groups,
)
from app.services.duplicate_service import find_duplicate_files
from app.services.file_service import delete_file, upload_file
from app.services.hash_service import create_file_hash
from app.services.storage_service import get_storage_statistics
from app.tasks.file_tasks import process_file_hash


router = APIRouter(
    prefix="/files",
    tags=["Files"],
)


@router.post(
    "/upload",
    response_model=FileUploadResponse,
)
def upload(
    uploaded_file: UploadFile = FastAPIFile(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return upload_file(
        db=db,
        user_id=current_user.id,
        uploaded_file=uploaded_file,
    )


@router.get(
    "/",
    response_model=FileListResponse,
)
def list_files(
    page: int = Query(
        1,
        ge=1,
        description="Page number",
    ),
    page_size: int = Query(
        10,
        ge=1,
        le=100,
        description="Number of files per page",
    ),
    search: str | None = Query(
        None,
        description="Search files by filename",
    ),
    file_type: str | None = Query(
        None,
        description="Filter by file extension, for example txt or pdf",
    ),
    min_size: int | None = Query(
        None,
        ge=0,
        description="Minimum file size in bytes",
    ),
    max_size: int | None = Query(
        None,
        ge=0,
        description="Maximum file size in bytes",
    ),
    is_duplicate: bool | None = Query(
        None,
        description="Filter duplicate or non-duplicate files",
    ),
    hash_status: str | None = Query(
        None,
        description="Filter by hash processing status",
    ),
    date_from: date | None = Query(
        None,
        description="Filter files created on or after this date",
    ),
    date_to: date | None = Query(
        None,
        description="Filter files created on or before this date",
    ),
    sort_by: str = Query(
        "created_at",
        description=(
            "Sort field. Allowed values: "
            "created_at, file_size, original_filename"
        ),
    ),
    sort_order: str = Query(
        "desc",
        description="Sort order. Allowed values: asc, desc",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if (
        min_size is not None
        and max_size is not None
        and min_size > max_size
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_size cannot be greater than max_size",
        )

    if (
        date_from is not None
        and date_to is not None
        and date_from > date_to
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="date_from cannot be later than date_to",
        )

    normalized_sort_by = sort_by.strip().lower()

    allowed_sort_fields = {
        "created_at": File.created_at,
        "file_size": File.file_size,
        "original_filename": File.original_filename,
    }

    if normalized_sort_by not in allowed_sort_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid sort_by. Allowed values: "
                "created_at, file_size, original_filename"
            ),
        )

    normalized_sort_order = sort_order.strip().lower()

    if normalized_sort_order not in {"asc", "desc"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid sort_order. Allowed values: "
                "asc, desc"
            ),
        )

    base_query = (
        db.query(File)
        .filter(
            File.user_id == current_user.id,
            File.is_deleted.is_(False),
        )
    )

    if search:
        search_value = search.strip()

        if search_value:
            base_query = base_query.filter(
                File.original_filename.ilike(
                    f"%{search_value}%"
                )
            )

    if file_type:
        normalized_file_type = file_type.strip().lower()

        if normalized_file_type:
            if not normalized_file_type.startswith("."):
                normalized_file_type = (
                    f".{normalized_file_type}"
                )

            base_query = base_query.filter(
                func.lower(File.file_extension)
                == normalized_file_type
            )

    if min_size is not None:
        base_query = base_query.filter(
            File.file_size >= min_size
        )

    if max_size is not None:
        base_query = base_query.filter(
            File.file_size <= max_size
        )

    if is_duplicate is not None:
        base_query = base_query.filter(
            File.is_duplicate == is_duplicate
        )

    if hash_status:
        normalized_hash_status = hash_status.strip().upper()

        allowed_hash_statuses = {
            "PENDING",
            "PROCESSING",
            "COMPLETED",
            "FAILED",
        }

        if normalized_hash_status not in allowed_hash_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid hash_status. Allowed values: "
                    "PENDING, PROCESSING, COMPLETED, FAILED"
                ),
            )

        base_query = base_query.filter(
            File.hash_status == normalized_hash_status
        )

    if date_from is not None:
        start_datetime = datetime.combine(
            date_from,
            time.min,
        )

        base_query = base_query.filter(
            File.created_at >= start_datetime
        )

    if date_to is not None:
        end_datetime = datetime.combine(
            date_to,
            time.max,
        )

        base_query = base_query.filter(
            File.created_at <= end_datetime
        )

    total = base_query.count()

    total_pages = ceil(total / page_size) if total > 0 else 0

    offset = (page - 1) * page_size

    sort_column = allowed_sort_fields[normalized_sort_by]

    if normalized_sort_order == "asc":
        base_query = base_query.order_by(
            sort_column.asc()
        )
    else:
        base_query = base_query.order_by(
            sort_column.desc()
        )

    files = (
        base_query
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return FileListResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        files=files,
    )


@router.get(
    "/history/deletions",
    response_model=DeletionHistoryListResponse,
)
def deletion_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = (
        db.query(DeletionHistory)
        .filter(
            DeletionHistory.user_id == current_user.id,
        )
        .order_by(
            DeletionHistory.deleted_at.desc()
        )
        .all()
    )

    return DeletionHistoryListResponse(
        total=len(history),
        history=history,
    )


@router.get(
    "/duplicate-groups",
    response_model=DuplicateGroupListResponse,
)
def list_duplicate_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    groups = (
        db.query(DuplicateGroup)
        .join(
            File,
            DuplicateGroup.original_file_id == File.id,
        )
        .filter(
            File.user_id == current_user.id,
            File.is_deleted.is_(False),
            DuplicateGroup.total_files >= 2,
        )
        .order_by(
            DuplicateGroup.potential_savings.desc()
        )
        .all()
    )

    return DuplicateGroupListResponse(
        total=len(groups),
        groups=groups,
    )


@router.post(
    "/duplicate-groups/rebuild",
)
def rebuild_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rebuilt_count = rebuild_duplicate_groups(
        db=db,
        user_id=current_user.id,
    )

    return {
        "message": "Duplicate groups rebuilt successfully",
        "rebuilt_groups": rebuilt_count,
    }


@router.get(
    "/duplicate-groups/{group_id}",
    response_model=DuplicateGroupDetailResponse,
)
def get_duplicate_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    group, files = get_duplicate_group_files(
        db=db,
        group_id=group_id,
        user_id=current_user.id,
    )

    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Duplicate group not found",
        )

    return DuplicateGroupDetailResponse(
        id=group.id,
        hash_id=group.hash_id,
        original_file_id=group.original_file_id,
        total_files=group.total_files,
        total_storage=group.total_storage,
        potential_savings=group.potential_savings,
        files=files,
        created_at=group.created_at,
        updated_at=group.updated_at,
    )


@router.get(
    "/storage/statistics",
    response_model=StorageStatisticsResponse,
)
def storage_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    statistics = get_storage_statistics(
        db=db,
        user_id=current_user.id,
    )

    return StorageStatisticsResponse(
        **statistics,
    )


@router.post(
    "/{file_id}/hash",
)
def generate_file_hash(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_record = (
        db.query(File)
        .filter(
            File.id == file_id,
            File.user_id == current_user.id,
            File.is_deleted.is_(False),
        )
        .first()
    )

    if file_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    if file_record.hash_status == "PROCESSING":
        return {
            "message": "File hash processing is already in progress",
            "file_id": file_id,
            "hash_status": file_record.hash_status,
        }

    task = process_file_hash.delay(
        file_id=file_id,
        user_id=current_user.id,
    )

    return {
        "message": "File hash processing queued successfully",
        "file_id": file_id,
        "task_id": task.id,
        "hash_status": "PENDING",
    }


@router.post(
    "/{file_id}/check-duplicate",
    response_model=DuplicateCheckResponse,
)
def check_duplicate(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_record = (
        db.query(File)
        .filter(
            File.id == file_id,
            File.user_id == current_user.id,
            File.is_deleted.is_(False),
        )
        .first()
    )

    if file_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    create_file_hash(
        db=db,
        file_id=file_id,
        user_id=current_user.id,
    )

    duplicate_files = find_duplicate_files(
        db=db,
        file_id=file_id,
        user_id=current_user.id,
    )

    if duplicate_files:
        file_record.is_duplicate = True

        for duplicate_file in duplicate_files:
            duplicate_file.is_duplicate = True

        db.commit()

        create_or_update_duplicate_group(
            db=db,
            file_id=file_id,
            user_id=current_user.id,
        )

    return DuplicateCheckResponse(
        file_id=file_id,
        is_duplicate=len(duplicate_files) > 0,
        duplicate_count=len(duplicate_files),
        duplicates=duplicate_files,
    )


@router.get(
    "/{file_id}",
    response_model=FileResponse,
)
def get_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_record = (
        db.query(File)
        .filter(
            File.id == file_id,
            File.user_id == current_user.id,
            File.is_deleted.is_(False),
        )
        .first()
    )

    if file_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    return file_record


@router.get(
    "/{file_id}/download",
)
def download_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_record = (
        db.query(File)
        .filter(
            File.id == file_id,
            File.user_id == current_user.id,
            File.is_deleted.is_(False),
        )
        .first()
    )

    if file_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    file_path = file_record.file_path

    try:
        with open(file_path, "rb"):
            pass
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical file not found in storage",
        )

    return FastAPIFileResponse(
        path=file_path,
        filename=file_record.original_filename,
        media_type=file_record.mime_type
        or "application/octet-stream",
    )


@router.delete(
    "/{file_id}",
)
def delete(
    file_id: int,
    deletion_reason: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    storage_freed = delete_file(
        db=db,
        file_id=file_id,
        user_id=current_user.id,
        deletion_reason=deletion_reason,
    )

    return {
        "message": "File deleted successfully",
        "file_id": file_id,
        "storage_freed": storage_freed,
    }