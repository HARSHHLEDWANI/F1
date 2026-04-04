# F1 Predictor — Full Project Documentation

> Complete reference: architecture, files, APIs, data flow, and phase-by-phase changes.
> Last updated: 2026-04-05

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Frontend Files](#4-frontend-files)
5. [Backend Files](#5-backend-files)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [External APIs Used](#8-external-apis-used)
9. [ML Pipeline](#9-ml-pipeline)
10. [Data Pipeline Scripts](#10-data-pipeline-scripts)
11. [Docker & Deployment](#11-docker--deployment)
12. [Auth System](#12-auth-system)
13. [Phase 1 Changes — Race Data Fetching](#13-phase-1-changes--race-data-fetching)
14. [Known Issues & Pending Phases](#14-known-issues--pending-phases)
15. [Environment Variables](#15-environment-variables)

---

## 1. Project Overview

**F1 Predictor** is a full-stack Formula 1 web application that allows users to:

- Browse the F1 race calendar, drivers, teams, and circuits
- Make podium predictions for each race (P1/P2/P3)
- View ML-generated race predictions and win probabilities
- Explore live race data and driver standings
- Learn F1 history via a quiz system
- View 3D animations and simulations

The app is a monorepo with a **Next.js 14** frontend and a **FastAPI** Python backend, backed by a **PostgreSQL** database. F1 data is sourced from the **Jolpica-F1 API** (Ergast replacement) and cached in the database.

---

## 2. Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| 3D Graphics | Three.js + React Three Fiber + Drei |
| HTTP client | Native `fetch` API |
| Auth | JWT in `localStorage`, decoded with `jwt-decode` |
| Icons | Lucide React |

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Language | Python 3.11 |
| ORM | SQLAlchemy 2.0 |
| DB driver | psycopg2-binary |
| Auth | python-jose (JWT), passlib (bcrypt) |
| HTTP client | httpx (async + sync) |
| ML | scikit-learn, pandas, numpy |
| Server | Uvicorn |

### Infrastructure
| Component | Technology |
|---|---|
| Database | PostgreSQL 16 |
| Containerisation | Docker + Docker Compose |
| Frontend deployment | Vercel (`https://f1-theta-seven.vercel.app`) |
| Backend deployment | Render (`https://f1-fhh4.onrender.com`) |

---

## 3. Folder Structure

```
d:/f1/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (providers, navbar, globals)
│   ├── page.tsx                # Home / dashboard page
│   ├── providers.tsx           # React context providers
│   ├── auth/signin/page.tsx    # Login / signup page
│   ├── drivers/
│   │   ├── page.tsx            # Driver listing
│   │   └── [id]/page.tsx       # Driver detail page
│   ├── teams/page.tsx          # Constructor / team listing
│   ├── tracks/
│   │   ├── page.tsx            # Circuit listing
│   │   ├── SkeletonCard.tsx    # Track loading skeleton
│   │   └── [id]/page.tsx       # Circuit detail page
│   ├── prediction/page.tsx     # Race prediction hub (main feature)
│   ├── simulations/page.tsx    # Race simulation / overtake predictions
│   ├── learn/page.tsx          # F1 quiz / learning section
│   └── profile/page.tsx        # User profile & prediction history
│
├── components/                 # Shared React components
│   ├── navbar.tsx              # Top navigation bar
│   ├── GlowButton.tsx          # Styled CTA button with glow effect
│   ├── TiltCard.tsx            # 3D tilt hover card
│   ├── LiveLeaderboard.tsx     # Real-time race leaderboard widget
│   ├── SpeedCanvas.tsx         # Three.js canvas wrapper
│   ├── SpeedScene.tsx          # 3D speed animation scene
│   ├── DataSeedHint.tsx        # Dev hint component for seeding
│   ├── driver-comparison.tsx   # Side-by-side driver stats comparison
│   └── 3d/                     # Three.js scene components
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts              # JWT auth state (login, logout, user info)
│   ├── useF1Season.ts          # Season data (standings + races) from Jolpica API
│   ├── useLiveRace.ts          # Live race polling from backend
│   ├── useRaceCountdown.ts     # Countdown timer to next race
│   └── useUserTier.ts          # User plan/tier detection (FREE vs PRO)
│
├── lib/                        # Utility libraries
│   ├── api.ts                  # Generic apiFetch() wrapper (auth headers, error handling)
│   ├── f1api.ts                # Typed Jolpica + OpenF1 API helpers
│   └── wikipedia.ts            # Wikipedia API for driver/track descriptions
│
├── types/                      # Global TypeScript type definitions
│
├── public/                     # Static assets (images, icons)
│
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app, startup, CORS, auth routes
│   │   ├── database.py         # SQLAlchemy engine + session factory
│   │   ├── models.py           # All ORM models (DB tables)
│   │   ├── schemas.py          # Pydantic request/response schemas
│   │   ├── auth.py             # Password hashing + JWT creation
│   │   ├── dependencies.py     # get_current_user dependency
│   │   ├── config.py           # App configuration
│   │   ├── seed.py             # DB seeding (runs on startup, idempotent)
│   │   ├── routes/
│   │   │   ├── f1.py           # /races, /drivers, /teams, /tracks, /live-race
│   │   │   ├── prediction.py   # /predictions/podium, /overtake, /win-probabilities
│   │   │   └── profile.py      # /profile routes
│   │   └── services/
│   │       ├── f1_fetcher.py   # Async Jolpica API service layer
│   │       └── ml_client.py    # HTTP client for external ML microservice
│   │
│   ├── ml/                     # ML feature engineering modules
│   │   ├── __init__.py
│   │   ├── feature_engineer.py # FeatureEngineer class — creates training features
│   │   └── processor.py        # F1DataProcessor — loads raw DB data into DataFrames
│   │
│   ├── models/                 # Saved ML model artifacts
│   │   ├── f1_model.pkl        # Trained RandomForest model
│   │   └── f1_scaler.pkl       # StandardScaler fitted on training data
│   │
│   ├── data_pipeline/          # One-time data loading scripts
│   │   ├── fetch_race_results.py    # Fetch race results from Jolpica → JSON
│   │   ├── fetch_constructors.py    # Fetch constructor data from Jolpica → JSON
│   │   ├── fetch_metadata.py        # Fetch circuits/drivers metadata → JSON
│   │   ├── load_race_results.py     # Load JSON into race_results table
│   │   ├── load_metadata.py         # Load JSON into drivers/circuits/constructors
│   │   ├── assign_driver_teams.py   # Set team field on drivers table
│   │   ├── db.py                    # Shared DB connection for pipeline scripts
│   │   └── test_jolpica.py          # Quick API connectivity test
│   │
│   ├── train_model.py          # Offline model training script (RandomForest)
│   ├── calculate_ratings.py    # Compute driver rating scores from results
│   ├── populate_driver_stats.py     # Fill wins/podiums/poles from race_results
│   ├── populate_driver_images.py    # Set image_url for drivers
│   ├── populate_teams.py            # Populate constructors table
│   ├── populate_circuit_stats.py    # Fill circuit metadata
│   ├── populate_track_stats.py      # Fill track difficulty/DRS/lap records
│   ├── populate_comprehensive_track_stats.py  # Full track stats
│   ├── populate_track_images.py     # Set image_url for circuits
│   ├── migrate_drivers.py           # Schema migration helpers
│   ├── migrate_circuits.py          # Schema migration helpers
│   ├── requirements.txt             # Python dependencies
│   └── Dockerfile                   # Backend Docker image
│
├── docker-compose.yml          # PostgreSQL + backend + optional ml-trainer
├── next.config.mjs             # Next.js config
├── package.json                # Frontend npm dependencies
├── tsconfig.json               # TypeScript config
└── pnpm-workspace.yaml         # pnpm workspace
```

---

## 4. Frontend Files

### `app/page.tsx` — Home Page
The main dashboard. Displays:
- Season standings (drivers + constructors) via `useF1Season` hook
- Live race widget via `useLiveRace` hook
- Countdown to next race via `useRaceCountdown` hook
- Featured race cards
- Entry points to prediction, learn, simulation pages

### `app/prediction/page.tsx` — Prediction Hub
The core feature page. Contains:
- Season selector (2021–2026)
- Race calendar sidebar: fetches `/races?year={season}` from backend API
- Driver selector for P1/P2/P3 picks
- ML podium prediction display (calls `/predictions/podium` POST)
- Win probability chart (calls `/predictions/win-probabilities`)
- Submit prediction form (calls `/predict` POST)
- Loading skeletons for race cards and predictions

**Key state:**
```typescript
const [season, setSeason] = useState(2024);
const [races, setRaces] = useState<RaceInfo[]>([]);
const [racesLoading, setRacesLoading] = useState(false);
const [selectedRace, setSelectedRace] = useState<RaceInfo | null>(null);
```

**Key helpers:**
- `COUNTRY_FLAGS` — emoji flag lookup by country name
- `getRaceFlag(country, raceName)` — returns flag emoji with fallback
- `formatRaceDate(isoDate)` — converts `"2024-03-02"` → `"Mar 2"`

### `app/drivers/page.tsx` — Driver Listing
Fetches all drivers from `/drivers` endpoint. Shows grid of driver cards with stats (rating, wins, championships). Uses `TiltCard` for hover effect.

### `app/drivers/[id]/page.tsx` — Driver Detail
Dynamic route. Fetches driver by ID from `/drivers`, enriches with Wikipedia description. Shows full stats, team, nationality, career numbers.

### `app/teams/page.tsx` — Constructor Listing
Fetches from `/teams`. Displays team cards with nationality, colours.

### `app/tracks/page.tsx` — Circuit Listing
Fetches from `/tracks`. Grid of circuit cards with country, lap record, difficulty.

### `app/tracks/[id]/page.tsx` — Circuit Detail
Full circuit info including map, lap distance, DRS zones, track type.

### `app/learn/page.tsx` — Quiz Page
Multiple-choice F1 quiz. Questions are currently partially hardcoded. Tracks score per session.

### `app/simulations/page.tsx` — Simulations
Calls `/predictions/overtake` POST to show overtake probabilities. Also shows 3D speed animation via `SpeedCanvas`.

### `app/profile/page.tsx` — User Profile
Shows logged-in user's prediction history, accuracy, favorite team/driver. Calls `/prediction-history` and `/f1/me`.

### `app/auth/signin/page.tsx` — Auth Page
Login and signup forms. Posts to `/login` (OAuth2 form) and `/signup` (JSON). Saves JWT to `localStorage`.

---

## 5. Backend Files

### `backend/app/main.py`
- Creates FastAPI app instance
- Registers CORS middleware (allows `localhost:3000`, `localhost:3001`, Vercel URL)
- On startup: runs `models.Base.metadata.create_all()` then `seed_all()`
- Registers routers: `f1.router`, `profile.router`, `prediction.router`
- Direct routes: `POST /signup`, `POST /login`, `GET /seed`, `POST /predict`, `POST /calculate-results`, `GET /prediction-history`

### `backend/app/database.py`
- Reads `DATABASE_URL` from `.env`
- Creates SQLAlchemy `engine` and `SessionLocal`
- Exports `get_db()` dependency for FastAPI

### `backend/app/auth.py`
- Uses `passlib` with bcrypt for password hashing (passwords truncated to 72 chars — bcrypt limit)
- Uses `python-jose` to create/verify JWT tokens
- Config: `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` from env

### `backend/app/models.py`
All SQLAlchemy ORM models:

| Model | Table | Purpose |
|---|---|---|
| `User` | `users` | Auth + plan + prediction quota |
| `Race` | `races` | Legacy race table (unused in new flow) |
| `Driver` | `drivers` | Driver profiles with stats |
| `Team` | `constructors` | Constructor data |
| `Circuit` | `circuits` | Circuit metadata |
| `Race_Results` | `race_results` | Historical race result rows |
| `RaceSchedule` | `race_schedule` | Season schedule cache from Jolpica |
| `Prediction` | `predictions` | User podium predictions |

### `backend/app/schemas.py`
Pydantic models for request/response validation:
- `UserCreate`, `UserLogin`, `UserResponse`
- `Driver`, `Team`, `Circuit`
- `Race`, `RaceRequest`
- `PodiumPrediction`, `RacePredictionResponse`
- `OvertakeProbability`, `OvertakePredictionResponse`
- `PredictionCreate`, `UpdatePreferences`

### `backend/app/seed.py`
Idempotent seeding on every cold start. Steps:
1. Skip if `drivers` table already has data
2. Seed drivers from `drivers.json` (static file)
3. Seed constructors from `teams.json`
4. Seed circuits from `circuits.json`
5. **Seed `race_schedule` table**: tries Jolpica API first; falls back to hardcoded 24-race 2024 schedule
6. **Seed `race_results` table**: tries Jolpica API first; falls back to static `RACE_2024` data
7. Skips each step if data already exists (idempotent)

### `backend/app/routes/f1.py`
Handles core F1 data endpoints:

**`GET /races?year={year}`** — 3-tier fallback:
1. Query `race_schedule` table
2. Fetch live from Jolpica → cache to `race_schedule`
3. Fallback: distinct rounds from `race_results`

**`GET /drivers`** — Returns all drivers from DB

**`GET /teams`** — Returns all constructors from DB

**`GET /tracks`** — Returns all circuits from DB

**`GET /me`** — Returns current user (auth required)

**`GET /live-race`** — Returns most recent race results simulated as "live"

### `backend/app/routes/prediction.py`
ML-powered prediction endpoints:

**`POST /predictions/podium`** (body: `{season, round}`)
- Loads trained RandomForest model from `models/f1_model.pkl`
- Builds 17-feature vector per driver
- Returns top 3 predicted finishers with confidence scores
- Returns 503 if model not trained yet

**`POST /predictions/overtake`** (body: `{season, round}`)
- Same model; calculates predicted positions gained from grid
- Returns overtake probability per driver

**`GET /predictions/win-probabilities?season=&round=`**
- If model available: uses ML predicted position to compute win probability
- If no model: statistical fallback using win rate + driver rating
- Normalises probabilities to sum to 1.0

### `backend/app/services/f1_fetcher.py`
Async service for all Jolpica API calls. Uses `httpx.AsyncClient`.

```python
async def fetch_season_races(year: int) -> list[dict]
async def fetch_race_results(year: int, round_num: int) -> list[dict]
async def fetch_driver_standings(year: int) -> list[dict]
async def fetch_constructor_standings(year: int) -> list[dict]
async def fetch_next_race() -> Optional[dict]
```

Each function parses the Jolpica `MRData` JSON structure and returns clean flat dicts.

### `backend/app/services/ml_client.py`
HTTP client stub for an optional external ML microservice on port 8001. Currently unused in production — the prediction logic is inline in `routes/prediction.py`.

---

## 6. Database Schema

### `users`
```sql
id              SERIAL PRIMARY KEY
email           VARCHAR UNIQUE NOT NULL
hashed_password VARCHAR NOT NULL
is_pro          BOOLEAN DEFAULT FALSE
predictions_today INTEGER DEFAULT 0
last_prediction_date DATE
plan            VARCHAR DEFAULT 'FREE'
favorite_team   VARCHAR
favorite_driver VARCHAR
name            VARCHAR
```

### `drivers`
```sql
id              SERIAL PRIMARY KEY
given_name      VARCHAR
family_name     VARCHAR
nationality     VARCHAR
image_url       VARCHAR
number          INTEGER
team            VARCHAR
championships   INTEGER DEFAULT 0
wins            INTEGER DEFAULT 0
podiums         INTEGER DEFAULT 0
poles           INTEGER DEFAULT 0
points_total    INTEGER DEFAULT 0
rating          INTEGER DEFAULT 0
```

### `constructors`
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR
nationality     VARCHAR
```

### `circuits`
```sql
id              SERIAL PRIMARY KEY
circuit_ref     VARCHAR
name            VARCHAR
locality        VARCHAR
country         VARCHAR
lat             FLOAT
lng             FLOAT
lap_distance    FLOAT
laps            INTEGER
lap_record_time VARCHAR
lap_record_holder VARCHAR
lap_record_year INTEGER
track_type      VARCHAR        -- "street" or "permanent"
drs_zones       INTEGER DEFAULT 0
image_url       VARCHAR
difficulty      INTEGER DEFAULT 50  -- 0-100
```

### `race_results`
```sql
id              SERIAL PRIMARY KEY
season          INTEGER NOT NULL
round           INTEGER NOT NULL
race_name       VARCHAR NOT NULL
driver_ref      VARCHAR NOT NULL    -- e.g. "max_verstappen"
constructor_ref VARCHAR NOT NULL    -- e.g. "red_bull"
grid            INTEGER
position        INTEGER
points          FLOAT DEFAULT 0
status          VARCHAR             -- "Finished", "DNF", etc.
laps            INTEGER
time            VARCHAR             -- race time string
```

### `race_schedule`
```sql
id              SERIAL PRIMARY KEY
season          INTEGER NOT NULL (indexed)
round           INTEGER NOT NULL
race_name       VARCHAR NOT NULL
date            VARCHAR             -- "YYYY-MM-DD"
time            VARCHAR             -- "HH:MM:SSZ" UTC
circuit_id      VARCHAR
circuit_name    VARCHAR
locality        VARCHAR
country         VARCHAR
lat             FLOAT
lng             FLOAT
```

### `predictions`
```sql
id              SERIAL PRIMARY KEY
user_id         INTEGER FK→users.id
season          INTEGER NOT NULL
round           INTEGER NOT NULL
predicted_p1    VARCHAR(50)
predicted_p2    VARCHAR(50)
predicted_p3    VARCHAR(50)
score           INTEGER DEFAULT 0
created_at      DATETIME DEFAULT now()
```

### `races` (legacy)
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR NOT NULL
race_date       DATE NOT NULL
winner          VARCHAR
highlights      VARCHAR
```

---

## 7. API Endpoints

### Auth (no prefix)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Create account |
| POST | `/login` | No | OAuth2 token login |
| POST | `/predict` | Yes | Save user prediction |
| POST | `/calculate-results` | No | Score all predictions for a race |
| GET | `/prediction-history` | Yes | User's prediction accuracy stats |
| GET | `/seed?secret=harsh123` | No | Manual seed trigger |
| GET | `/debug/drivers-count` | No | Dev debug endpoint |

### F1 Data (no prefix)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/races?year={year}` | No | Race schedule for season |
| GET | `/drivers` | No | All drivers |
| GET | `/teams` | No | All constructors |
| GET | `/tracks` | No | All circuits |
| GET | `/me` | Yes | Current user |
| GET | `/live-race` | No | Most recent race results |

### Predictions (`/predictions`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/predictions/podium` | No | ML podium prediction |
| POST | `/predictions/overtake` | No | Overtake probability |
| GET | `/predictions/win-probabilities?season=&round=` | No | Win probability for all drivers |

---

## 8. External APIs Used

### Jolpica-F1 API (Primary F1 data source)
- **Base URL**: `https://api.jolpi.ca/ergast/f1`
- **What it is**: Community-maintained drop-in replacement for the defunct Ergast API (shut down late 2024). Same URL structure, same MRData JSON format.
- **Used for**: Season schedules, race results, driver/constructor standings
- **Key paths**:
  - `/{year}/races.json?limit=30` — season race calendar
  - `/{year}/{round}/results.json` — race results
  - `/{year}/driverStandings.json` — driver championship standings
  - `/{year}/constructorStandings.json` — constructor standings
  - `/current/next.json` — next upcoming race

### OpenF1 API (Live telemetry)
- **Base URL**: `https://api.openf1.org/v1`
- **Used for**: Live timing, session status, driver list, positions
- **Key paths**:
  - `/laps?session_key=latest`
  - `/session_status?session_key=latest`
  - `/drivers?session_key=latest`
  - `/position?session_key=latest`

### Wikipedia API
- Used in `lib/wikipedia.ts` to fetch driver and circuit descriptions/summaries for detail pages.

---

## 9. ML Pipeline

### Overview
The ML system uses a **RandomForest Regressor** to predict the finishing position of each driver in a given race. The model is trained offline and loaded lazily at runtime.

### Feature Vector (17 features)
| Feature | Description |
|---|---|
| `grid_position` | Qualifying / starting grid position |
| `driver_avg_position` | Rolling average finishing position (last 20 races) |
| `driver_position_trend` | Recent avg vs overall avg (positive = improving) |
| `driver_points_std` | Points consistency (std dev) |
| `driver_podiums_10races` | Points-scoring races in last 10 |
| `driver_dnf_rate` | DNF / retirement rate |
| `constructor_reliability` | 1 - DNF rate for the constructor |
| `constructor_avg_position` | Constructor average finishing position |
| `constructor_avg_points` | Constructor average points |
| `constructor_recent_points` | Constructor last 5 races average points |
| `track_affinity_position` | Driver's historical average position at this circuit |
| `track_affinity_podium_rate` | Driver's points-finish rate at this circuit |
| `track_difficulty` | Average finishing position across all drivers at circuit |
| `track_experience` | Number of times driver has raced at circuit |
| `driver_overtake_ability` | Average grid-to-finish position change |
| `constructor_overtake_power` | Team average position gain |
| `driver_form_index` | 0–100 composite form score (60% points, 40% position) |

### Training (`train_model.py`)
```
python backend/train_model.py --database-url "postgresql://..." --output models/
```
- Uses `F1DataProcessor` to load race results from DB into pandas DataFrame
- Uses `FeatureEngineer` to create all 17 features
- Trains `RandomForestRegressor(n_estimators=100, random_state=42)`
- Saves model to `backend/models/f1_model.pkl` and scaler to `f1_scaler.pkl`
- Also saves timestamped copies: `f1_model_YYYYMMDD_HHMMSS.pkl`

### Prediction flow (`routes/prediction.py`)
1. Load model from disk (lazy, cached in memory)
2. For each driver in the requested race, call `build_driver_features()`
3. Scale features with saved `StandardScaler`
4. Run `model.predict()` → predicted finishing position (clamped 1–20)
5. Sort by predicted position → top 3 = podium
6. Calculate confidence via `calculate_confidence_score()`

### Fallback
If `f1_model.pkl` does not exist (model not yet trained), all prediction endpoints return either:
- HTTP 503 for `/predictions/podium` and `/predictions/overtake`
- Statistical fallback (win rate + driver rating) for `/predictions/win-probabilities`

---

## 10. Data Pipeline Scripts

These are one-time or periodic scripts run manually to populate/update the database:

| Script | Purpose |
|---|---|
| `data_pipeline/fetch_race_results.py` | Pull race results from Jolpica → save to `race_results.json` |
| `data_pipeline/fetch_constructors.py` | Pull constructors → `teams.json` |
| `data_pipeline/fetch_metadata.py` | Pull circuits + drivers → `circuits.json`, `drivers.json` |
| `data_pipeline/load_race_results.py` | Insert `race_results.json` into DB |
| `data_pipeline/load_metadata.py` | Insert metadata JSONs into DB |
| `data_pipeline/assign_driver_teams.py` | Set `drivers.team` from latest race results |
| `data_pipeline/test_jolpica.py` | Quick API connectivity test |
| `populate_driver_stats.py` | Recalculate wins/podiums/poles for all drivers from `race_results` |
| `populate_driver_images.py` | Set `image_url` for each driver |
| `calculate_ratings.py` | Compute 0–100 rating score for each driver |
| `populate_teams.py` | Populate `constructors` table |
| `populate_circuit_stats.py` | Basic circuit metadata fill |
| `populate_track_stats.py` | Fill lap records, DRS zones, difficulty |
| `populate_comprehensive_track_stats.py` | Full track data including track type |
| `populate_track_images.py` | Set `image_url` for circuits |
| `migrate_drivers.py` | Schema migration helpers for drivers table |
| `migrate_circuits.py` | Schema migration helpers for circuits table |

---

## 11. Docker & Deployment

### `docker-compose.yml`
Three services:

**`postgres`** — PostgreSQL 16 Alpine
- Port: `5432` (configurable via `DB_PORT`)
- Volume: `postgres_data` (persistent)
- Health check: `pg_isready`

**`backend`** — FastAPI app
- Port: `8000` (configurable via `API_PORT`)
- Depends on postgres being healthy
- Mounts `./backend/models` and `./backend/logs`
- Restarts unless stopped

**`ml-trainer`** — One-shot training container (profile: `manual-train`)
- Run with: `docker-compose run ml-trainer`
- Runs `train_model.py` then exits

### Running locally
```bash
# Start database + backend
docker-compose up -d postgres backend

# Frontend
npm run dev        # or: pnpm dev
```

### Production
- **Frontend**: Deployed to Vercel at `https://f1-theta-seven.vercel.app`
- **Backend**: Deployed to Render at `https://f1-fhh4.onrender.com`
- CORS is configured to allow both origins

---

## 12. Auth System

### Flow
1. User POSTs to `/signup` with `{email, password}` → password bcrypt-hashed → stored in `users` table
2. User POSTs to `/login` with OAuth2 form (`username` = email, `password`) → receives `access_token` (JWT)
3. Frontend stores JWT in `localStorage` via `useAuth` hook
4. All authenticated requests include `Authorization: Bearer <token>` header
5. Backend decodes JWT via `get_current_user` dependency → returns `User` model

### Prediction limits
- `FREE` plan: 3 predictions per day
- `PRO` plan: 25 predictions per day
- Counter resets at midnight (by comparing `last_prediction_date` to today)

### JWT Config (from env)
```
SECRET_KEY=<random secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  (24 hours)
```

---

## 13. Phase 1 Changes — Race Data Fetching

These are the changes made in Phase 1 of the planned refactor/upgrade work:

### Problem
- `lib/f1api.ts` was calling `https://ergast.com/api/f1` — **this API was permanently shut down in late 2024**
- The prediction page had a hardcoded `RACES_2024` array (24 races) and `RACES_BY_SEASON` that mapped every year to the same 2024 data
- Changing the season year in the UI had no effect on the race list shown
- The `MOCK_RACES` fallback in `useF1Season.ts` only had 3 races (Bahrain, Saudi, Australia)

### Files Changed

#### `lib/f1api.ts`
- Changed `ERGAST_BASE` from `https://ergast.com/api/f1` → `https://api.jolpi.ca/ergast/f1`
- All API helper functions now use Jolpica (same URL structure, maintained drop-in replacement)

#### `hooks/useF1Season.ts`
- Expanded `MOCK_RACES` from 3 entries → all 24 rounds of the 2024 season
- Full offline fallback with correct circuit names, locations, dates

#### `backend/app/services/f1_fetcher.py` *(new file)*
- Created async Python service for Jolpica API calls
- Functions: `fetch_season_races`, `fetch_race_results`, `fetch_driver_standings`, `fetch_constructor_standings`, `fetch_next_race`
- Uses `httpx.AsyncClient` for connection reuse

#### `backend/app/models.py`
- Added `RaceSchedule` model and `race_schedule` table to cache season schedules

#### `backend/app/schemas.py`
- Updated `Race` Pydantic schema to include `date`, `circuit_name`, `country` optional fields

#### `backend/app/routes/f1.py`
- Rewrote `GET /races` endpoint with `?year=` query param
- Implemented 3-tier fallback: `race_schedule` DB cache → Jolpica live fetch → `race_results` distinct rounds

#### `backend/app/seed.py`
- Added `httpx` import and `_fetch_jolpica()` sync helper
- Added `RaceSchedule` seeding step (Step 4): tries Jolpica, falls back to hardcoded 2024 schedule
- Updated `race_results` seeding (Step 5): tries Jolpica first, falls back to static data
- Added `httpx==0.27.0` to `requirements.txt`

#### `backend/requirements.txt`
- Added `httpx==0.27.0`

#### `app/prediction/page.tsx`
- **Removed**: `RACES_2024` hardcoded array, `RACES_BY_SEASON` map
- **Added**: `COUNTRY_FLAGS` emoji lookup, `getRaceFlag()`, `formatRaceDate()`, `RaceInfo` interface
- **Added**: `races` and `racesLoading` state
- **Added**: `useEffect` that fetches `/races?year=${season}` when season changes, with cancellation via `AbortController`
- **Updated**: Race calendar renders 8 skeleton cards while loading, then real data
- **Updated**: `selectedRace?.name` → `selectedRace?.race_name` throughout
- **Updated**: `selectedRace?.flag` → `getRaceFlag(selectedRace?.country, selectedRace?.race_name)`
- **Updated**: `"24 rounds"` hardcode → `{racesLoading ? "…" : races.length} rounds`

---

## 14. Known Issues & Pending Phases

### Phase 2 (Pending) — Fix Year + State Bug
- Changing the season year does NOT update the prediction shown
- `POST /predictions/podium` is called with `{season, round}` but the prediction page may not pass the correct season/round values
- Need to verify: when user changes season, does the podium prediction re-fetch with the new season?

### Phase 3 (Pending) — Real ML Prediction System
- Current model is trained but may be stale (last trained: 2026-03-21)
- Need to add more recent 2025/2026 race data to improve accuracy
- `build_driver_features()` uses `driver_ref` matching via family name string — fragile, should use a proper ID join
- The `constructor_ref` lookup in `predict_podium` uses `ilike` string matching which may fail for edge cases

### Phase 4 (Pending) — Quiz System Upgrade
- `app/learn/page.tsx` questions are partially hardcoded
- Need: 50–100+ questions, categories (Drivers/Teams/Tracks/History), difficulty levels, score tracking

### Phase 5 (Pending) — Automated Data Updates
- No scheduled job to refresh race results after each Grand Prix
- Consider: APScheduler in FastAPI, or a GitHub Actions cron, or Docker cron service
- The `race_schedule` table is seeded once on startup; if a mid-season race is added it won't auto-update

### Other Known Issues
- `routes/prediction.py:overtake` endpoint references `models.Race` (the legacy table, not `RaceSchedule`) — the overtake endpoint likely returns 404 for most requests
- `ml_client.py` references `localhost:8001` ML microservice that does not exist; it's unused
- `/debug/drivers-count` endpoint is exposed publicly (no auth)
- `GET /seed?secret=harsh123` has a hardcoded secret in source code

---

## 15. Environment Variables

### Backend (`.env` in `backend/`)
```env
DATABASE_URL=postgresql://f1admin:f1secure@localhost:5432/f1_db
SECRET_KEY=<random 32+ char secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Frontend (`.env.local` in root)
```env
NEXT_PUBLIC_API_BASE_URL=https://f1-fhh4.onrender.com
# or for local dev:
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Docker Compose (optional overrides)
```env
DB_NAME=f1_db
DB_USER=f1admin
DB_PASSWORD=f1secure
DB_PORT=5432
API_PORT=8000
```
