# F1 Race Predictor - System Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    F1 RACE PREDICTOR SYSTEM                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Next.js Application (React 18, TypeScript, Tailwind CSS)           │
│  ├── Dashboard (Race Predictions, Form Index)                       │
│  ├── Driver Comparison                                              │
│  ├── Predictions Page (Podium & Overtake)                          │
│  ├── Profile Page (Authentication)                                 │
│  └── Teams/Drivers/Tracks Pages                                    │
│                                                                       │
│  Hooks: useAuth, useUserTier                                        │
│  API Client: /lib/api.ts (axios-based)                             │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ HTTPS ↓

┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  FastAPI Application (Python 3.11)                                  │
│  ├── Port: 8000                                                     │
│  ├── Health Check: GET /health                                      │
│  ├── API Docs: GET /docs (Swagger UI)                              │
│  └── OpenAPI Schema: GET /openapi.json                             │
│                                                                       │
│  Middleware:                                                         │
│  ├── CORS (Enable cross-origin requests)                           │
│  ├── Request Logging                                               │
│  └── Error Handling                                                │
│                                                                       │
│  Routes:                                                            │
│  ├── /api/auth/* → Authentication (JWT)                           │
│  ├── /api/drivers/* → Driver data & stats                         │
│  ├── /api/teams/* → Team data                                     │
│  ├── /api/predictions/podium → ML Podium Predictions             │
│  ├── /api/predictions/overtake → ML Overtake Analysis             │
│  └── /api/profile/* → User profiles                               │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ SQL ↓

┌─────────────────────────────────────────────────────────────────────┐
│                    ML INFERENCE LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  prediction.py (FastAPI Routes)                                     │
│  ├── POST /api/predictions/podium                                  │
│  │   ├── Input: {"season": int, "round": int}                     │
│  │   ├── Load Model: load_model() [lazy load + cache]             │
│  │   ├── Get Race: Query DB for race details                      │
│  │   ├── Get Drivers: All drivers in race from race_results      │
│  │   ├── Feature Engineering: build_driver_features() × 20        │
│  │   ├── Inference: model.predict(features) × 20                  │
│  │   ├── Confidence Score: calculate_confidence_score()           │
│  │   └── Output: Top 3 podium finishers                           │
│  │                                                                  │
│  └── POST /api/predictions/overtake                                │
│      ├── Input: {"season": int, "round": int}                     │
│      ├── Process: Similar to podium but with overtake focus       │
│      ├── Calculate: Position gains + overtake probability          │
│      └── Output: All drivers with overtake metrics                 │
│                                                                       │
│  Helper Functions:                                                  │
│  ├── load_model() → .pkl deserialization (caching)                │
│  ├── build_driver_features() → 17 engineered features per driver   │
│  └── calculate_confidence_score() → Weighted confidence 0-100      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ Query ↓

┌─────────────────────────────────────────────────────────────────────┐
│                    ML TRAINING LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  train_model.py (CLI Interface)                                     │
│  ├── Entry Point: python train_model.py --database-url <url>      │
│  │                                                                  │
│  ├── Phase 1: Data Loading                                        │
│  │   └── F1DataProcessor.get_training_data()                      │
│  │       ├── fetch_race_results_data()                            │
│  │       ├── Filters: Valid races, min race count per driver      │
│  │       └── Output: Pandas DataFrame (10,000s of records)        │
│  │                                                                  │
│  ├── Phase 2: Feature Engineering                                │
│  │   └── FeatureEngineer.engineer_all_features()                  │
│  │       ├── Driver Features (5): avg_position, trend, dnf, etc    │
│  │       ├── Constructor Features (4): reliability, points        │
│  │       ├── Track Features (4): affinity, difficulty, exp        │
│  │       ├── Overtake Features (2): ability, power                │
│  │       └── Form Index: 0-100 weighted score                     │
│  │       → Output: 17 total features                              │
│  │                                                                  │
│  ├── Phase 3: Data Scaling                                       │
│  │   └── StandardScaler.fit_transform()                          │
│  │       ├── Normalize features to mean=0, std=1                  │
│  │       └── Save scaler for inference                            │
│  │                                                                  │
│  ├── Phase 4: Model Training                                     │
│  │   └── RandomForestRegressor (100 estimators)                   │
│  │       ├── Train on 80% of data                                 │
│  │       ├── Test on 20% of data                                  │
│  │       └── Evaluate: MAE, R², Feature Importance                │
│  │                                                                  │
│  └── Phase 5: Model Serialization                                │
│      ├── Pickle model → f1_model_<timestamp>.pkl                 │
│      ├── Pickle scaler → f1_scaler_<timestamp>.pkl               │
│      ├── Create symlinks: f1_model.pkl → latest                  │
│      └── Restart FastAPI to use new model                        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ SQL ↓

┌─────────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  processor.py (F1DataProcessor)                                     │
│  ├── fetch_race_results_data()                                      │
│  │   └── SQL: Joins races, race_results, drivers, teams, circuits  │
│  │           LEFT JOINs prevent NULL crashes                        │
│  │                                                                   │
│  ├── fetch_current_grid(season, round)                              │
│  │   └── SQL: Grid/qualifying positions for race                    │
│  │                                                                   │
│  ├── fetch_driver_history(driver_id, limit=20)                      │
│  │   └── SQL: Last N races for specific driver                      │
│  │                                                                   │
│  ├── fetch_constructor_stats(constructor_id, season)                │
│  │   └── SQL: Team reliability, average points, DNF rate            │
│  │                                                                   │
│  ├── fetch_track_affinity(driver_id, circuit_id)                    │
│  │   └── SQL: Driver's historical performance at track              │
│  │                                                                   │
│  └── Error Handling:                                                │
│      ├── Graceful fallbacks for missing data                        │
│      ├── Returns empty DataFrame with logging                       │
│      └── Prevents training crashes                                  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ PostgreSQL Client ↓

┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  PostgreSQL 16 (Alpine)                                             │
│  ├── Port: 5432 (internal), 5432 (Docker exposed)                 │
│  ├── Volume: postgres_data (persistent storage)                    │
│  │                                                                   │
│  └── Tables:                                                        │
│      ├── drivers                                                    │
│      │   ├── driver_id (PK)                                        │
│      │   ├── given_name, family_name                               │
│      │   ├── date_of_birth, nationality                            │
│      │   └── ...                                                    │
│      │                                                               │
│      ├── teams (constructors)                                       │
│      │   ├── team_id (PK)                                          │
│      │   ├── name                                                  │
│      │   └── ...                                                    │
│      │                                                               │
│      ├── circuits                                                   │
│      │   ├── circuit_id (PK)                                       │
│      │   ├── name, location, country                               │
│      │   └── ...                                                    │
│      │                                                               │
│      ├── races                                                      │
│      │   ├── race_id (PK)                                          │
│      │   ├── season (2026), round (1-24)                           │
│      │   ├── circuit_id (FK)                                       │
│      │   ├── name, date                                            │
│      │   └── ...                                                    │
│      │                                                               │
│      └── race_results                                              │
│          ├── result_id (PK)                                        │
│          ├── race_id (FK)                                          │
│          ├── driver_id (FK)                                        │
│          ├── constructor_id (FK)                                   │
│          ├── grid (1-20)                                           │
│          ├── position (1-20, DNF)                                  │
│          ├── points (0-25)                                         │
│          ├── laps, time, status                                    │
│          └── ...                                                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

### Training Pipeline (Offline - Once Per Week)

```
PostgreSQL Database
        ↓
   [F1DataProcessor]
   - fetch_race_results_data()
   - LEFT JOINs (robust)
        ↓
   Pandas DataFrame
   - 10,000+ race records
   - All driver/team/track info
        ↓
   [FeatureEngineer]
   - engineer_all_features()
   - 17 features per record
        ↓
   Scaled Features
   - StandardScaler.fit_transform()
   - mean=0, std=1
        ↓
   [Random Forest Trainer]
   - 100 estimators
   - max_depth=15
   - 80/20 train/test
        ↓
   Model Evaluation
   - MAE, R² Score
   - Feature Importance
        ↓
   .pkl Files
   - f1_model_<timestamp>.pkl
   - f1_scaler_<timestamp>.pkl
   - Latest symlinks
        ↓
   FastAPI Servers
   (lazy load on next request)
```

### Inference Pipeline (Real-Time - Per Request)

```
Client Request
{season: 2026, round: 5}
        ↓
[FastAPI Endpoint]
/api/predictions/podium
        ↓
[Load Model]
- load_model() [cached]
- f1_model.pkl (RF)
- f1_scaler.pkl (Scaler)
        ↓
[Database Query]
- Get race by (season, round)
- Get all drivers in race
        ↓
[For Each Driver]
├─ build_driver_features()
├─ Fetch 20 recent races
├─ Calculate averages/trends
├─ Get team stats
├─ Get track affinity
└─ Create 17-feature vector
        ↓
[Feature Scaling]
scaler.transform([features])
(StandardScaler)
        ↓
[Model Inference]
model.predict(features)
→ predicted_finish_position
        ↓
[Confidence Calculation]
position_confidence
+ form_confidence
+ reliability_confidence
→ 0-100 score
        ↓
[Sort & Return]
Top 3 by position
+ confidence scores
        ↓
JSON Response
{podium: [...], confidence: 86.7}
```

## 📊 Model Architecture

### Random Forest Regressor

```
Input Features (17)
    ↓
[Decision Trees × 100]
├─ Tree 1: max_depth=15
├─ Tree 2: max_depth=15
├─ ...
└─ Tree 100: max_depth=15
    ↓
[Average Predictions]
(Regression: floating point position)
    ↓
Output
predicted_finish_position (1.0 - 20.0)
```

## 🐳 Docker Architecture

```
┌────────────────────────────────────────────────────┐
│              Docker Compose Network                │
│                  (f1-network)                      │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │  PostgreSQL Container                       │  │
│  │  ├─ Image: postgres:16-alpine              │  │
│  │  ├─ Port: 5432 (internal) → 5432 (host)  │  │
│  │  ├─ Volume: postgres_data                  │  │
│  │  └─ Env: DB_NAME, DB_USER, DB_PASSWORD   │  │
│  └─────────────────────────────────────────────┘  │
│           ↑                                        │
│           │ (SQL Connection String)               │
│           │                                        │
│  ┌─────────────────────────────────────────────┐  │
│  │  FastAPI Backend Container                  │  │
│  │  ├─ Image: python:3.11-slim                │  │
│  │  ├─ Port: 8000 (internal) → 8000 (host)  │  │
│  │  ├─ Volume: ./backend/models → /app/models│  │
│  │  ├─ Depends on: PostgreSQL (health check) │  │
│  │  └─ Runs: uvicorn app.main:app            │  │
│  └─────────────────────────────────────────────┘  │
│           ↑                                        │
│           │ (HTTP)                                │
│           │                                        │
│  ┌─────────────────────────────────────────────┐  │
│  │  (Optional) ML Trainer Container            │  │
│  │  ├─ Image: python:3.11-slim                │  │
│  │  ├─ Runs: train_model.py (one-shot)       │  │
│  │  ├─ Profile: manual-train (not auto-start)│  │
│  │  └─ Generates: f1_model.pkl, f1_scaler.pkl│  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
└────────────────────────────────────────────────────┘
        ↑
        │ (Exposed Ports)
        │
┌────────────────────────────────────────────────────┐
│            Host Machine / Internet                 │
├────────────────────────────────────────────────────┤
│  8000 → FastAPI (/docs, /api/...)                │
│  5432 → PostgreSQL (psql clients, tools)          │
└────────────────────────────────────────────────────┘
```

## 🔌 File Dependencies

```
prediction.py (Inference)
├─ Imports: FeatureEngineer (get_feature_columns)
├─ Uses: _feature_columns (MUST match training exactly)
├─ Loads: f1_model.pkl (trained RF)
├─ Loads: f1_scaler.pkl (fitted StandardScaler)
└─ Queries: PostgreSQL (race_results, drivers, teams)

train_model.py (Training)
├─ Imports: F1DataProcessor (data fetching)
├─ Imports: FeatureEngineer (feature creation)
├─ Creates: f1_model.pkl (fitted RF)
├─ Creates: f1_scaler.pkl (fitted Scaler)
└─ Queries: PostgreSQL (entire historical database)

schemas.py (API Contracts)
├─ Defines: RaceRequest, PodiumPrediction, RacePredictionResponse
├─ Defines: OvertakeProbability, OvertakePredictionResponse
└─ Used by: prediction.py routes

models.py (Database ORM)
├─ Defines: SQLAlchemy ORM models
├─ Tables: Driver, Team, Race, Race_Results, Circuit
└─ Used by: processor.py, prediction.py, other routes
```

## ⚡ Performance Characteristics

### Training (Offline)
```
Data Loading: 5-10s
Feature Engineering: 10-20s
Model Training: 30-60s
Evaluation: 5s
Serialization: 1-2s
─────────────────
Total: 50-120 seconds (depends on data size)
```

### Inference (Online)
```
Model Load: 500ms (first request only, cached)
DB Query (race): 10ms
DB Query (drivers): 20ms
Feature Engineering (×20 drivers): 100-200ms
Model Prediction (×20): 50-100ms
Response JSON: 10ms
─────────────────
Total: 1-2 seconds per request
```

### Bottleneck Analysis
```
🔴 Slowest: Database queries
✅ Fast: Model inference (RF with 15 depth is lightweight)
✅ Fast: Feature scaling and prediction
🟡 Medium: Feature engineering (recalculating per request)
```

## 🔐 Security & Robustness

### Input Validation
```
FastAPI Pydantic Models
├─ Type checking (season: int, round: int)
├─ Range validation (season > 0, round 1-24)
└─ Automatic HTTP 422 on invalid input
```

### Database Safety
```
SQLAlchemy ORM
├─ Parameterized queries (no SQL injection)
├─ Connection pooling
└─ Error handling with logging
```

### Error Handling
```
try/except blocks
├─ HTTPException (503 if model not found)
├─ HTTPException (404 if race not found)
├─ HTTPException (500 for processing errors)
└─ Detailed logging for debugging
```

### Data Integrity
```
Feature Column Consistency
├─ get_feature_columns() [17 features, exact order]
├─ Must match between training and inference
└─ Mismatch detected automatically (shape error)
```

---

**Architecture Version**: 1.0  
**Last Updated**: 2024  
**Framework**: FastAPI + SQLAlchemy + Scikit-learn  
**Deployment**: Docker Compose (PostgreSQL + Backend)
