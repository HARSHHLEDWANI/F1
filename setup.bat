@echo off
REM F1 Race Predictor - Quick Start Script for Windows

setlocal enabledelayedexpansion

echo.
echo 🏎️  F1 Race Predictor - Setup Script
echo ====================================
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo ✓ .env created. Please update it with your database credentials.
    echo.
)

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Docker not found. For local development only.
    set DOCKER_AVAILABLE=false
) else (
    set DOCKER_AVAILABLE=true
)

echo Options:
echo 1. Local Development Setup
echo 2. Docker Development
echo 3. Train ML Model
echo 4. Run API Server
echo 5. Run Both (Docker)
echo 6. View Logs
echo.

set /p OPTION="Select option (1-6): "

if "%OPTION%"=="1" (
    echo Setting up local development environment...
    
    if not exist "backend\venv" (
        echo Creating Python virtual environment...
        python -m venv backend\venv
    )
    
    echo Activating virtual environment...
    call backend\venv\Scripts\activate.bat
    
    echo Installing dependencies...
    pip install -r backend\requirements.txt
    
    echo.
    echo ✓ Local development environment ready!
    echo.
    echo Next steps:
    echo 1. Activate venv: backend\venv\Scripts\activate.bat
    echo 2. Train model: python backend\train_model.py --database-url "postgresql://..." --output "backend\models\"
    echo 3. Run API: uvicorn backend.app.main:app --reload --port 8000
)

if "%OPTION%"=="2" (
    if "%DOCKER_AVAILABLE%"=="false" (
        echo ⚠️  Docker is not installed. Install Docker Desktop to continue.
        exit /b 1
    )
    
    echo Starting Docker containers...
    docker-compose up -d
    
    echo.
    echo ✓ Containers started!
    echo.
    echo "Waiting for PostgreSQL to be ready..."
    timeout /t 5 /nobreak
    
    echo.
    echo ✓ Services running:
    echo   Database: postgresql://f1admin:f1secure@localhost:5432/f1_db
    echo   API: http://localhost:8000
    echo   Docs: http://localhost:8000/docs
)

if "%OPTION%"=="3" (
    echo Training ML Model...
    echo.
    set /p DB_URL="Enter database URL (postgresql://user:pass@host:port/dbname): "
    
    if "%DOCKER_AVAILABLE%"=="true" (
        echo Using Docker container...
        docker-compose run ml-trainer
    ) else (
        echo Using local environment...
        call backend\venv\Scripts\activate.bat
        python backend\train_model.py --database-url "!DB_URL!" --output backend\models\
    )
    
    echo.
    echo ✓ Model training complete!
    echo   Model saved to: backend\models\f1_model.pkl
    echo   Scaler saved to: backend\models\f1_scaler.pkl
)

if "%OPTION%"=="4" (
    if "%DOCKER_AVAILABLE%"=="true" (
        echo Starting API with Docker...
        docker-compose up -d backend
        
        echo.
        echo ✓ API started!
        echo   URL: http://localhost:8000
        echo   Docs: http://localhost:8000/docs
        echo.
        echo View logs: docker-compose logs -f backend
    ) else (
        echo Starting API locally...
        call backend\venv\Scripts\activate.bat
        
        cd backend
        python -m uvicorn app.main:app --reload --port 8000
    )
)

if "%OPTION%"=="5" (
    if "%DOCKER_AVAILABLE%"=="false" (
        echo ⚠️  Docker is not installed. Install Docker Desktop to continue.
        exit /b 1
    )
    
    echo Starting all services with Docker...
    docker-compose up
)

if "%OPTION%"=="6" (
    if "%DOCKER_AVAILABLE%"=="true" (
        docker-compose logs -f
    ) else (
        echo ⚠️  Docker not available. Check local logs in backend\logs\
    )
)

endlocal
