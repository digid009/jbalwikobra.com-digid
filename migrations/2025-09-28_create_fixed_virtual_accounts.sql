-- Create Fixed Virtual Accounts table for storing Xendit Fixed VAs
-- This allows us to reuse VAs and bind them to invoices

CREATE TABLE IF NOT EXISTS fixed_virtual_accounts (
    id BIGSERIAL PRIMARY KEY,
    xendit_va_id VARCHAR(255) UNIQUE NOT NULL,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    bank_code VARCHAR(50) NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    expected_amount BIGINT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    expiration_date TIMESTAMPTZ,
    is_closed BOOLEAN DEFAULT true,
    merchant_code VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'IDR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fixed_vas_xendit_va_id ON fixed_virtual_accounts(xendit_va_id);
CREATE INDEX IF NOT EXISTS idx_fixed_vas_external_id ON fixed_virtual_accounts(external_id);
CREATE INDEX IF NOT EXISTS idx_fixed_vas_bank_code ON fixed_virtual_accounts(bank_code);
CREATE INDEX IF NOT EXISTS idx_fixed_vas_status ON fixed_virtual_accounts(status);

-- Add comments
COMMENT ON TABLE fixed_virtual_accounts IS 'Stores Xendit Fixed Virtual Accounts that can be reused and bound to invoices';
COMMENT ON COLUMN fixed_virtual_accounts.xendit_va_id IS 'Xendit Fixed VA ID used for binding to invoices';
COMMENT ON COLUMN fixed_virtual_accounts.external_id IS 'External ID used to identify the VA';
COMMENT ON COLUMN fixed_virtual_accounts.account_number IS 'The actual Virtual Account number that customers use for transfers';
COMMENT ON COLUMN fixed_virtual_accounts.is_closed IS 'Whether the VA only accepts the exact expected amount';