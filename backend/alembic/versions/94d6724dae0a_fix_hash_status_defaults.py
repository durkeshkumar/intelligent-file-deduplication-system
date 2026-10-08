"""fix hash status defaults

Revision ID: 94d6724dae0a
Revises: 33aa1f4297ce
Create Date: 2026-10-05
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "94d6724dae0a"
down_revision: Union[str, Sequence[str], None] = "33aa1f4297ce"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Correct existing hash status values.

    Files that already have a SHA-256 hash are marked COMPLETED.
    Files without a SHA-256 hash are marked PENDING.
    """

    op.execute(
        """
        UPDATE files
        SET hash_status = 'COMPLETED'
        WHERE id IN (
            SELECT file_id
            FROM file_hashes
            WHERE algorithm = 'sha256'
        )
        """
    )

    op.execute(
        """
        UPDATE files
        SET hash_status = 'PENDING'
        WHERE hash_status IS NULL
           OR hash_status = ''
        """
    )


def downgrade() -> None:
    """
    Restore empty hash status values.

    This downgrade is intentionally limited because the previous
    schema did not have meaningful status values for existing rows.
    """

    op.execute(
        """
        UPDATE files
        SET hash_status = ''
        """
    )