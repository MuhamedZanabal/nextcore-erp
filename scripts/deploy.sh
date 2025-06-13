#!/bin/bash

# NextCore ERP Deployment Script
# This script handles the complete deployment of the NextCore ERP system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
NAMESPACE=${2:-nextcore}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"nextcore"}

echo -e "${BLUE}🚀 Starting NextCore ERP Deployment${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Namespace: ${NAMESPACE}${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_status "Docker is running"
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl and try again."
        exit 1
    fi
    print_status "kubectl is available"
    
    # Check if helm is available
    if ! command -v helm &> /dev/null; then
        print_error "Helm is not installed. Please install Helm and try again."
        exit 1
    fi
    print_status "Helm is available"
}

# Build Docker images
build_images() {
    echo -e "${BLUE}🏗️  Building Docker images...${NC}"
    
    services=("auth-service" "crm-service" "sales-service" "invoicing-service" "inventory-service" "accounting-service" "hrm-service" "workflow-engine")
    
    for service in "${services[@]}"; do
        if [ -d "services/$service" ]; then
            echo -e "${BLUE}Building $service...${NC}"
            docker build -t ${DOCKER_REGISTRY}/${service}:latest services/${service}
            print_status "Built $service"
        else
            print_warning "Service directory not found: services/$service"
        fi
    done
    
    # Build frontend
    echo -e "${BLUE}Building frontend...${NC}"
    docker build -t ${DOCKER_REGISTRY}/frontend:latest frontend/app
    print_status "Built frontend"
}

# Push images to registry
push_images() {
    if [ "$ENVIRONMENT" != "development" ]; then
        echo -e "${BLUE}📤 Pushing images to registry...${NC}"
        
        services=("auth-service" "crm-service" "sales-service" "invoicing-service" "inventory-service" "accounting-service" "hrm-service" "workflow-engine" "frontend")
        
        for service in "${services[@]}"; do
            docker push ${DOCKER_REGISTRY}/${service}:latest
            print_status "Pushed $service"
        done
    else
        print_status "Skipping image push for development environment"
    fi
}

# Deploy to Kubernetes
deploy_kubernetes() {
    echo -e "${BLUE}☸️  Deploying to Kubernetes...${NC}"
    
    # Create namespace if it doesn't exist
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    print_status "Namespace ${NAMESPACE} ready"
    
    # Deploy infrastructure components
    echo -e "${BLUE}Deploying infrastructure...${NC}"
    kubectl apply -f infra/k8s/namespace.yaml
    kubectl apply -f infra/k8s/postgres.yaml -n ${NAMESPACE}
    kubectl apply -f infra/k8s/redis.yaml -n ${NAMESPACE}
    kubectl apply -f infra/k8s/nats.yaml -n ${NAMESPACE}
    print_status "Infrastructure deployed"
    
    # Wait for databases to be ready
    echo -e "${BLUE}Waiting for databases to be ready...${NC}"
    kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n ${NAMESPACE} --timeout=300s
    kubectl wait --for=condition=ready pod -l app=nats -n ${NAMESPACE} --timeout=300s
    print_status "Databases are ready"
    
    # Deploy services
    echo -e "${BLUE}Deploying services...${NC}"
    services=("auth-service" "crm-service" "sales-service" "invoicing-service" "inventory-service" "accounting-service" "hrm-service" "workflow-engine")
    
    for service in "${services[@]}"; do
        if [ -f "infra/k8s/${service}.yaml" ]; then
            kubectl apply -f infra/k8s/${service}.yaml -n ${NAMESPACE}
            print_status "Deployed $service"
        else
            print_warning "Kubernetes manifest not found: infra/k8s/${service}.yaml"
        fi
    done
    
    # Deploy frontend
    kubectl apply -f infra/k8s/frontend.yaml -n ${NAMESPACE}
    print_status "Deployed frontend"
    
    # Deploy API Gateway
    kubectl apply -f infra/k8s/kong.yaml -n ${NAMESPACE}
    print_status "Deployed API Gateway"
    
    # Deploy monitoring
    echo -e "${BLUE}Deploying monitoring...${NC}"
    kubectl apply -f infra/k8s/prometheus.yaml -n ${NAMESPACE}
    kubectl apply -f infra/k8s/grafana.yaml -n ${NAMESPACE}
    print_status "Deployed monitoring"
}

