#!/bin/bash

# AI Agent UI Project Setup Script
# This script sets up the development environment for the AI Agent UI project

set -e

echo "🚀 Setting up AI Agent UI project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if required tools are installed
check_requirements() {
    print_header "Checking Requirements"
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_status "Python found: $PYTHON_VERSION"
    else
        print_error "Python 3 is not installed. Please install Python 3.12 or later."
        exit 1
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18 or later."
        exit 1
    fi
    
    # Check uv
    if command -v uv &> /dev/null; then
        UV_VERSION=$(uv --version)
        print_status "uv found: $UV_VERSION"
    else
        print_warning "uv is not installed. Installing uv..."
        curl -LsSf https://astral.sh/uv/install.sh | sh
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Setup backend environment
setup_backend() {
    print_header "Setting up Backend"
    
    cd backend
    
    # Create Python virtual environment
    print_status "Creating Python virtual environment..."
    uv venv --python 3.12
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source .venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    uv pip install -e .
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please update the .env file with your API keys and configuration."
    fi
    
    # Create necessary directories
    mkdir -p tmp/lancedb
    mkdir -p logs
    
    cd ..
    print_status "Backend setup completed!"
}

# Setup frontend environment
setup_frontend() {
    print_header "Setting up Frontend"
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    cd ..
    print_status "Frontend setup completed!"
}

# Setup shared types
setup_shared() {
    print_header "Setting up Shared Types"
    
    # Install dependencies if needed
    if [ -d "shared" ]; then
        print_status "Shared types directory already exists."
    else
        print_warning "Shared types directory not found. Creating basic structure..."
        mkdir -p shared/{types,protocols}
        print_status "Created shared directory structure."
    fi
}

# Create development scripts
create_dev_scripts() {
    print_header "Creating Development Scripts"
    
    # Create start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash

# Development start script
echo "🚀 Starting development servers..."

# Start backend in background
echo "Starting backend server..."
cd backend
source .venv/bin/activate
python -m src.api.server &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Servers are starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap 'echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
EOF
    
    chmod +x start-dev.sh
    
    # Create test script
    cat > test.sh << 'EOF'
#!/bin/bash

# Test script
echo "🧪 Running tests..."

# Backend tests
echo "Running backend tests..."
cd backend
source .venv/bin/activate
python -m pytest tests/ -v

# Frontend tests
echo "Running frontend tests..."
cd ../frontend
npm test

echo "✅ All tests completed!"
EOF
    
    chmod +x test.sh
    
    print_status "Development scripts created!"
}

# Main setup function
main() {
    check_requirements
    setup_backend
    setup_frontend
    setup_shared
    create_dev_scripts
    
    print_header "Setup Complete!"
    echo ""
    print_status "🎉 AI Agent UI project setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update backend/.env with your API keys"
    echo "2. Run './start-dev.sh' to start development servers"
    echo "3. Open http://localhost:3000 in your browser"
    echo ""
    echo "For more information, see AGENTS.md"
}

# Run main function
main "$@"
