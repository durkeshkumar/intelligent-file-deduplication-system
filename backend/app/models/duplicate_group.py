from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class DuplicateGroup(Base):
    __tablename__ = "duplicate_groups"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    hash_id: Mapped[int] = mapped_column(
        ForeignKey("file_hashes.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    original_file_id: Mapped[int | None] = mapped_column(
        ForeignKey("files.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    total_files: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
    )

    total_storage: Mapped[int] = mapped_column(
        BigInteger,
        default=0,
        nullable=False,
    )

    potential_savings: Mapped[int] = mapped_column(
        BigInteger,
        default=0,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    hash = relationship(
        "FileHash",
        backref="duplicate_group",
    )

    original_file = relationship(
        "File",
        foreign_keys=[original_file_id],
    )