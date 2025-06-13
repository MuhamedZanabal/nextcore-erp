# NextCore ERP

NextCore ERP is a cloud-native, modular enterprise resource planning platform designed to provide businesses with flexible, scalable, and extensible solutions for managing their operations, resources, and processes.

## Mission Statement

To empower organizations of all sizes with a modern, adaptable ERP system that grows with their needs, enables seamless integration with existing tools, and provides actionable insights through intuitive interfaces and powerful automation.

## Architecture Overview

NextCore ERP is built on a microservices architecture with the following key components:

- **API Gateway**: Kong API Gateway routes requests to the appropriate services
- **Auth Service**: Handles authentication, authorization, and user management
- **Core Services**: Modular business services (CRM, Sales, Invoicing, etc.)
- **Event Bus**: NATS for asynchronous communication between services
- **Frontend**: React-based SPA with responsive design
- **Workflow Engine**: Customizable business process automation

## Modules

- **CRM**: Contact management, pipeline management, lead scoring, campaign analytics
- **Sales**: Quotation, order management, discount policy engine, eSignature
- **Invoicing**: Multi-currency support, taxes, templates, PDF generator
- **Inventory**: Barcode scanner integration, warehouse zones, stock ledger
- **Accounting**: Double-entry ledger, reconciliation engine, tax compliance rules
- **HRM**: Employee profiles, attendance, payroll computation, leave policy automation
- **Workflow Engine**: Drag-and-drop logic builder, scripting, time-based triggers

## Tech Stack

### Backend

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL via TypeORM
- **Cache**: Redis
- **Message Broker**: NATS
- **API Gateway**: Kong
- **Authentication**: JWT

### Frontend

- **Framework**: React with TypeScript
- **State Management**: React Query for server state, Context API for local state
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Form Handling**: React Hook Form with Zod validation

### DevOps

- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK Stack

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- npm or pnpm

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/yourusername/nextcore-erp.git
cd nextcore-erp
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development environment:

```bash
docker-compose up -d
```

4. Start the auth service:

```bash
cd services/auth-service
npm run start:dev
```

5. Start the frontend:

```bash
cd frontend/app
npm run dev
```

6. Access the application at http://localhost:12000

### Running in Production

For production deployment, use the Kubernetes configurations in the `infra/k8s` directory.

```bash
kubectl apply -f infra/k8s/
```

## Project Structure

```
NextCoreERP/
├── services/                # Backend microservices
│   ├── auth-service/        # Authentication and user management
│   ├── crm-service/         # Customer Relationship Management
│   ├── sales-service/       # Sales and quotation management
│   ├── invoicing-service/   # Invoice generation and management
│   ├── inventory-service/   # Inventory and warehouse management
│   ├── accounting-service/  # Accounting and financial management
│   ├── hrm-service/         # Human Resource Management
│   └── workflow-service/    # Workflow engine
├── frontend/
│   └── app/                 # React frontend application
├── shared/
│   ├── lib/                 # Shared libraries and utilities
│   └── proto/               # Protocol buffer definitions
├── infra/
│   ├── docker-compose.yml   # Local development environment
│   ├── gateway/             # API Gateway configuration
│   └── k8s/                 # Kubernetes deployment configurations
└── .github/
    └── workflows/           # CI/CD workflows
```

## License

Business Source License (BSL) - See LICENSE file for details