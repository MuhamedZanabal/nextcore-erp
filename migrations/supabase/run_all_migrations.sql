-- =============================================
-- NextCore ERP - Complete Supabase Migration
-- =============================================
-- This script creates all tables for the NextCore ERP system in Supabase
-- Run this script in your Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. Auth Service Tables
-- =============================================

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL UNIQUE,
    slug VARCHAR NOT NULL UNIQUE,
    domain VARCHAR,
    "isActive" BOOLEAN DEFAULT true,
    settings JSONB,
    "planId" VARCHAR,
    "planExpiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "firstName" VARCHAR NOT NULL,
    "lastName" VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR,
    "isEmailVerified" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "lastLoginAt" TIMESTAMP,
    "tenantId" UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description VARCHAR,
    permissions JSONB DEFAULT '[]'::jsonb,
    "isSystemRole" BOOLEAN DEFAULT false,
    "tenantId" UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "refreshToken" VARCHAR NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "ipAddress" VARCHAR,
    "userAgent" VARCHAR,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table (auth module)
CREATE TABLE IF NOT EXISTS auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID REFERENCES users(id) ON DELETE SET NULL,
    "tenantId" UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    action VARCHAR NOT NULL,
    resource VARCHAR NOT NULL,
    "resourceId" VARCHAR,
    details JSONB,
    "ipAddress" VARCHAR,
    "userAgent" VARCHAR,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create security_events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID REFERENCES users(id) ON DELETE SET NULL,
    "tenantId" UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,
    severity VARCHAR NOT NULL DEFAULT 'low',
    description VARCHAR NOT NULL,
    metadata JSONB,
    "ipAddress" VARCHAR,
    "userAgent" VARCHAR,
    resolved BOOLEAN DEFAULT false,
    "resolvedAt" TIMESTAMP,
    "resolvedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create security audit_logs table
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID REFERENCES users(id) ON DELETE SET NULL,
    "tenantId" UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    action VARCHAR NOT NULL,
    resource VARCHAR NOT NULL,
    "resourceId" VARCHAR,
    details JSONB,
    "ipAddress" VARCHAR,
    "userAgent" VARCHAR,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. CRM Service Tables
-- =============================================

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "firstName" VARCHAR NOT NULL,
    "lastName" VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    phone VARCHAR,
    company VARCHAR,
    "jobTitle" VARCHAR,
    "customFields" JSONB,
    "ownerId" UUID,
    "createdById" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'draft',
    "startDate" DATE,
    "endDate" DATE,
    budget DECIMAL(10,2),
    currency VARCHAR DEFAULT 'USD',
    description TEXT,
    "targetAudience" JSONB,
    metrics JSONB,
    "ownerId" UUID,
    "createdById" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "contactId" UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    status VARCHAR DEFAULT 'new',
    score FLOAT DEFAULT 0,
    source VARCHAR,
    "campaignId" UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    "ownerId" UUID,
    "createdById" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "contactId" UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    currency VARCHAR DEFAULT 'USD',
    stage VARCHAR DEFAULT 'prospecting',
    probability FLOAT DEFAULT 0,
    "expectedCloseDate" DATE,
    "ownerId" UUID,
    "createdById" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "contactId" UUID REFERENCES contacts(id) ON DELETE SET NULL,
    "opportunityId" UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    type VARCHAR NOT NULL,
    subject VARCHAR NOT NULL,
    description TEXT,
    "dueDate" TIMESTAMP,
    completed BOOLEAN DEFAULT false,
    priority VARCHAR DEFAULT 'normal',
    metadata JSONB,
    "ownerId" UUID,
    "createdById" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. Inventory Service Tables
