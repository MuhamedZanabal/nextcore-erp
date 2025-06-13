#!/bin/bash

# NextCore ERP Production Deployment Script
set -e

echo "🚀 NextCore ERP Production Deployment Starting..."

# Configuration
NAMESPACE="nextcore-erp"
DOCKER_REGISTRY="nextcore"
VERSION=${1:-"latest"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v helm &> /dev/null; then
        log_error "Helm is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    services=("auth-service" "crm-service" "sales-service" "invoicing-service" "inventory-service" "accounting-service" "hrm-service" "workflow-service")
    
    for service in "${services[@]}"; do
        if [ -d "services/$service" ]; then
            log_info "Building $service..."
            docker build -t $DOCKER_REGISTRY/$service:$VERSION services/$service
            docker push $DOCKER_REGISTRY/$service:$VERSION
            log_success "$service built and pushed"
        else
            log_warning "$service directory not found, skipping..."
        fi
    done
    
    # Build frontend
    log_info "Building frontend..."
    docker build -t $DOCKER_REGISTRY/frontend:$VERSION frontend/app
    docker push $DOCKER_REGISTRY/frontend:$VERSION
    log_success "Frontend built and pushed"
}

# Create Kubernetes namespace
create_namespace() {
    log_info "Creating Kubernetes namespace..."
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    log_success "Namespace $NAMESPACE ready"
}

# Deploy infrastructure components
deploy_infrastructure() {
    log_info "Deploying infrastructure components..."
    
    # PostgreSQL
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update
    
    helm upgrade --install postgresql bitnami/postgresql \
        --namespace $NAMESPACE \
        --set auth.postgresPassword=nextcore \
        --set auth.database=nextcore \
        --set primary.persistence.size=20Gi \
        --wait
    
    # Redis
    helm upgrade --install redis bitnami/redis \
        --namespace $NAMESPACE \
        --set auth.password=nextcore \
        --set master.persistence.size=8Gi \
        --wait
    
    # NATS
    helm repo add nats https://nats-io.github.io/k8s/helm/charts/
    helm upgrade --install nats nats/nats \
        --namespace $NAMESPACE \
        --set nats.jetstream.enabled=true \
        --wait
    
    log_success "Infrastructure components deployed"
}

# Deploy monitoring stack
deploy_monitoring() {
    log_info "Deploying monitoring stack..."
    
    # Prometheus
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace $NAMESPACE \
        --set prometheus.prometheusSpec.retention=30d \
        --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi \
        --set grafana.adminPassword=nextcore \
        --wait
    
    log_success "Monitoring stack deployed"
}

# Deploy application services
deploy_services() {
    log_info "Deploying application services..."
    
    # Apply Kubernetes manifests
    kubectl apply -f infra/k8s/ -n $NAMESPACE
    
    # Wait for deployments to be ready
    kubectl wait --for=condition=available --timeout=300s deployment --all -n $NAMESPACE
    
    log_success "Application services deployed"
}

# Deploy API Gateway
deploy_gateway() {
    log_info "Deploying API Gateway..."
    
    # Kong
    helm repo add kong https://charts.konghq.com
    helm upgrade --install kong kong/kong \
        --namespace $NAMESPACE \
        --set ingressController.enabled=true \
        --set proxy.type=LoadBalancer \
        --wait
    
    # Apply Kong configuration
    kubectl apply -f infra/kong/ -n $NAMESPACE
    
    log_success "API Gateway deployed"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # This would typically run migration jobs for each service
    # For now, we'll use the synchronize feature in development
    log_warning "Database migrations should be implemented for production"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check pod status
    kubectl get pods -n $NAMESPACE
    
    # Check services
    kubectl get services -n $NAMESPACE
    
    # Check ingress
    kubectl get ingress -n $NAMESPACE
    
    log_success "Deployment verification completed"
}

# Main deployment flow
main() {
    log_info "Starting NextCore ERP production deployment..."
    
    check_prerequisites
    create_namespace
    build_and_push_images
    deploy_infrastructure
    deploy_monitoring
    deploy_services
    deploy_gateway
    run_migrations
    verify_deployment
    
    log_success "🎉 NextCore ERP production deployment completed successfully!"
    log_info "Access the application at: http://$(kubectl get service kong-kong-proxy -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
    log_info "Grafana dashboard: http://$(kubectl get service prometheus-grafana -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}'):3000"
    log_info "Default credentials - Username: admin, Password: nextcore"
}

# Run main function
main "$@"