# F1 Predictor 🏎️

A comprehensive Formula 1 prediction platform with real-time driver telemetry, team analytics, and race predictions powered by machine learning.

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Data Pipeline](#data-pipeline)
- [Current Status](#current-status)
- [Future Roadmap](#future-roadmap)

## Project Overview

F1 Predictor is a full-stack web application that provides Formula 1 enthusiasts and analysts with:
- **Driver Profiles**: Detailed telemetry and performance metrics for all 20 F1 drivers
- **Team Analytics**: Constructors performance, current rosters, and technical specifications
- **Track Data**: Circuit information with lap records and difficulty ratings
- **Race Predictions**: AI-powered predictions for race outcomes based on historical data
- **User Profiles**: Personalized predictions with tiered membership (FREE/PRO)

## Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                        │
│              React Components + Tailwind CSS                    │
│                    TypeScript Type Safety                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    REST API (HTTP)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                BACKEND (FastAPI + FastF1)                       │
│              Python server with SQLAlchemy ORM                  │
│                                                                   │
│  ├─ Auth Routes (Signup, Login, JWT)                           │
│  ├─ F1 Routes (Drivers, Teams, Circuits)                       │
│  ├─ Profile Routes (User preferences, ratings)                 │
│  └─ Prediction Routes (Race predictions, scoring)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│          DATABASE (PostgreSQL)                                  │
│   ├─ Users (Authentication & Pro status)                       │
│   ├─ Drivers (2026 Grid)                                       │
│   ├─ Constructors/Teams (10 Teams)                             │
│   ├─ Circuits (Race tracks)                                    │
│   ├─ Race Results (Historical data)                            │
│   └─ Predictions (User race predictions)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│        ML SERVICE (FastF1 + Scikit-learn)                       │
│                                                                   │
│  ├─ Data Collector: Fetches F1 telemetry via FastF1            │
│  ├─ Lap Time Trainer: ML models for lap prediction             │
│  └─ Dataset Builder: Aggregates multi-season data              │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### ✅ Implemented
- **Driver Grid** - View all 20 F1 drivers with performance ratings, career stats
- **Teams Page** - Display 10 F1 constructors with technical specs and current rosters
- **Tracks Page** - Circuit information and lap records
- **Authentication** - User signup/login with JWT-based auth
- **Database Population** - Automated data loading from JSON sources
- **Driver-Team Assignment** - 2026 season roster management
- **Responsive UI** - Mobile-optimized with Tailwind CSS + Framer Motion animations

### 🚀 In Development
- Race prediction algorithms
- Advanced telemetry analytics
- Pro tier premium features
- Real-time race scoring

### 📋 Planned
- Live session timing
- Head-to-head driver comparisons (enhanced)
- Strategic race simulation
- Leaderboards and rankings
- WebSocket live updates

## Tech Stack

### Frontend
- **Next.js 16** (App Router, Turbopack)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **pnpm** for dependency management

### Backend
- **FastAPI** for REST API
- **SQLAlchemy** ORM for database operations
- **PostgreSQL** for data persistence
- **Pydantic** for request validation
- **JWT** for authentication

### ML Service
- **FastF1** for F1 telemetry data
- **Pandas** for data processing
- **Scikit-learn** for ML models
- **NumPy** for numerical computing

## Project Structure

```
f1/
├── app/                          # Next.js application
│   ├── api/auth/                # Authentication endpoints
│   ├── auth/signin/              # Sign-in page
│   ├── drivers/                  # Drivers grid page
│   ├── teams/                    # Teams page
│   ├── tracks/                   # Tracks page
│   ├── prediction/               # Predictions page
│   ├── profile/                  # User profile page
│   ├── layout.tsx                # App layout
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Global styles
│   └── providers.tsx             # Context providers
│
├── components/                   # Reusable React components
│   ├── navbar.tsx
│   ├── driver-comparison.tsx
│   └── ...
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   └── useUserTier.ts
│
├── lib/                          # Utility functions
│   └── api.ts                    # API fetch wrapper
│
├── backend/                      # FastAPI server
│   ├── app/
│   │   ├── main.py              # FastAPI app initialization
│   │   ├── routes/              # API route handlers
│   │   │   ├── f1.py            # F1 data endpoints
│   │   │   ├── prediction.py     # Prediction endpoints
│   │   │   └── profile.py        # Profile endpoints
│   │   ├── models.py            # SQLAlchemy ORM models
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── database.py          # Database configuration
│   │   ├── auth.py              # Authentication utilities
│   │   ├── config.py            # App configuration
│   │   └── dependencies.py      # Dependency injection
│   │
│   └── data_pipeline/           # ETL scripts
│       ├── load_metadata.py      # Load drivers, teams, circuits
│       ├── load_race_results.py  # Load historical race data
│       ├── assign_driver_teams.py # Map drivers to 2026 teams
│       ├── fetch_*.py            # Data fetching utilities
│       └── db.py                 # Database utilities
│
├── ml-service/                   # Machine learning service
│   ├── app/
│   │   ├── main.py
│   │   ├── data_collector.py    # FastF1 integration
│   │   ├── fastf1_setup.py      # FastF1 configuration
│   │   ├── config.py
│   │   ├── pipelines/           # ML pipelines
│   │   │   ├── fastf1_pipeline.py
│   │   │   └── dataset_builder.py
│   │   ├── routes/              # API endpoints
│   │   │   └── predict.py
│   │   ├── services/            # ML services
│   │   │   └── lap_time_trainer.py
│   │   └── cache/               # FastF1 cache
│   │
│   ├── models/                  # Trained models
│   └── requirements.txt
│
├── public/                       # Static assets
│   └── drivers/                  # Driver images
│
├── drivers.json                 # 2026 F1 drivers data
├── teams.json                   # F1 teams data
├── circuits.json                # Racing circuits data
├── race_results.json            # Historical race results
│
└── package.json                 # Frontend dependencies
```

## Setup & Installation

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- PostgreSQL 14+ (database)
- pnpm (package manager)

### Frontend Setup
```bash
# Install dependencies
pnpm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_ML_URL=http://localhost:8001
EOF
```

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cat > .env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/f1_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF

# Initialize database
python -m backend.data_pipeline.load_metadata
python -m backend.data_pipeline.assign_driver_teams
```

### ML Service Setup
```bash
cd ml-service

# Create virtual environment
python -m venv venv
source venv/Scripts/activate

# Install dependencies
pip install -r requirements.txt
```

## Running the Application

### Development Mode (3 terminals)

**Terminal 1 - Frontend:**
```bash
cd /path/to/f1
pnpm dev
# Runs on http://localhost:3000
```

**Terminal 2 - Backend API:**
```bash
cd /path/to/f1/backend
source venv/Scripts/activate
uvicorn app.main:app --reload --port 8000
# Runs on http://localhost:8000
# API docs: http://localhost:8000/docs
```

**Terminal 3 - ML Service:**
```bash
cd /path/to/f1/ml-service
source venv/Scripts/activate
uvicorn app.main:app --reload --port 8001
# Runs on http://localhost:8001
```

## API Endpoints

### F1 Data Routes (`/api`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/drivers` | Get all 20 drivers | No |
| GET | `/drivers/{id}` | Get driver by ID | No |
| GET | `/teams` | Get all 10 teams | No |
| GET | `/tracks` | Get all circuits | No |

### Authentication Routes (`/api`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Create user account |
| POST | `/login` | Login & get JWT token |
| GET | `/me` | Get current user (protected) |

### Prediction Routes (`/api`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/predictions/{user_id}` | Get user predictions | Yes |
| POST | `/predictions` | Create race prediction | Yes |
| POST | `/predictions/score` | Score predictions | Yes |

## Database Schema

### Users
```sql
- id: Integer (PK)
- email: String (unique)
- hashed_password: String
- is_pro: Boolean
- favorite_team: String (nullable)
- favorite_driver: String (nullable)
- plan: String (FREE/PRO)
- predictions_today: Integer
- last_prediction_date: Date
```

### Drivers
```sql
- id: Integer (PK)
- given_name: String
- family_name: String
- nationality: String
- number: Integer (nullable)
- team: String (2026 assignment)
- championships: Integer
- wins: Integer
- podiums: Integer
- poles: Integer
- points_total: Integer
- rating: Integer (0-100)
- image_url: String (nullable)
```

### Constructors (Teams)
```sql
- id: Integer (PK)
- name: String
- nationality: String
```

### Circuits (Tracks)
```sql
- id: Integer (PK)
- circuit_ref: String
- name: String
- locality: String
- country: String
- lat: Float
- lng: Float
- lap_distance: Float (km)
- laps: Integer
- lap_record_time: String
- lap_record_holder: String
- difficulty: Integer (0-100)
```

### Predictions
```sql
- id: Integer (PK)
- user_id: Integer (FK)
- season: Integer
- round: Integer
- predicted_p1: String
- predicted_p2: String
- predicted_p3: String
- score: Integer
- created_at: DateTime
```

## Data Pipeline

### Data Sources
- **drivers.json** - F1 driver database (official FIA data)
- **teams.json** - Constructor information
- **circuits.json** - Circuit specifications
- **race_results.json** - Historical race results (2023-2026)

### Loading Process
```bash
# Load all metadata (drivers, teams, circuits)
python -m backend.data_pipeline.load_metadata

# Assign drivers to their 2026 teams
python -m backend.data_pipeline.assign_driver_teams

# Load historical race results
python -m backend.data_pipeline.load_race_results
```

### 2026 Driver Assignments
- **Red Bull**: Verstappen, Perez
- **Mercedes**: Hamilton, Russell
- **Ferrari**: Leclerc, Sainz
- **McLaren**: Piastri, Norris
- **Aston Martin**: Alonso, Stroll
- **Alpine F1 Team**: Gasly, Ocon
- **Haas F1 Team**: Hulkenberg, Magnussen
- **RB F1 Team**: Tsunoda, Lawson
- **Williams**: Albon, Colapinto
- **Sauber**: Bottas, Zhou

## Current Status

### ✅ Completed Work
- [x] Project structure and setup
- [x] Database schema and initialization
- [x] FastAPI backend with core routes
- [x] Next.js frontend with responsive UI
- [x] Authentication system (JWT-based)
- [x] Data pipeline for loading F1 metadata
- [x] Driver-team assignment for 2026 season
- [x] Driver grid page with full profiles
- [x] Teams page with rosters and technical specs
- [x] Tracks/Circuits page
- [x] Bug fixes (JSX closures, endpoint mismatches)
- [x] Full database population (10 teams, 20 drivers, all circuits)

### 🔄 In Progress
- Race prediction ML models
- Telemetry analytics dashboard
- Advanced filtering and search

### 📝 TODO
- Pro tier features and paywall
- Live race scoring and updates
- WebSocket implementation
- Advanced telemetry visualizations
- Leaderboards
- User ratings and rankings
- Email notifications
- API rate limiting

## Future Roadmap

### Phase 2 (Next)
- [ ] Train and deploy ML prediction models
- [ ] Implement race scoring system
- [ ] Add pro tier features (premium predictions, advanced analytics)
- [ ] Create driver comparison tool
- [ ] Build leaderboard system

### Phase 3
- [ ] Real-time race tracking with WebSockets
- [ ] Live telemetry streaming
- [ ] Advanced data visualizations (graphs, charts)
- [ ] Mobile app via React Native
- [ ] Push notifications for race reminders

### Phase 4
- [ ] Social features (predictions sharing, contests)
- [ ] API for third-party integrations
- [ ] Advanced ML models (session prediction, pitstop strategy)
- [ ] Multi-language support
- [ ] Discord bot integration

## Development Notes

### Common Issues & Solutions

**Issue**: Only 4 teams showing in teams page  
**Solution**: Fixed team name mismatches between frontend and database. Updated `TEAMS_INFO` to match actual database team names.

**Issue**: No drivers assigned to teams  
**Solution**: Created `assign_driver_teams.py` script to map drivers to 2026 rosters based on confirmed lineups.

**Issue**: "/constructors" endpoint not found  
**Solution**: Corrected endpoint to `/teams` (matches backend route definition in `f1.py`).

### Code Quality
- TypeScript for frontend type safety
- Pydantic for backend validation
- SQLAlchemy for ORM consistency
- Comprehensive error handling throughout

## Contributing

When making changes:
1. Create a new branch for features
2. Follow existing code style
3. Test endpoints via FastAPI docs (`/docs`)
4. Update this README if adding major features
5. Commit with clear, descriptive messages
