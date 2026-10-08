export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
}

export interface FileRecord {
  id: number;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  mime_type: string | null;
  file_extension: string | null;
  is_duplicate: boolean;
  is_protected: boolean;
  is_deleted: boolean;
  hash_status:
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED";
  created_at: string;
}

export interface FileListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  files: FileRecord[];
}

export interface FileUploadResponse {
  message: string;
  file: FileRecord;
}

export interface HashProcessingResponse {
  message: string;
  file_id: number;
  task_id: string;
  hash_status: string;
}

export interface DuplicateCheckResponse {
  file_id: number;
  is_duplicate: boolean;
  duplicate_count: number;
  duplicates: FileRecord[];
}

export interface StorageStatistics {
  total_files: number;
  total_storage: number;
  duplicate_files: number;
  duplicate_storage: number;
  potential_savings: number;
}

export interface DuplicateGroup {
  id: number;
  hash_id: string;
  original_file_id: number | null;
  total_files: number;
  total_storage: number;
  potential_savings: number;
  created_at: string;
  updated_at?: string;
}

export interface DuplicateGroupListResponse {
  total: number;
  groups: DuplicateGroup[];
}

export interface DeletionHistory {
  id: number;
  file_id: number;
  user_id: number;
  filename: string;
  file_size: number;
  deletion_reason: string | null;
  deleted_at: string;
}

export interface DeletionHistoryListResponse {
  total: number;
  history: DeletionHistory[];
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  description: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  logs: AuditLog[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}