#!/bin/bash
# F1 Race Predictor - Quick Start Script

set -e

echo "🏎️  F1 Race Predictor - Setup Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env created. Please update it with your database credentials.${NC}"
    echo ""
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. For local development only.${NC}"
    DOCKER_AVAILABLE=false
else
    DOCKER_AVAILABLE=true
fi

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo -e "${BLUE}Options:${NC}"
echo "1. Local Development Setup"
echo "2. Docker Development"
echo "3. Train ML Model"
echo "4. Run API Server"
echo "5. Run Both (Docker)"
echo "6. View Logs"
echo ""
read -p "Select option (1-6): " OPTION

case $OPTION in
    1)
        echo -e "${BLUE}Setting up local development environment...${NC}"
        if [ ! -d "backend/venv" ]; then
            echo "Creating Python virtual environment..."
            python3 -m venv backend/venv
        fi
        
        echo "Activating virtual environment..."
        if [ "$OS" == "windows" ]; then
            source backend/venv/Scripts/activate
        else
            source backend/venv/bin/activate
        fi
        
        echo "Installing dependencies..."
        pip install -r backend/requirements.txt
        
        echo -e "${GREEN}✓ Local development environment ready!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Activate venv: source backend/venv/bin/activate"
        echo "2. Train model: python backend/train_model.py --database-url 'postgresql://...' --output backend/models/"
        echo "3. Run API: uvicorn backend.app.main:app --reload --port 8000"
        ;;
    2)
        if [ "$DOCKER_AVAILABLE" = false ]; then
            echo -e "${YELLOW}Docker is not installed. Install Docker Desktop to continue.${NC}"
            exit 1
        fi
        
        echo -e "${BLUE}Starting Docker containers...${NC}"
        docker-compose up -d
        
        echo -e "${GREEN}✓ Containers started!${NC}"
        echo ""
        echo "Waiting for PostgreSQL to be ready..."
        sleep 5
        
        echo ""
        echo -e "${GREEN}✓ Services running:${NC}"
        echo "  Database: postgresql://f1admin:f1secure@localhost:5432/f1_db"
        echo "  API: http://localhost:8000"
        echo "  Docs: http://localhost:8000/docs"
        ;;
    3)
        echo -e "${BLUE}Training ML Model...${NC}"
        
        read -p "Enter database URL (postgresql://user:pass@host:port/dbname): " DB_URL
        
        if [ "$DOCKER_AVAILABLE" = true ]; then
            echo "Using Docker container..."
            docker-compose run ml-trainer
        else
            echo "Using local environment..."
            python backend/train_model.py --database-url "$DB_URL" --output backend/models/
        fi
        
        echo -e "${GREEN}✓ Model training complete!${NC}"
        echo "  Model saved to: backend/models/f1_model.pkl"
        echo "  Scaler saved to: backend/models/f1_scaler.pkl"
        ;;
    4)
        if [ "$DOCKER_AVAILABLE" = true ]; then
            echo -e "${BLUE}Starting API with Docker...${NC}"
            docker-compose up -d backend
            
            echo -e "${GREEN}✓ API started!${NC}"
            echo "  URL: http://localhost:8000"
            echo "  Docs: http://localhost:8000/docs"
            echo ""
            echo "View logs: docker-compose logs -f backend"
        else
            echo -e "${BLUE}Starting API locally...${NC}"
            # Activate venv
            if [ "$OS" == "windows" ]; then
                source backend/venv/Scripts/activate
            else
                source backend/venv/bin/activate
            fi
            
            cd backend
            uvicorn app.main:app --reload --port 8000
        fi
        ;;
    5)
        if [ "$DOCKER_AVAILABLE" = false ]; then
            echo -e "${YELLOW}Docker is not installed. Install Docker Desktop to continue.${NC}"
            exit 1
        fi
        
        echo -e "${BLUE}Starting all services with Docker...${NC}"
        docker-compose up
        ;;
    6)
        if [ "$DOCKER_AVAILABLE" = true ]; then
            docker-compose logs -f
        else
            echo -e "${YELLOW}Docker not available. Check local logs in backend/logs/${NC}"
        fi
        ;;
    *)
        echo -e "${YELLOW}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
