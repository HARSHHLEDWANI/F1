# Quick Start Guide - F1 Race Predictor

## 🚀 One-Command Setup

### Windows
```batch
setup.bat
```

### macOS / Linux
```bash
chmod +x setup.sh
./setup.sh
```

Both scripts will guide you through the setup process interactively.

---

## 📋 Manual Setup

### Option 1: Docker (Recommended for Production)

**1. Clone and configure:**
```bash
cp .env.example .env
# Edit .env with your desired passwords
```

**2. Start all services:**
```bash
docker-compose up -d
```

**3. Wait for PostgreSQL to be ready:**
```bash
docker-compose exec postgres pg_isready -U f1admin
```

**4. Populate the database** (if first time):
```bash
# Run your F1 data initialization scripts
# This populates: drivers, teams, circuits, races, race_results
```

**5. Train the ML model:**
```bash
docker-compose run ml-trainer
```

This generates:
- `backend/models/f1_model.pkl` (Random Forest model)
- `backend/models/f1_scaler.pkl` (Feature scaler)

**6. Test the API:**
```bash
curl -X POST http://localhost:8000/api/predictions/podium \
  -H "Content-Type: application/json" \
  -d '{"season": 2026, "round": 5}'
```

**7. View the interactive API docs:**
```
http://localhost:8000/docs
```

---

### Option 2: Local Development

**1. Install Python 3.11+:**
```bash
python --version  # Should be >= 3.11
```

**2. Create virtual environment:**
```bash
python -m venv backend/venv
# Activate it
source backend/venv/bin/activate  # macOS/Linux
backend\venv\Scripts\activate      # Windows
```

**3. Install dependencies:**
```bash
pip install -r backend/requirements.txt
```

**4. Set up PostgreSQL locally** or use existing instance

**5. Train the model:**
```bash
python backend/train_model.py \
  --database-url "postgresql://user:password@localhost:5432/f1_db" \
  --output "backend/models/"
```

**6. Run the API:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The API will be available at: `http://localhost:8000`

---

## 🧪 Testing the ML Endpoints

### Get Podium Predictions

```bash
curl -X POST http://localhost:8000/api/predictions/podium \
  -H "Content-Type: application/json" \
  -d '{
    "season": 2026,
    "round": 5
  }'
```

**Response:**
```json
{
  "season": 2026,
  "round": 5,
  "circuit_name": "Circuit Name",
  "podium": [
    {
      "position": 1,
      "driver_name": "Max Verstappen",
      "constructor": "Red Bull Racing",
      "predicted_finish_position": 1.23,
      "confidence_score": 92.5,
      "form_index": 88
    },
    ...
  ],
  "overall_confidence": 86.7,
  "generated_at": "2024-01-15T14:30:45.123456"
}
```

### Get Overtake Probabilities

```bash
curl -X POST http://localhost:8000/api/predictions/overtake \
  -H "Content-Type: application/json" \
  -d '{
    "season": 2026,
    "round": 5
  }'
```

**Response:**
```json
{
  "season": 2026,
  "round": 5,
  "predictions": [
    {
      "driver_name": "Carlos Sainz",
      "grid_position": 8,
      "predicted_positions_gained": 4,
      "overtake_probability": 72,
      "expected_finish_position": 4
    },
    ...
  ],
  "generated_at": "2024-01-15T14:30:45.123456"
}
```

---

## 📊 What Gets Predicted

### 1. Podium Prediction `/api/predictions/podium`

**Predicts**: Top 3 finishing drivers (Positions 1, 2, 3)

**Output per driver**:
- `predicted_finish_position`: 1.0-20.0 (smoothed prediction)
- `confidence_score`: 0-100 (how certain we are)
- `form_index`: 0-100 (current performance state)

**Confidence = Formula**:
```
(position_confidence × 0.4) + 
(form_confidence × 0.4) + 
(reliability_confidence × 0.2)
```

### 2. Overtake Prediction `/api/predictions/overtake`

**Predicts**: Overtake opportunities for all drivers

**Output per driver**:
- `grid_position`: Starting position (1-20)
- `predicted_positions_gained`: How many places they'll gain
- `overtake_probability`: 0-100 chance of successful overtake
- `expected_finish_position`: Estimated final position

---

## 🔧 Common Commands

### View API Logs
```bash
# Docker
docker-compose logs -f backend

# Local
# Just watch the terminal where you ran `uvicorn ...`
```

### Train Model with Verbose Output
```bash
# Docker
docker-compose run ml-trainer

# Local
python backend/train_model.py \
  --database-url "postgresql://..." \
  --output "backend/models/" \
  --verbose
```

