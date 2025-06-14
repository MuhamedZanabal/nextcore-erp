-- =============================================
-- Sales Service Tables Migration
-- =============================================

-- Note: products table is already created in inventory service
-- We'll create a view or reference the existing table

-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    status VARCHAR DEFAULT 'draft',
    "validUntil" DATE,
    subtotal DECIMAL(10,2) DEFAULT 0,
    "taxAmount" DECIMAL(10,2) DEFAULT 0,
    "discountAmount" DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR DEFAULT 'USD',
    terms TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create quotation_lines table
CREATE TABLE IF NOT EXISTS quotation_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "quotationId" UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    "productId" UUID NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "quotationId" UUID REFERENCES quotations(id) ON DELETE SET NULL,
    status VARCHAR DEFAULT 'new',
    "orderDate" DATE NOT NULL,
    "expectedDeliveryDate" DATE,
    subtotal DECIMAL(10,2) DEFAULT 0,
    "taxAmount" DECIMAL(10,2) DEFAULT 0,
    "discountAmount" DECIMAL(10,2) DEFAULT 0,
    "shippingAmount" DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR DEFAULT 'USD',
    "shippingAddress" JSONB,
    "billingAddress" JSONB,
    notes TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_lines table
CREATE TABLE IF NOT EXISTS order_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderId" UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    "productId" UUID NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotations_tenant_id ON quotations("tenantId");
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations("customerId");
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_valid_until ON quotations("validUntil");

CREATE INDEX IF NOT EXISTS idx_quotation_lines_quotation_id ON quotation_lines("quotationId");
CREATE INDEX IF NOT EXISTS idx_quotation_lines_product_id ON quotation_lines("productId");

CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders("tenantId");
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders("customerId");
CREATE INDEX IF NOT EXISTS idx_orders_quotation_id ON orders("quotationId");
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders("orderDate");
CREATE INDEX IF NOT EXISTS idx_orders_expected_delivery_date ON orders("expectedDeliveryDate");

CREATE INDEX IF NOT EXISTS idx_order_lines_order_id ON order_lines("orderId");
CREATE INDEX IF NOT EXISTS idx_order_lines_product_id ON order_lines("productId");

-- Create triggers for updated_at
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotation_lines_updated_at BEFORE UPDATE ON quotation_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_lines_updated_at BEFORE UPDATE ON order_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();