-- =============================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    name VARCHAR NOT NULL,
    sku VARCHAR NOT NULL UNIQUE,
    description TEXT,
    "listPrice" DECIMAL(10,2),
    currency VARCHAR DEFAULT 'USD',
    active BOOLEAN DEFAULT true,
    "trackInventory" BOOLEAN DEFAULT true,
    "inventoryMethod" VARCHAR DEFAULT 'fifo',
    "trackSerialNumbers" BOOLEAN DEFAULT false,
    "trackLots" BOOLEAN DEFAULT false,
    "reorderPoint" DECIMAL(10,2) DEFAULT 0,
    "reorderQuantity" DECIMAL(10,2) DEFAULT 0,
    attributes JSONB,
    "categoryId" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    name VARCHAR NOT NULL,
    code VARCHAR NOT NULL UNIQUE,
    address TEXT,
    active BOOLEAN DEFAULT true,
    "operatingHours" JSONB,
    capabilities JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create warehouse_zones table
CREATE TABLE IF NOT EXISTS warehouse_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "warehouseId" UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    code VARCHAR NOT NULL,
    type VARCHAR DEFAULT 'storage',
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("warehouseId", code)
);

-- Create warehouse_bins table
CREATE TABLE IF NOT EXISTS warehouse_bins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "zoneId" UUID NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    code VARCHAR NOT NULL,
    active BOOLEAN DEFAULT true,
    "maxWeight" DECIMAL(10,2),
    "maxVolume" DECIMAL(10,2),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("zoneId", code)
);

-- Create stock_levels table
CREATE TABLE IF NOT EXISTS stock_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    "warehouseId" UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    "binId" UUID REFERENCES warehouse_bins(id) ON DELETE SET NULL,
    quantity DECIMAL(10,2) DEFAULT 0,
    "reservedQuantity" DECIMAL(10,2) DEFAULT 0,
    "availableQuantity" DECIMAL(10,2) DEFAULT 0,
    "lastCounted" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("productId", "warehouseId")
);

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    reference VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    "sourceWarehouseId" UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    "destinationWarehouseId" UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    status VARCHAR DEFAULT 'draft',
    "orderId" UUID,
    notes TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stock_movement_lines table
CREATE TABLE IF NOT EXISTS stock_movement_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "movementId" UUID NOT NULL REFERENCES stock_movements(id) ON DELETE CASCADE,
    "productId" UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    "sourceBinId" UUID REFERENCES warehouse_bins(id) ON DELETE SET NULL,
    "destinationBinId" UUID REFERENCES warehouse_bins(id) ON DELETE SET NULL,
    quantity DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(10,2),
    "serialNumber" VARCHAR,
    "lotNumber" VARCHAR,
    "expiryDate" DATE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. Sales Service Tables
-- =============================================

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

-- =============================================
-- 5. Invoicing Service Tables
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

-- =============================================
-- 6. Accounting Service Tables
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

-- =============================================
-- 7. HRM Service Tables
-- =============================================

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    name VARCHAR NOT NULL,
    code VARCHAR NOT NULL,
    description TEXT,
    "managerId" UUID,
    "parentId" UUID REFERENCES departments(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("tenantId", code)
);

