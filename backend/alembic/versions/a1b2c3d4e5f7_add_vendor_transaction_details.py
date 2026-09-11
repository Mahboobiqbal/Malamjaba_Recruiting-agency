"""Add professional details to vendor_transactions

Revision ID: a1b2c3d4e5f7
Revises: 685dee19aa3e
Create Date: 2026-09-10
"""

from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f7"
down_revision = "685dee19aa3e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("vendor_transactions", sa.Column("passenger_name", sa.String(100), nullable=True))
    op.add_column("vendor_transactions", sa.Column("origin", sa.String(50), nullable=True))
    op.add_column("vendor_transactions", sa.Column("destination", sa.String(50), nullable=True))
    op.add_column("vendor_transactions", sa.Column("travel_date", sa.Date(), nullable=True))
    op.add_column("vendor_transactions", sa.Column("travel_time", sa.String(10), nullable=True))
    op.add_column("vendor_transactions", sa.Column("airline", sa.String(50), nullable=True))
    op.add_column("vendor_transactions", sa.Column("flight_number", sa.String(20), nullable=True))
    op.add_column("vendor_transactions", sa.Column("visa_country", sa.String(50), nullable=True))
    op.add_column("vendor_transactions", sa.Column("visa_type", sa.String(50), nullable=True))
    op.add_column("vendor_transactions", sa.Column("visa_date", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("vendor_transactions", "visa_date")
    op.drop_column("vendor_transactions", "visa_type")
    op.drop_column("vendor_transactions", "visa_country")
    op.drop_column("vendor_transactions", "flight_number")
    op.drop_column("vendor_transactions", "airline")
    op.drop_column("vendor_transactions", "travel_time")
    op.drop_column("vendor_transactions", "travel_date")
    op.drop_column("vendor_transactions", "destination")
    op.drop_column("vendor_transactions", "origin")
    op.drop_column("vendor_transactions", "passenger_name")
