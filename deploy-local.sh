#!/bin/bash

# Restaurant Management System - Local Deployment Script
echo "🍽️  Restaurant Management System - Local Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Node.js is installed
check_node() {
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js v14 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    print_status "Installing root dependencies..."
    npm install || { print_error "Failed to install root dependencies"; exit 1; }
    
    print_status "Installing server dependencies..."
    cd server && npm install || { print_error "Failed to install server dependencies"; exit 1; }
    
    print_status "Installing client dependencies..."
    cd ../client && npm install || { print_error "Failed to install client dependencies"; exit 1; }
    
    cd ..
    print_success "All dependencies installed successfully!"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p server/uploads
    mkdir -p server/database
    print_success "Directories created!"
}

# Start the application
start_application() {
    print_status "Starting the Restaurant Management System..."
    print_status "Backend will run on: http://localhost:5000"
    print_status "Frontend will run on: http://localhost:3000"
    print_warning "Press Ctrl+C to stop the application"
    
    # Start both frontend and backend
    npm run dev
}

# Start the backend only
start_backend() {
    print_status "Starting backend server only..."
    print_status "Backend will run on: http://localhost:5000"
    cd server && npm start
}

# Start the frontend only
start_frontend() {
    print_status "Starting frontend only..."
    print_status "Frontend will run on: http://localhost:3000"
    cd client && npm start
}

# Check ports
check_ports() {
    print_status "Checking if ports 3000 and 5000 are available..."
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port 3000 is already in use. Please stop the service or use a different port."
    else
        print_success "Port 3000 is available"
    fi
    
    if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port 5000 is already in use. Please stop the service or use a different port."
    else
        print_success "Port 5000 is available"
    fi
}

# Display help
show_help() {
    echo ""
    echo "Restaurant Management System - Deployment Options:"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  install     Install all dependencies"
    echo "  start       Start both frontend and backend"
    echo "  backend     Start backend server only"
    echo "  frontend    Start frontend only"
    echo "  check       Check system requirements and ports"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 install    # Install dependencies"
    echo "  $0 start      # Start the full application"
    echo "  $0 backend    # Start only the backend"
    echo ""
}

# Test the application
test_application() {
    print_status "Testing the application..."
    
    # Wait for services to start
    sleep 5
    
    # Test backend
    if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
        print_success "Backend is running and responding!"
    else
        print_error "Backend is not responding on port 5000"
    fi
    
    # Test frontend
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is running and responding!"
    else
        print_error "Frontend is not responding on port 3000"
    fi
}

# Main script logic
case "$1" in
    "install")
        print_status "Installing Restaurant Management System..."
        check_node
        check_npm
        create_directories
        install_dependencies
        print_success "Installation completed!"
        echo ""
        echo "To start the application, run: $0 start"
        ;;
    "start")
        check_node
        check_npm
        start_application
        ;;
    "backend")
        check_node
        check_npm
        start_backend
        ;;
    "frontend")
        check_node
        check_npm
        start_frontend
        ;;
    "check")
        check_node
        check_npm
        check_ports
        ;;
    "test")
        test_application
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        print_status "Starting full installation and deployment..."
        check_node
        check_npm
        create_directories
        install_dependencies
        print_success "Setup completed!"
        echo ""
        print_status "Starting the application..."
        start_application
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac