#!/bin/bash

# NextCore ERP Production Deployment Script
# This script automates the complete deployment of NextCore ERP to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="nextcore-erp"
DOCKER_REGISTRY="your-registry.com"
VERSION=${1:-"latest"}
ENVIRONMENT=${2:-"production"}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "docker is not installed"
        exit 1
    fi
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        print_error "helm is not installed"
        exit 1
    fi
    
    # Check kubectl connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Function to build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    services=("auth-service" "crm-service" "sales-service" "invoicing-service" "inventory-service" "accounting-service" "hrm-service")
    
    for service in "${services[@]}"; do
        print_status "Building $service..."
        
        # Build the image
        docker build -t $DOCKER_REGISTRY/nextcore/$service:$VERSION ./services/$service
        
        # Push the image
        docker push $DOCKER_REGISTRY/nextcore/$service:$VERSION
        
        print_success "$service image built and pushed"
    done
    
    # Build frontend
    print_status "Building frontend..."
    docker build -t $DOCKER_REGISTRY/nextcore/frontend:$VERSION ./frontend/app
    docker push $DOCKER_REGISTRY/nextcore/frontend:$VERSION
    print_success "Frontend image built and pushed"
}

# Function to create namespace if it doesn't exist
create_namespace() {
    print_status "Creating namespace if it doesn't exist..."
    
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        kubectl create namespace $NAMESPACE
        print_success "Namespace $NAMESPACE created"
    else
        print_status "Namespace $NAMESPACE already exists"
    fi
}

# Function to deploy secrets
deploy_secrets() {
    print_status "Deploying secrets..."
    
    # Apply all secret manifests
    kubectl apply -f infra/k8s/secrets/ -n $NAMESPACE
    
    print_success "Secrets deployed"
}

# Function to deploy infrastructure components
deploy_infrastructure() {
    print_status "Deploying infrastructure components..."
    
    # Deploy PostgreSQL
    kubectl apply -f infra/k8s/postgres/ -n $NAMESPACE
    
    # Deploy Redis
    kubectl apply -f infra/k8s/redis/ -n $NAMESPACE
    
    # Deploy NATS
    kubectl apply -f infra/k8s/nats/ -n $NAMESPACE
    
    # Deploy TimescaleDB
    kubectl apply -f infra/k8s/timescaledb/ -n $NAMESPACE
    
    # Wait for infrastructure to be ready
    print_status "Waiting for infrastructure to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=nats -n $NAMESPACE --timeout=300s
    
    print_success "Infrastructure components deployed"
}

# Function to deploy monitoring stack
deploy_monitoring() {
    print_status "Deploying monitoring stack..."
    
    # Deploy Prometheus
    kubectl apply -f infra/k8s/monitoring/prometheus/ -n $NAMESPACE
    
    # Deploy Grafana
    kubectl apply -f infra/k8s/monitoring/grafana/ -n $NAMESPACE
    
    print_success "Monitoring stack deployed"
}

# Function to deploy services
deploy_services() {
    print_status "Deploying microservices..."
    
    services=("auth-service" "crm-service" "sales-service" "invoicing-service" "inventory-service" "accounting-service" "hrm-service")
    
    for service in "${services[@]}"; do
        print_status "Deploying $service..."
        
        # Update image tag in deployment
        sed -i "s|image: .*/$service:.*|image: $DOCKER_REGISTRY/nextcore/$service:$VERSION|g" infra/k8s/services/$service-deployment.yaml
        
        # Apply deployment and service
        kubectl apply -f infra/k8s/services/$service-deployment.yaml -n $NAMESPACE
        kubectl apply -f infra/k8s/services/$service-service.yaml -n $NAMESPACE
        
        print_success "$service deployed"
    done
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Deploying frontend..."
    
    # Update image tag in deployment
    sed -i "s|image: .*/frontend:.*|image: $DOCKER_REGISTRY/nextcore/frontend:$VERSION|g" infra/k8s/frontend/frontend-deployment.yaml
    
    # Apply frontend deployment and service
    kubectl apply -f infra/k8s/frontend/ -n $NAMESPACE
    
    print_success "Frontend deployed"
}

# Function to deploy API Gateway
deploy_api_gateway() {
    print_status "Deploying API Gateway..."
    
    # Deploy Kong
    kubectl apply -f infra/k8s/kong/ -n $NAMESPACE
    
    print_success "API Gateway deployed"
}

