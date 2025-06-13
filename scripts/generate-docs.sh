#!/bin/bash

# NextCore ERP API Documentation Generator
# This script generates comprehensive API documentation for all services

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📚 Generating NextCore ERP API Documentation${NC}"

# Create docs directory
mkdir -p docs/api

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Generate OpenAPI specs for each service
generate_service_docs() {
    local service=$1
    local port=$2
    
    echo -e "${BLUE}Generating docs for $service...${NC}"
    
    # Check if service is running
    if curl -f http://localhost:${port}/health > /dev/null 2>&1; then
        # Download OpenAPI spec
        curl -s http://localhost:${port}/api/${service}/docs-json > docs/api/${service}-openapi.json
        
        # Generate HTML documentation using swagger-codegen or similar
        # For now, we'll create a simple HTML file
        cat > docs/api/${service}.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>${service} API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-bundle.js"></script>
    <script>
        SwaggerUIBundle({
            url: './${service}-openapi.json',
            dom_id: '#swagger-ui',
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
            ]
        });
    </script>
</body>
</html>
EOF
        print_status "Generated docs for $service"
    else
        echo "⚠️  Service $service is not running on port $port"
    fi
}

# Generate main documentation index
generate_index() {
    cat > docs/api/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NextCore ERP API Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .service-card {
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .service-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
        }
        .service-card h3 {
            margin: 0 0 15px 0;
            color: #667eea;
            font-size: 1.3em;
        }
        .service-card p {
            margin: 0 0 15px 0;
            color: #666;
        }
        .service-card a {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.2s;
        }
        .service-card a:hover {
            background: #5a6fd8;
        }
        .overview {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }
        .overview h2 {
            color: #333;
            margin-top: 0;
        }
        .architecture {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .architecture h2 {
            color: #333;
            margin-top: 0;
        }
        .architecture ul {
            list-style-type: none;
            padding: 0;
        }
        .architecture li {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .architecture li:last-child {
            border-bottom: none;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            margin-left: 10px;
        }
        .status-complete {
            background: #d4edda;
            color: #155724;
        }
        .status-progress {
            background: #fff3cd;
            color: #856404;
        }
        .status-pending {
            background: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>NextCore ERP</h1>
        <p>Comprehensive API Documentation for the Next-Generation ERP Platform</p>
    </div>

    <div class="overview">
        <h2>🎯 System Overview</h2>
        <p>NextCore ERP is a modern, cloud-native enterprise resource planning platform built with microservices architecture. It provides comprehensive business management capabilities including CRM, Sales, Invoicing, Inventory, Accounting, HRM, and Workflow automation.</p>
        
        <h3>Key Features:</h3>
        <ul>
            <li><strong>Microservices Architecture:</strong> Independent, scalable services</li>
            <li><strong>Multi-tenant Support:</strong> Secure data isolation</li>
            <li><strong>RESTful APIs:</strong> Standard HTTP APIs with OpenAPI documentation</li>
            <li><strong>Real-time Updates:</strong> WebSocket support for live data</li>
            <li><strong>Comprehensive Security:</strong> JWT authentication, RBAC, audit logging</li>
            <li><strong>Cloud-native:</strong> Kubernetes-ready with monitoring and observability</li>
        </ul>
    </div>

    <div class="services-grid">
        <div class="service-card">
            <h3>🔐 Authentication Service</h3>
            <p>Handles user authentication, authorization, and tenant management with JWT tokens and role-based access control.</p>
            <a href="auth-service.html">View API Docs</a>
            <span class="status-badge status-complete">Complete</span>
        </div>

        <div class="service-card">
            <h3>👥 CRM Service</h3>
            <p>Customer relationship management with contacts, leads, opportunities, campaigns, and activity tracking.</p>
            <a href="crm-service.html">View API Docs</a>
            <span class="status-badge status-complete">Complete</span>
        </div>

        <div class="service-card">
            <h3>🛒 Sales Service</h3>
            <p>Sales management including products, quotations, orders, and pricing with discount rules and approval workflows.</p>
            <a href="sales-service.html">View API Docs</a>
            <span class="status-badge status-progress">In Progress</span>
        </div>

        <div class="service-card">
            <h3>📄 Invoicing Service</h3>
            <p>Invoice generation, payment tracking, credit notes, and multi-currency support with PDF generation.</p>
            <a href="invoicing-service.html">View API Docs</a>
            <span class="status-badge status-progress">In Progress</span>
        </div>

        <div class="service-card">
            <h3>📦 Inventory Service</h3>
            <p>Stock management, warehouse operations, inventory movements, and real-time stock tracking.</p>
            <a href="inventory-service.html">View API Docs</a>
            <span class="status-badge status-pending">Pending</span>
        </div>

        <div class="service-card">
            <h3>💰 Accounting Service</h3>
            <p>Financial management with general ledger, journal entries, financial reporting, and tax compliance.</p>
            <a href="accounting-service.html">View API Docs</a>
            <span class="status-badge status-pending">Pending</span>
        </div>

        <div class="service-card">
            <h3>👨‍💼 HRM Service</h3>
            <p>Human resource management including employee records, attendance, leave management, and payroll.</p>
            <a href="hrm-service.html">View API Docs</a>
            <span class="status-badge status-pending">Pending</span>
        </div>

        <div class="service-card">
            <h3>⚙️ Workflow Engine</h3>
            <p>Business process automation with visual workflow designer, custom scripts, and approval workflows.</p>
            <a href="workflow-engine.html">View API Docs</a>
            <span class="status-badge status-pending">Pending</span>
        </div>
    </div>

    <div class="architecture">
        <h2>🏗️ Architecture Overview</h2>
        <ul>
            <li><strong>API Gateway:</strong> Kong - Central entry point with rate limiting and authentication</li>
            <li><strong>Service Mesh:</strong> Istio - Service-to-service communication and security</li>
            <li><strong>Database:</strong> PostgreSQL - Primary data store with multi-tenant support</li>
            <li><strong>Cache:</strong> Redis - Session management and caching</li>
            <li><strong>Message Broker:</strong> NATS - Event-driven communication between services</li>
            <li><strong>Monitoring:</strong> Prometheus + Grafana - Metrics collection and visualization</li>
            <li><strong>Logging:</strong> ELK Stack - Centralized logging and analysis</li>
            <li><strong>Container Orchestration:</strong> Kubernetes - Container management and scaling</li>
        </ul>
    </div>
</body>
</html>
EOF
    print_status "Generated main documentation index"
}

# Generate service documentation
echo -e "${BLUE}Generating service documentation...${NC}"

# Service ports (adjust based on your configuration)
declare -A services=(
    ["auth"]=4000
    ["crm"]=4001
    ["sales"]=4002
    ["invoicing"]=4003
    ["inventory"]=4004
    ["accounting"]=4005
    ["hrm"]=4006
    ["workflow"]=4007
)

# Generate docs for each service
for service in "${!services[@]}"; do
    generate_service_docs "$service" "${services[$service]}"
done

# Generate main index
generate_index

# Generate README for docs
cat > docs/README.md << 'EOF'
# NextCore ERP API Documentation

This directory contains comprehensive API documentation for all NextCore ERP services.

## Quick Start

1. Start all services using Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Open the documentation index:
   ```bash
   open docs/api/index.html
   ```

## Service Documentation

- **Authentication Service**: `auth-service.html` - User authentication and authorization
- **CRM Service**: `crm-service.html` - Customer relationship management
- **Sales Service**: `sales-service.html` - Sales and order management
- **Invoicing Service**: `invoicing-service.html` - Invoice and payment management
- **Inventory Service**: `inventory-service.html` - Stock and warehouse management
- **Accounting Service**: `accounting-service.html` - Financial management
- **HRM Service**: `hrm-service.html` - Human resource management
- **Workflow Engine**: `workflow-engine.html` - Business process automation

## API Standards

All APIs follow RESTful conventions and include:

- OpenAPI 3.0 specifications
- JWT-based authentication
- Consistent error handling
- Request/response validation
- Rate limiting
- Comprehensive logging

## Authentication

All API endpoints (except public ones) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

All APIs return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

## Rate Limiting

APIs are rate-limited to prevent abuse:

- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated requests

## Support

For API support and questions:

- Documentation: [API Docs](./api/index.html)
- Issues: [GitHub Issues](https://github.com/nextcore/erp/issues)
- Email: api-support@nextcore.com
EOF

print_status "Generated documentation README"

echo -e "${GREEN}🎉 API documentation generation completed!${NC}"
echo -e "${GREEN}Open docs/api/index.html to view the documentation${NC}"