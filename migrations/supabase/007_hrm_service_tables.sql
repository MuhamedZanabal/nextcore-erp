-- =============================================
-- HRM Service Tables Migration
-- =============================================

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
    "departmentId" UUID,
    "positionId" UUID,
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

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    name VARCHAR NOT NULL,
    code VARCHAR NOT NULL,
    description TEXT,
    "managerId" UUID REFERENCES employees(id) ON DELETE SET NULL,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON employees("tenantId");
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees("employeeId");
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees("departmentId");
CREATE INDEX IF NOT EXISTS idx_employees_position_id ON employees("positionId");
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees("managerId");
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees("userId");
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

CREATE INDEX IF NOT EXISTS idx_departments_tenant_id ON departments("tenantId");
CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON departments("managerId");
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments("parentId");

CREATE INDEX IF NOT EXISTS idx_positions_tenant_id ON positions("tenantId");
CREATE INDEX IF NOT EXISTS idx_positions_department_id ON positions("departmentId");

CREATE INDEX IF NOT EXISTS idx_time_entries_tenant_id ON time_entries("tenantId");
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries("employeeId");
CREATE INDEX IF NOT EXISTS idx_time_entries_entry_date ON time_entries("entryDate");
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries("projectId");
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);

CREATE INDEX IF NOT EXISTS idx_leave_requests_tenant_id ON leave_requests("tenantId");
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests("employeeId");
CREATE INDEX IF NOT EXISTS idx_leave_requests_start_date ON leave_requests("startDate");
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);

-- Create triggers for updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();