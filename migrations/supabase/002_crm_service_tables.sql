-- =============================================
-- CRM Service Tables Migration
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts("tenantId");
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts("ownerId");

CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON campaigns("tenantId");
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_owner_id ON campaigns("ownerId");

CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads("tenantId");
CREATE INDEX IF NOT EXISTS idx_leads_contact_id ON leads("contactId");
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads("campaignId");
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads("ownerId");

CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_id ON opportunities("tenantId");
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON opportunities("contactId");
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner_id ON opportunities("ownerId");
CREATE INDEX IF NOT EXISTS idx_opportunities_expected_close_date ON opportunities("expectedCloseDate");

CREATE INDEX IF NOT EXISTS idx_activities_tenant_id ON activities("tenantId");
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities("contactId");
CREATE INDEX IF NOT EXISTS idx_activities_opportunity_id ON activities("opportunityId");
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities("dueDate");
CREATE INDEX IF NOT EXISTS idx_activities_completed ON activities(completed);
CREATE INDEX IF NOT EXISTS idx_activities_owner_id ON activities("ownerId");

-- Create triggers for updated_at
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();