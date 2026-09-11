"""Add agent_payments table

Revision ID: d4e5f6g7h8i9
Revises: c3d4e5f6g7h8
Create Date: 2026-09-10
"""

from alembic import op
import sqlalchemy as sa

revision = "d4e5f6g7h8i9"
down_revision = "c3d4e5f6g7h8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "agent_payments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("payment_code", sa.String(20), nullable=False),
        sa.Column("agent_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), default=0),
        sa.Column("payment_method", sa.String(20), default="cash"),
        sa.Column("reference_number", sa.String(50), nullable=True),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["agent_id"], ["agents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("payment_code"),
    )


def downgrade() -> None:
    op.drop_table("agent_payments")