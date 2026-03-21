# F1 Race Predictor - ML Pipeline & Deployment Guide

## Overview

This document covers the complete ML pipeline for the F1 Race Predictor, including:
- **Data Processing**: Fetching and preparing F1 historical data from PostgreSQL
- **Feature Engineering**: Creating 17 engineered features for model training
- **Model Training**: Offline Random Forest training with evaluation metrics
- **API Integration**: FastAPI endpoints for real-time predictions
- **Containerization**: Docker & Docker Compose setup for production deployment

## Project Structure

```
backend/
├── ml/
│   ├── __init__.py
│   ├── processor.py              # F1DataProcessor class - Data fetching & preparation
│   └── feature_engineer.py       # FeatureEngineer class - Feature creation (17 features)
├── app/
│   ├── main.py                   # FastAPI application
│   ├── models.py                 # SQLAlchemy ORM models
│   ├── schemas.py                # Pydantic models (includes ML schemas)
│   ├── routes/
│   │   ├── prediction.py         # ML prediction endpoints
│   │   ├── f1.py                 # F1 data endpoints
│   │   └── profile.py            # Profile endpoints
│   └── ...
├── train_model.py                # Offline ML training script
├── requirements.txt              # Python dependencies
├── Dockerfile                    # Container image definition
└── models/
    ├── f1_model.pkl              # Trained Random Forest model (generated)
    ├── f1_scaler.pkl             # StandardScaler (generated)
    ├── latest symlinks           # Point to latest model versions
    └── ...

docker-compose.yml               # Orchestrate PostgreSQL + Backend
.env.example                     # Environment variables template
```

## Components

### 1. F1DataProcessor (`backend/ml/processor.py`)

**Purpose**: Fetch and prepare F1 data from PostgreSQL database.

**Key Methods**:
- `fetch_race_results_data()`: Get historical race finishes with driver/team/circuit info
- `fetch_current_grid(season, round)`: Grid/qualifying positions for a specific race
- `fetch_driver_history(driver_id, limit=20)`: Last N races for a driver
- `fetch_constructor_stats(constructor_id, season)`: Reliability, points, DNF rates
- `fetch_track_affinity(driver_id, circuit_id)`: Historical performance at specific track
- `get_training_data()`: Master method returning prepared DataFrame for training

**Data Flow**:
```
PostgreSQL Database
    ↓
F1DataProcessor (LEFT JOINs for robustness)
    ↓
Pandas DataFrame (with NaN handling)
    ↓
FeatureEngineer
```

### 2. FeatureEngineer (`backend/ml/feature_engineer.py`)

**Purpose**: Create 17 engineered features from raw race data.

**17 Features**:

| Feature Category | Features | Count |
|---|---|---|
| **Driver Form** | driver_avg_position, driver_position_trend, driver_points_std, driver_podiums_10races, driver_dnf_rate | 5 |
| **Constructor** | constructor_reliability, constructor_avg_position, constructor_avg_points, constructor_recent_points | 4 |
| **Track** | track_affinity_position, track_affinity_podium_rate, track_difficulty, track_experience | 4 |
| **Overtake** | driver_overtake_ability, constructor_overtake_power | 2 |
| **Grid** | grid_position | 1 |
| **Form Index** | driver_form_index (0-100 weighted score) | 1 |

**Key Calculations**:
- **Driver Form Index**: `(recent_points * 0.6) + (normalized_position * 0.4)` → 0-100 scale
- **Constructor Reliability**: `1 - (DNF_count / total_races)`
- **Track Affinity**: Average finishing position at specific circuit
- **Overtake Ability**: Average position gain per race (grid - final position)

### 3. Model Training (`backend/train_model.py`)

**Strategy**: Offline training (runs weekly after Grand Prix, saves .pkl files)

**Algorithm**: Random Forest Regressor
- **Estimators**: 100 trees
- **Max Depth**: 15 (prevent overfitting)
- **Train/Test Split**: 80/20
- **Feature Scaling**: StandardScaler (fitted, then reused in inference)

**Evaluation Metrics**:
- Mean Absolute Error (MAE) - how far predictions are in positions
- R² Score - variance explained
- Feature Importance - which features contribute most

**Training Command**:
```bash
python backend/train_model.py \
  --database-url "postgresql://user:pass@localhost:5432/f1_db" \
  --output "backend/models/"
```