# Deploy with Docker Compose (for development)
deploy_compose() {
    echo -e "${BLUE}🐳 Deploying with Docker Compose...${NC}"
    
    # Stop existing containers
    docker-compose down
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be healthy
    echo -e "${BLUE}Waiting for services to be healthy...${NC}"
    sleep 30
    
    # Check service health
    services=("postgres" "redis" "nats" "auth-service" "crm-service" "frontend")
    for service in "${services[@]}"; do
        if docker-compose ps | grep -q "${service}.*Up"; then
            print_status "$service is running"
        else
            print_warning "$service may not be running properly"
        fi
    done
}

# Run database migrations
run_migrations() {
    echo -e "${BLUE}🗃️  Running database migrations...${NC}"
    
    if [ "$ENVIRONMENT" = "development" ]; then
        # Run migrations via Docker Compose
        docker-compose exec auth-service npm run migration:run || true
        docker-compose exec crm-service npm run migration:run || true
        docker-compose exec sales-service npm run migration:run || true
    else
        # Run migrations via Kubernetes jobs
        kubectl apply -f infra/k8s/migrations/ -n ${NAMESPACE}
        kubectl wait --for=condition=complete job/auth-migration -n ${NAMESPACE} --timeout=300s
        kubectl wait --for=condition=complete job/crm-migration -n ${NAMESPACE} --timeout=300s
    fi
    
    print_status "Database migrations completed"
}

# Verify deployment
verify_deployment() {
    echo -e "${BLUE}🔍 Verifying deployment...${NC}"
    
    if [ "$ENVIRONMENT" = "development" ]; then
        # Check Docker Compose services
        if curl -f http://localhost:8080/health > /dev/null 2>&1; then
            print_status "API Gateway is responding"
        else
            print_warning "API Gateway may not be responding"
        fi
        
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            print_status "Frontend is responding"
        else
            print_warning "Frontend may not be responding"
        fi
    else
        # Check Kubernetes services
        kubectl get pods -n ${NAMESPACE}
        kubectl get services -n ${NAMESPACE}
        
        # Check if all pods are running
        if kubectl get pods -n ${NAMESPACE} | grep -q "0/"; then
            print_warning "Some pods may not be ready"
        else
            print_status "All pods appear to be running"
        fi
    fi
}

# Main deployment flow
main() {
    check_prerequisites
    
    if [ "$ENVIRONMENT" = "development" ]; then
        build_images
        deploy_compose
        sleep 10
        run_migrations
        verify_deployment
        
        echo -e "${GREEN}🎉 Development deployment completed!${NC}"
        echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
        echo -e "${GREEN}API Gateway: http://localhost:8080${NC}"
        echo -e "${GREEN}Grafana: http://localhost:3001${NC}"
    else
        build_images
        push_images
        deploy_kubernetes
        run_migrations
        verify_deployment
        
        echo -e "${GREEN}🎉 Production deployment completed!${NC}"
        echo -e "${GREEN}Check service status: kubectl get pods -n ${NAMESPACE}${NC}"
    fi
}

# Handle script arguments
case "$1" in
    "development"|"staging"|"production")
        main
        ;;
    "clean")
        echo -e "${BLUE}🧹 Cleaning up...${NC}"
        if [ "$2" = "development" ]; then
            docker-compose down -v
            docker system prune -f
        else
            kubectl delete namespace ${NAMESPACE} --ignore-not-found=true
        fi
        print_status "Cleanup completed"
        ;;
    "logs")
        if [ "$2" = "development" ]; then
            docker-compose logs -f
        else
            kubectl logs -f -l app=nextcore -n ${NAMESPACE}
        fi
        ;;
    *)
        echo "Usage: $0 {development|staging|production|clean|logs} [namespace]"
        echo "Examples:"
        echo "  $0 development              # Deploy to local Docker Compose"
        echo "  $0 production nextcore      # Deploy to Kubernetes"
        echo "  $0 clean development        # Clean up Docker Compose"
        echo "  $0 logs development         # View logs"
        exit 1
        ;;
esac