from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FileResponse(BaseModel):
    id: int
    original_filename: str
    stored_filename: str
    file_size: int
    mime_type: str | None
    file_extension: str | None
    is_duplicate: bool
    is_protected: bool
    is_deleted: bool
    hash_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FileUploadResponse(BaseModel):
    message: str
    file: FileResponse


class FileListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    files: list[FileResponse]


class FileDeleteResponse(BaseModel):
    message: str
    file_id: int
    storage_freed: int


class DeletionHistoryResponse(BaseModel):
    id: int
    file_id: int
    user_id: int
    filename: str
    file_size: int
    deletion_reason: str | None
    deleted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DeletionHistoryListResponse(BaseModel):
    total: int
    history: list[DeletionHistoryResponse]


class FileHashResponse(BaseModel):
    file_id: int
    algorithm: str
    hash_value: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DuplicateCheckResponse(BaseModel):
    file_id: int
    is_duplicate: bool
    duplicate_count: int
    duplicates: list[FileResponse]


class DuplicateGroupResponse(BaseModel):
    id: int
    hash_id: int
    original_file_id: int | None
    total_files: int
    total_storage: int
    potential_savings: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DuplicateGroupListResponse(BaseModel):
    total: int
    groups: list[DuplicateGroupResponse]


class DuplicateGroupDetailResponse(BaseModel):
    id: int
    hash_id: int
    original_file_id: int | None
    total_files: int
    total_storage: int
    potential_savings: int
    files: list[FileResponse]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StorageStatisticsResponse(BaseModel):
    total_files: int
    total_storage: int
    duplicate_files: int
    duplicate_storage: int
    potential_savings: int