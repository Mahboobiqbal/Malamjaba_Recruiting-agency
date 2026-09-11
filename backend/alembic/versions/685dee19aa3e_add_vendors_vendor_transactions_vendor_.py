"""add_vendors_vendor_transactions_vendor_payments

Revision ID: 685dee19aa3e
Revises: 492f8468e31d
Create Date: 2026-09-10 21:06:44.930862

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '685dee19aa3e'
down_revision: Union[str, None] = '492f8468e31d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Vendors table
    op.create_table(
        'vendors',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('vendor_code', sa.String(20), unique=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('contact_person', sa.String(100), nullable=True),
        sa.Column('phone', sa.String(20), nullable=False),
        sa.Column('email', sa.String(100), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('bank_name', sa.String(100), nullable=True),
        sa.Column('account_title', sa.String(100), nullable=True),
        sa.Column('account_number', sa.String(50), nullable=True),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Vendor transactions table
    op.create_table(
        'vendor_transactions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('transaction_code', sa.String(20), unique=True, nullable=False),
        sa.Column('vendor_id', sa.Integer(), sa.ForeignKey('vendors.id', ondelete='CASCADE'), nullable=False),
        sa.Column('candidate_id', sa.Integer(), sa.ForeignKey('candidates.id', ondelete='SET NULL'), nullable=True),
        sa.Column('service_type', sa.String(20), nullable=False),
        sa.Column('service_id', sa.Integer(), nullable=False),
        sa.Column('purchase_price', sa.Numeric(12, 2), server_default='0'),
        sa.Column('selling_price', sa.Numeric(12, 2), server_default='0'),
        sa.Column('profit', sa.Numeric(12, 2), server_default='0'),
        sa.Column('payment_status', sa.String(20), server_default='unpaid'),
        sa.Column('paid_amount', sa.Numeric(12, 2), server_default='0'),
        sa.Column('remaining', sa.Numeric(12, 2), server_default='0'),
        sa.Column('payment_method', sa.String(20), nullable=True),
        sa.Column('reference_number', sa.String(50), nullable=True),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Vendor payments table
    op.create_table(
        'vendor_payments',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('payment_code', sa.String(20), unique=True, nullable=False),
        sa.Column('vendor_id', sa.Integer(), sa.ForeignKey('vendors.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amount', sa.Numeric(12, 2), server_default='0'),
        sa.Column('payment_method', sa.String(20), server_default='cash'),
        sa.Column('reference_number', sa.String(50), nullable=True),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('vendor_payments')
    op.drop_table('vendor_transactions')
    op.drop_table('vendors')