**Output Files**:
```
backend/models/
├── f1_model_2024-01-15_14-30-45.pkl    # Timestamped model
├── f1_scaler_2024-01-15_14-30-45.pkl   # Fitted scaler
├── f1_model.pkl                         # Symlink to latest
└── f1_scaler.pkl                        # Symlink to latest
```

### 4. API Endpoints (`backend/app/routes/prediction.py`)

#### **Endpoint 1: POST /predictions/podium**

Predicts the top 3 finishing drivers (Podium) for a race.

**Request**:
```json
{
  "season": 2026,
  "round": 5
}
```

**Response**:
```json
{
  "season": 2026,
  "round": 5,
  "circuit_name": "Circuit de Barcelona-Catalunya",
  "podium": [
    {
      "position": 1,
      "driver_id": 844,
      "driver_name": "Max Verstappen",
      "constructor": "Red Bull Racing",
      "predicted_finish_position": 1.23,
      "confidence_score": 92.5,
      "form_index": 88
    },
    {
      "position": 2,
      "driver_id": 815,
      "driver_name": "Lewis Hamilton",
      "constructor": "Mercedes-AMG Petronas F1 Team",
      "predicted_finish_position": 2.15,
      "confidence_score": 89.3,
      "form_index": 85
    },
    {
      "position": 3,
      "driver_id": 830,
      "driver_name": "Lando Norris",
      "constructor": "McLaren F1 Team",
      "predicted_finish_position": 3.45,
      "confidence_score": 78.2,
      "form_index": 77
    }
  ],
  "overall_confidence": 86.7,
  "generated_at": "2024-01-15T14:30:45.123456"
}
```

**Confidence Score Calculation**:
```
position_confidence = 100 - (predicted_position * 4)
form_confidence = driver_form_index (0-100)
reliability_confidence = (constructor_reliability * 50) + 50

final_score = (position_confidence * 0.4) 
            + (form_confidence * 0.4) 
            + (reliability_confidence * 0.2)
```

#### **Endpoint 2: POST /predictions/overtake** (Bonus AI Feature)

Predicts overtake opportunities for all drivers in a race.

**Request**:
```json
{
  "season": 2026,
  "round": 5
}
```

**Response**:
```json
{
  "season": 2026,
  "round": 5,
  "predictions": [
    {
      "driver_id": 844,
      "driver_name": "Max Verstappen",
      "grid_position": 1,
      "predicted_positions_gained": 0,
      "overtake_probability": 15,
      "expected_finish_position": 1
    },
    {
      "driver_id": 891,
      "driver_name": "Carlos Sainz",
      "grid_position": 8,
      "predicted_positions_gained": 4,
      "overtake_probability": 72,
      "expected_finish_position": 4
    }
  ],
  "generated_at": "2024-01-15T14:30:45.123456"
}
```

**Overtake Probability Calculation**:
```
overtake_prob = (driver_overtake_ability * 10 + 50) 
              + (form_index / 100 * 20)
overtake_prob = min(100, overtake_prob)
```

## Installation & Setup

### Local Development

**Prerequisites**:
- Python 3.11+
- PostgreSQL 14+
- pip or uv

**Steps**:

1. **Clone and navigate**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Set up database**:
PostgreSQL must be running with populated `races`, `race_results`, `drivers`, `teams`, `circuits` tables.

5. **Train the model** (optional, but required for predictions):
```bash
python train_model.py \
  --database-url "postgresql://user:pass@localhost:5432/f1_db" \
  --output models/
```

6. **Start the API**:
```bash
uvicorn app.main:app --reload --port 8000
```

### Docker Deployment

**Prerequisites**:
- Docker 20.10+
- Docker Compose 2.0+

**Steps**:

1. **Copy environment file**:
```bash
cp .env.example .env
# Edit .env with your desired values
```

2. **Build and start services**:
```bash
docker-compose up -d
```

This will:
- Start PostgreSQL on port 5432
- Start FastAPI on port 8000
- Create models/ volume for persistence

3. **Initialize database** (if first time):
```bash
# Run your database initialization script
# Or connect to PostgreSQL and populate with F1 data
docker-compose exec postgres psql -U f1admin -d f1_db -f /path/to/init.sql
```

4. **Train the model**:
```bash
# Run ML trainer service
docker-compose run ml-trainer
```

