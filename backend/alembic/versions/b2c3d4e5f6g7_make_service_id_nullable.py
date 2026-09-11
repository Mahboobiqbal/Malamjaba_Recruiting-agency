"""Make service_id nullable in vendor_transactions

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f7
Create Date: 2026-09-10
"""

from alembic import op
import sqlalchemy as sa

revision = "b2c3d4e5f6g7"
down_revision = "a1b2c3d4e5f7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("vendor_transactions") as batch_op:
        batch_op.alter_column("service_id", nullable=True)


def downgrade() -> None:
    with op.batch_alter_table("vendor_transactions") as batch_op:
        batch_op.alter_column("service_id", nullable=False)