-- Create positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    title VARCHAR NOT NULL,
    code VARCHAR NOT NULL,
    description TEXT,
    "departmentId" UUID REFERENCES departments(id) ON DELETE SET NULL,
    "minSalary" DECIMAL(10,2),
    "maxSalary" DECIMAL(10,2),
    currency VARCHAR DEFAULT 'USD',
    requirements JSONB,
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("tenantId", code)
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "employeeId" VARCHAR NOT NULL UNIQUE,
    "firstName" VARCHAR NOT NULL,
    "lastName" VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    phone VARCHAR,
    "dateOfBirth" DATE,
    "hireDate" DATE NOT NULL,
    "terminationDate" DATE,
    status VARCHAR DEFAULT 'active',
    "departmentId" UUID REFERENCES departments(id) ON DELETE SET NULL,
    "positionId" UUID REFERENCES positions(id) ON DELETE SET NULL,
    "managerId" UUID REFERENCES employees(id) ON DELETE SET NULL,
    "userId" UUID,
    "baseSalary" DECIMAL(10,2),
    currency VARCHAR DEFAULT 'USD',
    "payFrequency" VARCHAR DEFAULT 'monthly',
    "personalInfo" JSONB,
    "emergencyContacts" JSONB,
    "bankDetails" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update departments table to reference employees
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager_id FOREIGN KEY ("managerId") REFERENCES employees(id) ON DELETE SET NULL;

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    "entryDate" DATE NOT NULL,
    "startTime" TIME,
    "endTime" TIME,
    "hoursWorked" DECIMAL(4,2),
    "breakTime" DECIMAL(4,2) DEFAULT 0,
    type VARCHAR DEFAULT 'regular',
    description TEXT,
    "projectId" UUID,
    status VARCHAR DEFAULT 'pending',
    "approvedById" UUID REFERENCES employees(id) ON DELETE SET NULL,
    "approvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalDays" DECIMAL(3,1) NOT NULL,
    reason TEXT,
    status VARCHAR DEFAULT 'pending',
    "approvedById" UUID REFERENCES employees(id) ON DELETE SET NULL,
    "approvedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Create Indexes
-- =============================================

-- Auth Service Indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users("tenantId");
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON roles("tenantId");
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions("userId");
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions("expiresAt");

-- CRM Service Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts("tenantId");
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads("tenantId");
CREATE INDEX IF NOT EXISTS idx_leads_contact_id ON leads("contactId");
CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_id ON opportunities("tenantId");
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON opportunities("contactId");
CREATE INDEX IF NOT EXISTS idx_activities_tenant_id ON activities("tenantId");

-- Inventory Service Indexes
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products("tenantId");
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_warehouses_tenant_id ON warehouses("tenantId");
CREATE INDEX IF NOT EXISTS idx_stock_levels_product_id ON stock_levels("productId");
CREATE INDEX IF NOT EXISTS idx_stock_levels_warehouse_id ON stock_levels("warehouseId");

-- Sales Service Indexes
CREATE INDEX IF NOT EXISTS idx_quotations_tenant_id ON quotations("tenantId");
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders("tenantId");
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders("customerId");

-- Invoicing Service Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices("tenantId");
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices("customerId");
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments("tenantId");

-- Accounting Service Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_id ON accounts("tenantId");
CREATE INDEX IF NOT EXISTS idx_accounts_code ON accounts(code);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tenant_id ON journal_entries("tenantId");

-- HRM Service Indexes
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON employees("tenantId");
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees("employeeId");
CREATE INDEX IF NOT EXISTS idx_departments_tenant_id ON departments("tenantId");
CREATE INDEX IF NOT EXISTS idx_positions_tenant_id ON positions("tenantId");

-- =============================================
-- Create Updated At Trigger Function
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- Create Updated At Triggers
-- =============================================

-- Auth Service Triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_events_updated_at BEFORE UPDATE ON security_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CRM Service Triggers
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inventory Service Triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouse_zones_updated_at BEFORE UPDATE ON warehouse_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouse_bins_updated_at BEFORE UPDATE ON warehouse_bins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_levels_updated_at BEFORE UPDATE ON stock_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_movements_updated_at BEFORE UPDATE ON stock_movements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_movement_lines_updated_at BEFORE UPDATE ON stock_movement_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sales Service Triggers
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotation_lines_updated_at BEFORE UPDATE ON quotation_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_lines_updated_at BEFORE UPDATE ON order_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Invoicing Service Triggers
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_lines_updated_at BEFORE UPDATE ON invoice_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_allocations_updated_at BEFORE UPDATE ON payment_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Accounting Service Triggers
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_lines_updated_at BEFORE UPDATE ON journal_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- HRM Service Triggers
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Migration Complete
-- =============================================

-- Insert a comment to indicate successful completion
COMMENT ON SCHEMA public IS 'NextCore ERP Database Schema - Migrated to Supabase';

SELECT 'NextCore ERP database migration completed successfully!' as status;