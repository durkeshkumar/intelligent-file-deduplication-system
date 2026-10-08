from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class FileHash(Base):
    __tablename__ = "file_hashes"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    file_id: Mapped[int] = mapped_column(
        ForeignKey("files.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    algorithm: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="sha256",
    )

    hash_value: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    file = relationship(
        "File",
        backref="file_hash",
    )