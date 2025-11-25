#!/bin/bash

# Agent UI Demo - Development Server Startup Script
# This script starts both backend and frontend development servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Agent UI Demo development servers...${NC}"

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if backend .env exists
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    echo -e "${YELLOW}Warning: backend/.env not found. Copying from .env.example...${NC}"
    cp "$SCRIPT_DIR/backend/.env.example" "$SCRIPT_DIR/backend/.env"
    echo -e "${YELLOW}Please edit backend/.env and add your API keys.${NC}"
fi

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend server
echo -e "${GREEN}Starting backend server...${NC}"
cd "$SCRIPT_DIR/backend"
if [ -d ".venv" ]; then
    source .venv/bin/activate
    python -m src.server --reload &
    BACKEND_PID=$!
    echo -e "${GREEN}Backend started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}Error: backend/.venv not found. Please run ./scripts/setup.sh first.${NC}"
    exit 1
fi

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo -e "${GREEN}Starting frontend server...${NC}"
cd "$SCRIPT_DIR/frontend"
if [ -d "node_modules" ]; then
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}Frontend started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}Error: frontend/node_modules not found. Please run ./scripts/setup.sh first.${NC}"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Development servers are running:${NC}"
echo -e "  Backend:  ${YELLOW}http://localhost:7777${NC}"
echo -e "  Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "  API Docs: ${YELLOW}http://localhost:7777/docs${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Press ${RED}Ctrl+C${NC} to stop all servers.\n"

# Wait for both processes
wait