# Function to apply network policies
apply_network_policies() {
    print_status "Applying network policies..."
    
    kubectl apply -f infra/k8s/network-policies/ -n $NAMESPACE
    
    print_success "Network policies applied"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    services=("auth-service" "crm-service" "sales-service" "invoicing-service" "inventory-service" "accounting-service" "hrm-service")
    
    for service in "${services[@]}"; do
        print_status "Running migrations for $service..."
        
        # Create migration job
        kubectl create job $service-migration-$(date +%s) \
            --image=$DOCKER_REGISTRY/nextcore/$service:$VERSION \
            --restart=Never \
            -n $NAMESPACE \
            -- npm run migration:run
        
        # Wait for migration to complete
        kubectl wait --for=condition=complete job -l job-name=$service-migration --timeout=300s -n $NAMESPACE
        
        print_success "$service migrations completed"
    done
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if all pods are running
    print_status "Checking pod status..."
    kubectl get pods -n $NAMESPACE
    
    # Wait for all deployments to be ready
    kubectl wait --for=condition=available deployment --all -n $NAMESPACE --timeout=600s
    
    # Check services
    print_status "Checking services..."
    kubectl get services -n $NAMESPACE
    
    # Check ingress
    print_status "Checking ingress..."
    kubectl get ingress -n $NAMESPACE
    
    print_success "Deployment verification completed"
}

# Function to run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Get the API Gateway service URL
    GATEWAY_URL=$(kubectl get service kong-proxy -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -z "$GATEWAY_URL" ]; then
        GATEWAY_URL=$(kubectl get service kong-proxy -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
    fi
    
    # Health check endpoints
    endpoints=(
        "/api/auth/health"
        "/api/crm/health"
        "/api/sales/health"
        "/api/invoicing/health"
        "/api/inventory/health"
        "/api/accounting/health"
        "/api/hrm/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        print_status "Checking $endpoint..."
        
        if curl -f -s "http://$GATEWAY_URL$endpoint" > /dev/null; then
            print_success "$endpoint is healthy"
        else
            print_warning "$endpoint health check failed"
        fi
    done
}

# Function to setup monitoring alerts
setup_monitoring_alerts() {
    print_status "Setting up monitoring alerts..."
    
    # Apply alert rules
    kubectl apply -f infra/monitoring/alerts/ -n $NAMESPACE
    
    print_success "Monitoring alerts configured"
}

# Function to create backup
create_backup() {
    print_status "Creating backup..."
    
    # Create database backup
    kubectl create job database-backup-$(date +%s) \
        --image=postgres:15 \
        --restart=Never \
        -n $NAMESPACE \
        -- pg_dump -h postgres -U postgres nextcore_erp > /backup/backup-$(date +%Y%m%d-%H%M%S).sql
    
    print_success "Backup created"
}

# Function to rollback deployment
rollback_deployment() {
    print_warning "Rolling back deployment..."
    
    services=("auth-service" "crm-service" "sales-service" "invoicing-service" "inventory-service" "accounting-service" "hrm-service" "frontend")
    
    for service in "${services[@]}"; do
        kubectl rollout undo deployment/$service -n $NAMESPACE
    done
    
    print_success "Rollback completed"
}

# Main deployment function
main() {
    print_status "Starting NextCore ERP production deployment..."
    print_status "Version: $VERSION"
    print_status "Environment: $ENVIRONMENT"
    print_status "Namespace: $NAMESPACE"
    
    # Check prerequisites
    check_prerequisites
    
    # Create namespace
    create_namespace
    
    # Build and push images
    if [ "$SKIP_BUILD" != "true" ]; then
        build_and_push_images
    fi
    
    # Deploy secrets
    deploy_secrets
    
    # Deploy infrastructure
    deploy_infrastructure
    
    # Deploy monitoring
    deploy_monitoring
    
    # Deploy services
    deploy_services
    
    # Deploy frontend
    deploy_frontend
    
    # Deploy API Gateway
    deploy_api_gateway
    
    # Apply network policies
    apply_network_policies
    
    # Run migrations
    if [ "$SKIP_MIGRATIONS" != "true" ]; then
        run_migrations
    fi
    
    # Verify deployment
    verify_deployment
    
    # Run health checks
    run_health_checks
    
    # Setup monitoring alerts
    setup_monitoring_alerts
    
    # Create backup
    if [ "$SKIP_BACKUP" != "true" ]; then
        create_backup
    fi
    
    print_success "NextCore ERP deployment completed successfully!"
    print_status "Access the application at: http://$GATEWAY_URL"
    print_status "Grafana dashboard: http://$GATEWAY_URL/grafana"
    print_status "API documentation: http://$GATEWAY_URL/api/docs"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback_deployment
        ;;
    "health-check")
        run_health_checks
        ;;
    "backup")
        create_backup
        ;;
    *)
        echo "Usage: $0 [deploy|rollback|health-check|backup] [version] [environment]"
        echo "  deploy      - Deploy the application (default)"
        echo "  rollback    - Rollback to previous version"
        echo "  health-check - Run health checks only"
        echo "  backup      - Create backup only"
        echo ""
        echo "Environment variables:"
        echo "  SKIP_BUILD=true      - Skip building Docker images"
        echo "  SKIP_MIGRATIONS=true - Skip running database migrations"
        echo "  SKIP_BACKUP=true     - Skip creating backup"
        exit 1
        ;;
esac