Or manually:
```bash
docker-compose exec backend python train_model.py \
  --database-url "postgresql://f1admin:f1secure@postgres:5432/f1_db" \
  --output models/
```

5. **Test the API**:
```bash
curl -X POST http://localhost:8000/api/predictions/podium \
  -H "Content-Type: application/json" \
  -d '{"season": 2026, "round": 5}'
```

## API Documentation

Once running, visit:
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Database Requirements

The following tables must exist in PostgreSQL:

```sql
-- Required tables (from models.py)
CREATE TABLE drivers (
  driver_id INT PRIMARY KEY,
  permanent_number INT,
  given_name VARCHAR,
  family_name VARCHAR,
  ...
);

CREATE TABLE teams (
  team_id INT PRIMARY KEY,
  name VARCHAR,
  ...
);

CREATE TABLE circuits (
  circuit_id INT PRIMARY KEY,
  name VARCHAR,
  ...
);

CREATE TABLE races (
  race_id INT PRIMARY KEY,
  season INT,
  round INT,
  circuit_id INT,
  name VARCHAR,
  ...
);

CREATE TABLE race_results (
  result_id INT PRIMARY KEY,
  race_id INT,
  driver_id INT,
  constructor_id INT,
  grid INT,
  position INT,
  points DECIMAL,
  status VARCHAR,
  ...
);
```

## Performance Characteristics

| Operation | Time | Notes |
|---|---|---|
| **Model Training** | 30-120s | Depends on training data size (1000s of races) |
| **Single Prediction** | ~50ms | Inference only (per driver) |
| **Podium Endpoint** | ~1-2s | 20 driver predictions + database queries |
| **Overtake Endpoint** | ~1-2s | 20 driver predictions |
| **Model Lazy Load** | ~500ms | First request only, cached thereafter |

## Troubleshooting

### Model Not Found (503 Service Unavailable)
```
Train the model first:
python train_model.py --database-url <url> --output models/
```

### Feature Mismatch Errors
```
The 17 features in training must match prediction exactly.
Verify: backend/ml/feature_engineer.py get_feature_columns() 
matches: backend/app/routes/prediction.py _feature_columns
```

### Database Connection Issues
```
Verify DATABASE_URL format:
postgresql://user:password@host:port/dbname

Check PostgreSQL is running and accessible:
psql -U user -h localhost -d f1_db
```

### Docker Permission Errors
```
Rebuild without cache:
docker-compose build --no-cache
docker-compose up -d
```

## Monitoring & Logging

All components log to:
- **Backend**: stdout (Docker) or `backend/logs/` (local)
- **Database**: PostgreSQL logs
- **ML Training**: train_model.py output

Set `LOG_LEVEL=DEBUG` in .env for verbose logging.

## Future Enhancements

### 3 Bonus AI Features (Planned)

1. **Driver Clutch Rating** - Performance under pressure
   - Compare lap times in final 10 laps vs first 10 laps when gap < 1.0s
   - 0-100 rating

2. **Live Strategy Pivot Predictor** - LSTM tire degradation
   - Predict optimal pit window
   - Warn of unexpected degradation
   - Requires telemetry data (fastf1 library)

3. **Advanced Overtake Index** - Context-aware overtake probability
   - Account for DRS zones, tire advantage, fuel loads
   - Historical overtake success rate at track

## Production Checklist

- [ ] PostgreSQL database configured and backed up
- [ ] AI model trained and .pkl files generated
- [ ] .env file configured with secure passwords
- [ ] Docker images built and tested
- [ ] Health checks passing (http://localhost:8000/health)
- [ ] Model version tracking implemented
- [ ] Monitoring/alerting set up
- [ ] Training scheduled (weekly cron job)
- [ ] API rate limiting configured
- [ ] Authentication enabled (JWT tokens)

## Support & Development

For issues or questions:
1. Check logs: `docker-compose logs backend`
2. Run training with verbose output: `python train_model.py ... --verbose`
3. Test model locally: `python -c "import pickle; m=pickle.load(open('models/f1_model.pkl','rb'))"`
4. Validate features: Python REPL with `backend/ml/feature_engineer.py`

---

**Last Updated**: 2024  
**ML Stack**: Scikit-learn Random Forest  
**Database**: PostgreSQL  
**API Framework**: FastAPI
