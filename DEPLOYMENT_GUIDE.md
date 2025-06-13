# NextCore ERP - Production Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Kubernetes cluster (local or cloud)
- kubectl configured
- Helm 3.x
- Node.js 18+ and pnpm (for development)

### Local Development Setup

1. **Clone and Setup**
```bash
git clone <repository-url>
cd NextCoreERP
pnpm install
```

2. **Start Development Environment**
```bash
# Start all services with Docker Compose
docker-compose up -d

# Start individual services for development
cd services/auth-service && pnpm run start:dev
cd services/crm-service && pnpm run start:dev
cd services/sales-service && pnpm run start:dev

# Start frontend
cd frontend/app && pnpm run dev
```

3. **Access Applications**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090

### Production Deployment

#### Option 1: Docker Compose (Simple)
```bash
# Production environment
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 2: Kubernetes (Recommended)
```bash
# Deploy to Kubernetes
./scripts/deploy_production.sh

# Or manually:
kubectl apply -f infra/k8s/
helm install nextcore-erp ./infra/charts/nextcore-erp
```

#### Option 3: Cloud Deployment
```bash
# AWS EKS
eksctl create cluster --name nextcore-erp --region us-west-2
./scripts/deploy_production.sh

# Google GKE
gcloud container clusters create nextcore-erp --zone us-central1-a
./scripts/deploy_production.sh

# Azure AKS
az aks create --resource-group nextcore-rg --name nextcore-erp
./scripts/deploy_production.sh
```

## 📊 Architecture Overview

### Microservices
- **auth-service** (Port 4000): Authentication and authorization
- **crm-service** (Port 4001): Customer relationship management
- **sales-service** (Port 4002): Sales and order management
- **invoicing-service** (Port 4003): Invoice and payment processing
- **inventory-service** (Port 4004): Stock and warehouse management
- **accounting-service** (Port 4005): Financial management
- **hrm-service** (Port 4006): Human resource management
- **workflow-service** (Port 4007): Process automation

### Infrastructure Components
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **NATS**: Message broker for inter-service communication
- **Kong**: API Gateway and load balancer
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards
- **TimescaleDB**: Time-series data for analytics

## 🔧 Configuration

### Environment Variables

#### Core Services
```env
NODE_ENV=production
DB_HOST=postgresql
DB_PORT=5432
DB_USERNAME=nextcore
DB_PASSWORD=your-secure-password
DB_DATABASE=nextcore
REDIS_URL=redis://redis:6379
NATS_URL=nats://nats:4222
JWT_SECRET=your-jwt-secret
```

#### Security Configuration
```env
# SSL/TLS
SSL_CERT_PATH=/etc/ssl/certs/nextcore.crt
SSL_KEY_PATH=/etc/ssl/private/nextcore.key

# CORS
CORS_ORIGIN=https://your-domain.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Database Configuration

#### PostgreSQL Setup
```sql
-- Create database and user
CREATE DATABASE nextcore;
CREATE USER nextcore WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE nextcore TO nextcore;

-- Enable required extensions
\c nextcore;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

#### Redis Configuration
```redis
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-factor authentication support
- OAuth2/OpenID Connect integration

### Data Protection
- AES-256 encryption at rest
- TLS 1.3 for data in transit
- Database connection encryption
- Secrets management with Kubernetes secrets

### Network Security
- Network policies for pod-to-pod communication
- Ingress controller with SSL termination
- API rate limiting and DDoS protection
- IP whitelisting for admin access

### Compliance
- GDPR compliance features
- Audit logging for all operations
- Data retention policies
- Right to be forgotten implementation

## 📈 Monitoring & Observability

### Metrics Collection
- Application metrics via Prometheus
- Custom business metrics
- Infrastructure monitoring
- Real-time alerting

### Logging
- Centralized logging with ELK stack
- Structured JSON logging
- Log aggregation and analysis
- Error tracking with Sentry

### Health Checks
- Kubernetes liveness and readiness probes
- Database connection monitoring
- External service dependency checks
- Circuit breaker patterns

### Dashboards
- Grafana dashboards for each service
- Business intelligence dashboards
- Real-time system status
- Performance analytics

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: ./scripts/deploy_production.sh
```

### Deployment Strategies
- **Blue-Green Deployment**: Zero-downtime deployments
- **Canary Releases**: Gradual rollout with monitoring
- **Rolling Updates**: Kubernetes native rolling updates
- **Rollback Capability**: Quick rollback on issues

## 🧪 Testing

### Test Types
- **Unit Tests**: Jest for TypeScript/JavaScript
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for browser testing
- **Load Tests**: k6 for performance testing

### Test Commands
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run load tests
k6 run tests/load/api-load-test.js
```

## 📊 Performance Optimization

### Database Optimization
- Connection pooling
- Query optimization
- Index management
- Read replicas for scaling

### Caching Strategy
- Redis for application caching
- CDN for static assets
- Browser caching headers
- API response caching

### Scaling
- Horizontal pod autoscaling
- Database sharding
- Load balancing
- CDN integration

## 🛠️ Maintenance

### Backup Strategy
```bash
# Database backup
pg_dump -h postgresql -U nextcore nextcore > backup_$(date +%Y%m%d).sql

# Kubernetes backup
velero backup create nextcore-backup --include-namespaces nextcore-erp
```

### Updates and Patches
```bash
# Update dependencies
pnpm update

# Security patches
npm audit fix

# Kubernetes updates
kubectl apply -f infra/k8s/
```

### Monitoring and Alerts
- Set up alerts for critical metrics
- Monitor resource usage
- Track error rates
- Performance degradation alerts

## 🆘 Troubleshooting

### Common Issues

#### Service Not Starting
```bash
# Check logs
kubectl logs -f deployment/auth-service

# Check configuration
kubectl describe pod auth-service-xxx

# Check resources
kubectl top pods
```

#### Database Connection Issues
```bash
# Test connection
kubectl exec -it postgresql-0 -- psql -U nextcore -d nextcore

# Check network policies
kubectl get networkpolicies
```

#### Performance Issues
```bash
# Check metrics
kubectl port-forward svc/prometheus 9090:9090

# Analyze logs
kubectl logs -f deployment/api-gateway | grep ERROR
```

### Support Contacts
- **Technical Issues**: tech-support@nextcore.com
- **Security Issues**: security@nextcore.com
- **Business Support**: support@nextcore.com

## 📚 Additional Resources

- [API Documentation](./docs/api/)
- [Architecture Guide](./docs/architecture/)
- [Development Guide](./docs/development/)
- [Security Guide](./docs/security/)
- [Monitoring Guide](./docs/monitoring/)

---

**NextCore ERP** - Building the future of enterprise software