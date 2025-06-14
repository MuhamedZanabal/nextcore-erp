-- =============================================
-- Accounting Service Tables Migration
-- =============================================

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    code VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    "isBankAccount" BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    "parentId" UUID REFERENCES accounts(id) ON DELETE SET NULL,
    description TEXT,
    balance DECIMAL(15,2) DEFAULT 0,
    "debitBalance" DECIMAL(15,2) DEFAULT 0,
    "creditBalance" DECIMAL(15,2) DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "entryNumber" VARCHAR NOT NULL,
    "entryDate" DATE NOT NULL,
    reference VARCHAR,
    description TEXT,
    "totalDebit" DECIMAL(15,2) DEFAULT 0,
    "totalCredit" DECIMAL(15,2) DEFAULT 0,
    status VARCHAR DEFAULT 'draft',
    "createdById" UUID,
    "approvedById" UUID,
    "approvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create journal_lines table
CREATE TABLE IF NOT EXISTS journal_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "entryId" UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    "accountId" UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    description TEXT,
    "debitAmount" DECIMAL(15,2) DEFAULT 0,
    "creditAmount" DECIMAL(15,2) DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_id ON accounts("tenantId");
CREATE INDEX IF NOT EXISTS idx_accounts_code ON accounts(code);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
CREATE INDEX IF NOT EXISTS idx_accounts_category ON accounts(category);
CREATE INDEX IF NOT EXISTS idx_accounts_parent_id ON accounts("parentId");

CREATE INDEX IF NOT EXISTS idx_journal_entries_tenant_id ON journal_entries("tenantId");
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_number ON journal_entries("entryNumber");
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries("entryDate");
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);

CREATE INDEX IF NOT EXISTS idx_journal_lines_entry_id ON journal_lines("entryId");
CREATE INDEX IF NOT EXISTS idx_journal_lines_account_id ON journal_lines("accountId");

-- Create triggers for updated_at
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_lines_updated_at BEFORE UPDATE ON journal_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();