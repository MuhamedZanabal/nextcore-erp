-- =============================================
-- Invoicing Service Tables Migration
-- =============================================

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "invoiceNumber" VARCHAR NOT NULL UNIQUE,
    "customerId" UUID NOT NULL,
    "orderId" UUID,
    "issueDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    status VARCHAR DEFAULT 'draft',
    subtotal DECIMAL(10,2) DEFAULT 0,
    "taxAmount" DECIMAL(10,2) DEFAULT 0,
    "discountAmount" DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR DEFAULT 'USD',
    notes TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoice_lines table
CREATE TABLE IF NOT EXISTS invoice_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "invoiceId" UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    "productId" UUID,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "paymentDate" DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR DEFAULT 'USD',
    "paymentMethod" VARCHAR NOT NULL,
    reference VARCHAR,
    notes TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_allocations table
CREATE TABLE IF NOT EXISTS payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "paymentId" UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    "invoiceId" UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices("tenantId");
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices("invoiceNumber");
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices("customerId");
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices("orderId");
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices("issueDate");
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices("dueDate");

CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice_id ON invoice_lines("invoiceId");
CREATE INDEX IF NOT EXISTS idx_invoice_lines_product_id ON invoice_lines("productId");

CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments("tenantId");
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments("customerId");
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments("paymentDate");
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments("paymentMethod");

CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment_id ON payment_allocations("paymentId");
CREATE INDEX IF NOT EXISTS idx_payment_allocations_invoice_id ON payment_allocations("invoiceId");

-- Create triggers for updated_at
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_lines_updated_at BEFORE UPDATE ON invoice_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_allocations_updated_at BEFORE UPDATE ON payment_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();