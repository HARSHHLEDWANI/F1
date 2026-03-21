# 🏎️ F1 Race Predictor

The next generation of Formula 1 analytics platform featuring AI-driven race predictions, real-time telemetry, and comprehensive technical insights.

![F1 Predictor](https://img.shields.io/badge/F1-Predictor-red)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Scikit--learn](https://img.shields.io/badge/Scikit--learn-1.3.2-orange)

## 🌟 Features

### 🚀 AI-Powered Predictions
- **Podium Predictions**: Top 3 finishers with confidence scores (0-100)
- **Overtake Analysis**: Position gain predictions and overtake probability
- **Driver Form Index**: Real-time performance ratings based on recent results
- **Constructor Reliability**: Team performance metrics and DNF analysis

### 📊 Comprehensive Analytics
- **Driver Profiles**: Detailed technical profiles with career statistics
- **Team Analysis**: Constructor performance and reliability metrics
- **Circuit Insights**: Track-specific performance data and difficulty ratings
- **Race Results**: Historical data with advanced filtering

### 🎯 Advanced ML Pipeline
- **Random Forest Regressor**: Trained on historical F1 data (2021+)
- **17 Engineered Features**: Driver form, constructor stats, track affinity
- **Real-time Inference**: <50ms prediction response time
- **Offline Training**: Weekly model updates after Grand Prix

### 🎨 Modern UI/UX
- **Next.js 16**: React framework with App Router
- **Tailwind CSS**: Utility-first styling with custom F1 theme
- **Framer Motion**: Smooth animations and transitions
- **Responsive Design**: Mobile-first approach

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6 (Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks
- **API Client**: Axios-based custom fetch wrapper

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 16
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Pydantic
- **CORS**: FastAPI middleware

### Machine Learning
- **Core Library**: Scikit-learn 1.3.2
- **Algorithm**: Random Forest Regressor (100 estimators)
- **Data Processing**: Pandas, NumPy
- **Model Serialization**: Pickle (.pkl files)
- **Feature Scaling**: StandardScaler

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Process Management**: PM2 (optional)
- **Environment**: Python virtualenv
- **Package Manager**: pnpm (frontend), pip (backend)

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

### Required Software
- **Node.js**: 18.0+ (with npm/pnpm)
- **Python**: 3.11+
- **PostgreSQL**: 14+
- **Git**: Latest version

### Optional (for full development)
- **Docker**: 20.10+ (for containerized deployment)
- **Docker Compose**: 2.0+ (for multi-container orchestration)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd f1-race-predictor
```

### 2. Environment Setup

#### Backend Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

#### Frontend Environment
```bash
cp .env.example .env.local
# Frontend environment is already configured
```

### 3. Database Setup

#### Option A: Local PostgreSQL
```bash
# Create database
createdb f1_db

# Or using psql
psql -U postgres
CREATE DATABASE f1_db;
\q
```

#### Option B: Docker PostgreSQL
```bash
docker run --name f1-postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=f1_db -p 5432:5432 -d postgres:16
```

### 4. Install Dependencies

#### Backend
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### Frontend
```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 5. Database Population

Populate the database with F1 data:
```bash
cd backend
python data_pipeline/populate_drivers.py
python data_pipeline/populate_teams.py
python data_pipeline/populate_circuit_stats.py
python data_pipeline/populate_race_results.py
```

### 6. Train ML Model

Train the race prediction model:
```bash
cd backend
python train_model.py --database-url "postgresql://user:pass@localhost:5432/f1_db" --output models/
```

### 7. Run the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
pnpm dev
# or
npm run dev
```

#### Production Mode (Docker)

```bash
# Build and run all services
docker-compose up -d

# Or build and run separately
docker-compose up -d postgres
docker-compose up -d backend
docker-compose up -d frontend
```

### 8. Access the Application

- **Frontend**: http://localhost:3000 (or 3001 if 3000 is busy)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Database**: postgresql://localhost:5432/f1_db

## 📖 API Documentation

### Authentication Endpoints

```bash
# Register new user
POST /signup
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}

# Login
POST /login
{
  "username": "user@example.com",
  "password": "securepassword"
}
```

### Data Endpoints

```bash
# Get all drivers
GET /drivers

# Get driver by ID
GET /drivers/{id}

# Get all teams
GET /teams

# Get race results
GET /races

# Get user profile (requires auth)
GET /profile
```

### ML Prediction Endpoints

```bash
# Get podium predictions
POST /api/predictions/podium
{
  "season": 2026,
  "round": 5
}

# Get overtake analysis
POST /api/predictions/overtake
{
  "season": 2026,
  "round": 5
}
```

## 🗄️ Database Schema

### Core Tables

```sql
-- Drivers
CREATE TABLE drivers (
  id SERIAL PRIMARY KEY,
  driver_ref VARCHAR,
  given_name VARCHAR,
  family_name VARCHAR,
  nationality VARCHAR,
  date_of_birth DATE
);

-- Teams/Constructors
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  nationality VARCHAR
);