### Check Model Files
```bash
# See if model files exist
ls -la backend/models/

# Should show:
# f1_model.pkl
# f1_scaler.pkl
# f1_model_*.pkl (timestamped)
# f1_scaler_*.pkl (timestamped)
```

### Stop Docker Services
```bash
docker-compose down
```

### Rebuild Docker Images
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Access PostgreSQL
```bash
# Docker container
docker-compose exec postgres psql -U f1admin -d f1_db

# Or connect with a tool
# postgresql://f1admin:f1secure@localhost:5432/f1_db
```

---

## 🐛 Troubleshooting

### "Model not found" (503 error)
**Solution**: Train the model first
```bash
docker-compose run ml-trainer
# or
python backend/train_model.py --database-url "..." --output "backend/models/"
```

### "Cannot connect to database" (500 error)
**Solution**: Verify PostgreSQL is running and DATABASE_URL is correct
```bash
# Docker
docker-compose exec postgres pg_isready

# Check .env for correct credentials
cat .env | grep DATABASE_URL
```

### "Port 8000 already in use"
**Solution**: Change port in docker-compose.yml or use a different port
```bash
# Run on different port locally
uvicorn backend.app.main:app --port 8001
```

### "No such file or directory: 'backend/models/...'"
**Solution**: Create the models directory and train
```bash
mkdir -p backend/models
python backend/train_model.py --database-url "..." --output "backend/models/"
```

### Docker won't start
**Solution**: Check logs
```bash
docker-compose logs postgres
docker-compose logs backend
docker-compose up -d --no-deps postgres  # Restart just postgres
```

---

## 📁 Project Structure

```
d:\f1\
├── backend/
│   ├── ml/
│   │   ├── processor.py           # Data fetching
│   │   ├── feature_engineer.py    # Feature creation
│   │   └── __init__.py
│   ├── app/
│   │   ├── main.py                # FastAPI app
│   │   ├── models.py              # Database models
│   │   ├── schemas.py             # Pydantic models
│   │   ├── routes/
│   │   │   ├── prediction.py      # ML endpoints
│   │   │   ├── f1.py              # F1 data
│   │   │   └── profile.py         # User profiles
│   │   └── ...
│   ├── train_model.py             # Training script CLI
│   ├── models/                    # Generated ML models (after training)
│   ├── requirements.txt           # Python dependencies
│   ├── Dockerfile                 # Container definition
│   └── package.json
├── app/                           # Next.js frontend
├── docker-compose.yml             # Multi-container setup
├── .env.example                   # Environment template
├── .env                           # Your configuration (create from .env.example)
├── setup.sh / setup.bat           # Interactive setup script
├── QUICKSTART.md                  # This file
├── ML_PIPELINE_GUIDE.md           # Detailed ML documentation
└── README.md / PROJECT_README.md  # Project overview
```

---

## 🎯 Next Steps

1. **Run setup script**:
   - Windows: `setup.bat`
   - macOS/Linux: `./setup.sh`

2. **Choose your deployment**:
   - **Docker**: Easiest for production
   - **Local**: Better for development

3. **Populate database**:
   - Load F1 2026 season data (drivers, teams, circuits, races)
   - See your F1 data initialization scripts

4. **Train the model**:
   - Run the ML training script
   - Wait for model files to be generated

5. **Test the endpoints**:
   - Visit http://localhost:8000/docs for interactive API explorer
   - Or use curl commands above

6. **Deploy to production** (optional):
   - Push Docker image to registry
   - Set up health checks
   - Configure SSL/TLS
   - Set up database backups

---

## 📚 Learn More

- **ML Pipeline Details**: See [ML_PIPELINE_GUIDE.md](ML_PIPELINE_GUIDE.md)
- **API Specification**: Visit http://localhost:8000/docs (when running)
- **Feature Engineering**: Check [backend/ml/feature_engineer.py](backend/ml/feature_engineer.py)
- **Database Schema**: Check [backend/app/models.py](backend/app/models.py)

---

## 💡 Tips

- **Save time**: Use Docker for automatic setup with one command
- **Debug easily**: Access PostgreSQL directly via `psql` command
- **Monitor training**: ML training logs will show progress and metrics
- **API documentation**: FastAPI auto-generates OpenAPI docs at `/docs`
- **Production ready**: All code includes error handling and logging

---

**Status**: ✅ Ready to deploy
**Last Updated**: 2024
**Support**: See troubleshooting section or check logs
