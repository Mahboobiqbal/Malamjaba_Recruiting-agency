"""add payment service links

Revision ID: a1b2c3d4e5f6
Revises: 6d51eb8a0fa4
Create Date: 2026-09-09 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '6d51eb8a0fa4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('payments', sa.Column('visa_id', sa.Integer(), nullable=True))
    op.add_column('payments', sa.Column('ticket_id', sa.Integer(), nullable=True))
    op.add_column('payments', sa.Column('medical_token_id', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('payments', 'medical_token_id')
    op.drop_column('payments', 'ticket_id')
    op.drop_column('payments', 'visa_id')