-- Circuits
CREATE TABLE circuits (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  locality VARCHAR,
  country VARCHAR
);

-- Races
CREATE TABLE races (
  id SERIAL PRIMARY KEY,
  season INTEGER,
  round INTEGER,
  circuit_id INTEGER REFERENCES circuits(id)
);

-- Race Results
CREATE TABLE race_results (
  id SERIAL PRIMARY KEY,
  season INTEGER,
  round INTEGER,
  driver_ref VARCHAR,
  constructor_ref VARCHAR,
  grid INTEGER,
  position INTEGER,
  points DECIMAL,
  status VARCHAR
);

-- Users (Authentication)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE,
  hashed_password VARCHAR,
  is_pro BOOLEAN DEFAULT FALSE
);
```

## 🤖 ML Model Details

### Training Data
- **Source**: Historical F1 race results (2021+ seasons)
- **Features**: 17 engineered features
- **Target**: Finishing position (1-20)
- **Split**: 80% training, 20% testing

### Feature Engineering

| Category | Features | Description |
|----------|----------|-------------|
| **Driver** | avg_position, position_trend, dnf_rate, form_index | Recent performance metrics |
| **Constructor** | reliability, avg_points, recent_points | Team performance |
| **Track** | affinity_position, difficulty, experience | Circuit-specific data |
| **Race** | grid_position | Starting position |

### Model Performance
- **Algorithm**: Random Forest Regressor
- **MAE**: ~2.5 positions (average error)
- **R² Score**: 0.75+ (variance explained)
- **Inference Time**: <50ms per prediction

## 🐳 Docker Deployment

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production
```bash
# Build for production
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

## 🔧 Development Commands

### Frontend
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Run tests
pnpm test
```

### Backend
```bash
# Activate virtual environment
source venv/bin/activate

# Run development server
uvicorn app.main:app --reload

# Run with specific host/port
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Run tests
python -m pytest

# Format code
black .
isort .
```

### Database
```bash
# Connect to database
psql -U postgres -d f1_db

# Run migrations (if using Alembic)
alembic upgrade head

# Backup database
pg_dump f1_db > backup.sql

# Restore database
psql f1_db < backup.sql
```

### ML Pipeline
```bash
# Train model
python train_model.py --database-url "postgresql://..." --output models/

# Validate model
python -c "import pickle; m = pickle.load(open('models/f1_model.pkl', 'rb')); print('Model loaded successfully')"

# Test predictions
python -c "import requests; r = requests.post('http://localhost:8000/api/predictions/podium', json={'season': 2026, 'round': 1}); print(r.json())"
```

## 🧪 Testing

### API Testing
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test predictions
curl -X POST http://localhost:8000/api/predictions/podium \
  -H "Content-Type: application/json" \
  -d '{"season": 2026, "round": 1}'
```

### Frontend Testing
```bash
# Run unit tests
pnpm test

# Run E2E tests (if configured)
pnpm test:e2e
```

## 🚀 Deployment Options

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production build
vercel --prod
```

### Railway/DigitalOcean (Full Stack)
```bash
# Using Railway
railway login
railway init
railway up
```

### AWS/GCP/Azure
- Use Docker containers
- Set up PostgreSQL RDS
- Deploy with ECS/EKS or App Engine/Kubernetes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for frontend code
- Follow PEP 8 for Python code
- Write tests for new features
- Update documentation
- Use conventional commits

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Formula 1 data provided by Ergast API
- Icons by Lucide React
- UI inspiration from F1 official website
- ML algorithms powered by Scikit-learn

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/username/f1-predictor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/username/f1-predictor/discussions)
- **Email**: support@f1predictor.com

---

**Built with ❤️ for F1 fans worldwide**
