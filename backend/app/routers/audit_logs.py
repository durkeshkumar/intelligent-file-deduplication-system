from math import ceil

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit_log import (
    AuditLogListResponse,
)


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


@router.get(
    "/",
    response_model=AuditLogListResponse,
)
def list_audit_logs(
    page: int = Query(
        1,
        ge=1,
        description="Page number",
    ),
    page_size: int = Query(
        10,
        ge=1,
        le=100,
        description="Number of audit logs per page",
    ),
    action: str | None = Query(
        None,
        description="Filter audit logs by action",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(AuditLog)
        .filter(
            AuditLog.user_id == current_user.id,
        )
    )

    if action:
        normalized_action = action.strip().upper()

        if normalized_action:
            query = query.filter(
                AuditLog.action == normalized_action
            )

    total = query.count()

    total_pages = (
        ceil(total / page_size)
        if total > 0
        else 0
    )

    offset = (page - 1) * page_size

    logs = (
        query
        .order_by(
            AuditLog.created_at.desc()
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return AuditLogListResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        logs=logs,
    )