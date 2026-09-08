"""initial schema - baseline

Revision ID: 6d51eb8a0fa4
Revises: 
Create Date: 2026-09-08 17:38:08.699385

This is the initial baseline migration. All tables already exist in the database.
Alembic is stamped to this revision as the starting point.
Future schema changes should create new migration files.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6d51eb8a0fa4'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Baseline - all tables already exist. No changes needed.
    pass


def downgrade() -> None:
    # Cannot downgrade from baseline
    pass
