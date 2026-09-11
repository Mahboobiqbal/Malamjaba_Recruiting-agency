"""Add ticket_number and pnr to vendor_transactions

Revision ID: c3d4e5f6g7h8
Revises: b2c3d4e5f6g7
Create Date: 2026-09-10
"""

from alembic import op
import sqlalchemy as sa

revision = "c3d4e5f6g7h8"
down_revision = "b2c3d4e5f6g7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("vendor_transactions", sa.Column("ticket_number", sa.String(30), nullable=True))
    op.add_column("vendor_transactions", sa.Column("pnr", sa.String(20), nullable=True))


def downgrade() -> None:
    op.drop_column("vendor_transactions", "pnr")
    op.drop_column("vendor_transactions", "ticket_number")