"""add paid_amount to medical_token

Revision ID: 492f8468e31d
Revises: a1b2c3d4e5f6
Create Date: 2026-09-10 03:06:57.572565

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '492f8468e31d'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add column as nullable with default 0 (SQLite compatible)
    op.add_column('medical_tokens', sa.Column('paid_amount', sa.Numeric(precision=12, scale=2), nullable=True, server_default='0'))
    # Payment table foreign keys (already exist)
    op.drop_constraint(None, 'payments', type_='foreignkey')
    op.create_foreign_key(None, 'payments', 'users', ['received_by'], ['id'], ondelete='SET NULL')
    op.create_foreign_key(None, 'payments', 'tickets', ['ticket_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key(None, 'payments', 'visas', ['visa_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key(None, 'payments', 'medical_tokens', ['medical_token_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    op.drop_constraint(None, 'payments', type_='foreignkey')
    op.drop_constraint(None, 'payments', type_='foreignkey')
    op.drop_constraint(None, 'payments', type_='foreignkey')
    op.drop_constraint(None, 'payments', type_='foreignkey')
    op.create_foreign_key(None, 'payments', 'users', ['received_by'], ['id'])
    op.drop_column('medical_tokens', 'paid_amount')