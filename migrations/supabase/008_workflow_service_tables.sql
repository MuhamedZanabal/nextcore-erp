-- Workflow Service Tables
-- NextCore ERP - Workflow Engine

-- Create enum types
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'inactive', 'archived');
CREATE TYPE trigger_type AS ENUM ('manual', 'scheduled', 'event', 'webhook');
CREATE TYPE execution_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled', 'paused');
CREATE TYPE step_status AS ENUM ('pending', 'running', 'completed', 'failed', 'skipped');
CREATE TYPE step_type AS ENUM ('start', 'end', 'action', 'condition', 'loop', 'delay', 'script', 'http_request', 'email', 'notification', 'database', 'approval');
CREATE TYPE template_category AS ENUM ('approval', 'notification', 'data_processing', 'integration', 'automation', 'reporting');

-- Workflows table
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status workflow_status DEFAULT 'draft',
    trigger_type trigger_type DEFAULT 'manual',
    trigger_config JSONB,
    definition JSONB NOT NULL,
    variables JSONB,
    category VARCHAR(100),
    tags VARCHAR(100),
    version INTEGER DEFAULT 1,
    tenant_id UUID,
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow executions table
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    status execution_status DEFAULT 'pending',
    input_data JSONB,
    output_data JSONB,
    context JSONB,
    error_message TEXT,
    error_details JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    triggered_by UUID,
    trigger_source VARCHAR(100),
    tenant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow steps table
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    step_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type step_type NOT NULL,
    status step_status DEFAULT 'pending',
    input_data JSONB,
    output_data JSONB,
    config JSONB,
    error_message TEXT,
    error_details JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    execution_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow templates table
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category template_category NOT NULL,
    definition JSONB NOT NULL,
    default_config JSONB,
    tags VARCHAR(100),
    is_public BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    version VARCHAR(50),
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_category ON workflows(category);
CREATE INDEX idx_workflows_tenant ON workflows(tenant_id);
CREATE INDEX idx_workflows_created_by ON workflows(created_by);

CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_tenant ON workflow_executions(tenant_id);
CREATE INDEX idx_workflow_executions_created_at ON workflow_executions(created_at);

CREATE INDEX idx_workflow_steps_execution_id ON workflow_steps(execution_id);
CREATE INDEX idx_workflow_steps_status ON workflow_steps(status);
CREATE INDEX idx_workflow_steps_type ON workflow_steps(type);
CREATE INDEX idx_workflow_steps_order ON workflow_steps(execution_order);

CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX idx_workflow_templates_public ON workflow_templates(is_public);
CREATE INDEX idx_workflow_templates_usage ON workflow_templates(usage_count);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_executions_updated_at BEFORE UPDATE ON workflow_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON workflow_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample workflow templates
INSERT INTO workflow_templates (name, description, category, definition, default_config, created_by) VALUES
(
    'Simple Approval Workflow',
    'A basic approval workflow with email notifications',
    'approval',
    '{
        "nodes": [
            {
                "id": "start",
                "type": "start",
                "name": "Start",
                "config": {},
                "position": {"x": 100, "y": 100},
                "inputs": [],
                "outputs": ["approval"]
            },
            {
                "id": "approval",
                "type": "approval",
                "name": "Manager Approval",
                "config": {
                    "approver": "{{manager_email}}",
                    "subject": "Approval Required: {{request_title}}",
                    "timeout": 86400000
                },
                "position": {"x": 300, "y": 100},
                "inputs": ["start"],
                "outputs": ["approved", "rejected"]
            },
            {
                "id": "approved",
                "type": "email",
                "name": "Send Approval Email",
                "config": {
                    "to": "{{requester_email}}",
                    "subject": "Request Approved: {{request_title}}",
                    "body": "Your request has been approved."
                },
                "position": {"x": 500, "y": 50},
                "inputs": ["approval"],
                "outputs": ["end"]
            },
            {
                "id": "rejected",
                "type": "email",
                "name": "Send Rejection Email",
                "config": {
                    "to": "{{requester_email}}",
                    "subject": "Request Rejected: {{request_title}}",
                    "body": "Your request has been rejected."
                },
                "position": {"x": 500, "y": 150},
                "inputs": ["approval"],
                "outputs": ["end"]
            },
            {
                "id": "end",
                "type": "end",
                "name": "End",
                "config": {},
                "position": {"x": 700, "y": 100},
                "inputs": ["approved", "rejected"],
                "outputs": []
            }
        ],
        "connections": [
            {"id": "c1", "source": "start", "target": "approval"},
            {"id": "c2", "source": "approval", "target": "approved", "condition": "context.approval_result === true"},
            {"id": "c3", "source": "approval", "target": "rejected", "condition": "context.approval_result === false"},
            {"id": "c4", "source": "approved", "target": "end"},
            {"id": "c5", "source": "rejected", "target": "end"}
        ],
        "variables": {}
    }',
    '{
        "manager_email": "manager@company.com",
        "timeout_hours": 24
    }',
    '00000000-0000-0000-0000-000000000000'
),
(
    'Data Processing Pipeline',
    'Automated data processing with validation and transformation',
    'data_processing',
    '{
        "nodes": [
            {
                "id": "start",
                "type": "start",
                "name": "Start",
                "config": {},
                "position": {"x": 100, "y": 100},
                "inputs": [],
                "outputs": ["validate"]
            },
            {
                "id": "validate",
                "type": "script",
                "name": "Validate Data",
                "config": {
                    "script": "const isValid = context.data && context.data.length > 0; return { valid: isValid, data: context.data };"
                },
                "position": {"x": 300, "y": 100},
                "inputs": ["start"],
                "outputs": ["transform", "error"]
            },
            {
                "id": "transform",
                "type": "script",
                "name": "Transform Data",
                "config": {
                    "script": "const transformed = context.data.map(item => ({ ...item, processed: true, timestamp: new Date() })); return { transformed };"
                },
                "position": {"x": 500, "y": 100},
                "inputs": ["validate"],
                "outputs": ["save"]
            },
            {
                "id": "save",
                "type": "database",
                "name": "Save to Database",
                "config": {
                    "operation": "insert",
                    "table": "processed_data",
                    "data": "{{transformed}}"
                },
                "position": {"x": 700, "y": 100},
                "inputs": ["transform"],
                "outputs": ["end"]
            },
            {
                "id": "error",
                "type": "email",
                "name": "Send Error Notification",
                "config": {
                    "to": "admin@company.com",
                    "subject": "Data Processing Error",
                    "body": "Data validation failed for batch {{batch_id}}"
                },
                "position": {"x": 500, "y": 200},
                "inputs": ["validate"],
                "outputs": ["end"]
            },
            {
                "id": "end",
                "type": "end",
                "name": "End",
                "config": {},
                "position": {"x": 900, "y": 150},
                "inputs": ["save", "error"],
                "outputs": []
            }
        ],
        "connections": [
            {"id": "c1", "source": "start", "target": "validate"},
            {"id": "c2", "source": "validate", "target": "transform", "condition": "context.valid === true"},
            {"id": "c3", "source": "validate", "target": "error", "condition": "context.valid === false"},
            {"id": "c4", "source": "transform", "target": "save"},
            {"id": "c5", "source": "save", "target": "end"},
            {"id": "c6", "source": "error", "target": "end"}
        ],
        "variables": {}
    }',
    '{
        "admin_email": "admin@company.com",
        "batch_size": 100
    }',
    '00000000-0000-0000-0000-000000000000'
);

-- Add comments
COMMENT ON TABLE workflows IS 'Workflow definitions and configurations';
COMMENT ON TABLE workflow_executions IS 'Workflow execution instances and their status';
COMMENT ON TABLE workflow_steps IS 'Individual step executions within a workflow';
COMMENT ON TABLE workflow_templates IS 'Reusable workflow templates';