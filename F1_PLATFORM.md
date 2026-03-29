# F1 Predictor — Platform Documentation

> **Version:** 2.0 · **Updated:** March 2026
> AI-powered Formula 1 learning & prediction platform

---

## Project Overview

F1 Predictor is a full-stack web application that combines:
- **Educational content** (Learn F1 + interactive simulations) for beginners
- **AI-powered predictions** using a Random Forest ML model
- **Telemetry-style dashboards** for driver, team, and circuit data
- **Immersive UI** with speed animations, 3D effects, and F1-brand aesthetics

The goal: make Formula 1 accessible to newcomers while giving enthusiasts deep analytics tools.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) | React 19 framework with SSR/RSC |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **Animation** | Framer Motion 12 | Page transitions, micro-interactions, springs |
| **3D (Canvas)** | Vanilla Canvas API | `SpeedCanvas` — zero-dependency streaks |
| **3D (WebGL)** | React Three Fiber + Three.js | `SpeedScene` — warp particle field |
| **Icons** | Lucide React | SVG icon library |
| **Backend** | FastAPI (Python) | REST API, authentication, predictions |
| **Database** | PostgreSQL + SQLAlchemy | Drivers, teams, circuits, race results |
| **ML** | scikit-learn (Random Forest) | Podium predictions — 17 engineered features |
| **Auth** | JWT + bcrypt | Secure user sessions |
| **Hosting** | Render (backend) + Vercel (frontend) | Production deployment |

---

## Folder Structure

```
d:/f1/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (Navbar + providers)
│   ├── globals.css               # Design tokens, utility classes, animations
│   ├── page.tsx                  # Homepage (hero + standings + bento + CTA)
│   ├── learn/
│   │   └── page.tsx              # 7-module F1 learning system (accordion)
│   ├── simulations/
│   │   └── page.tsx              # 4 interactive simulators
│   ├── drivers/
│   │   ├── page.tsx              # Driver grid (20 cards with ratings)
│   │   └── [id]/page.tsx         # Individual driver telemetry
│   ├── teams/
│   │   └── page.tsx              # 10 constructor cards
│   ├── tracks/
│   │   ├── page.tsx              # 24 circuit cards
│   │   └── [id]/page.tsx         # Circuit detail
│   ├── prediction/
│   │   └── page.tsx              # AI podium predictor
│   ├── profile/
│   │   └── page.tsx              # User stats & preferences
│   ├── auth/
│   │   └── signin/page.tsx       # Login / Register
│   └── providers.tsx             # Client-side context providers
│
├── components/                   # Reusable UI components
│   ├── navbar.tsx                # Floating navbar + race ticker
│   ├── SpeedCanvas.tsx           # Vanilla canvas speed streaks (no deps)
│   ├── SpeedScene.tsx            # React Three Fiber 3D warp background
│   ├── TiltCard.tsx              # CSS-3D tilt-on-hover card
│   ├── GlowButton.tsx            # Animated red/white/outline button
│   ├── DataSeedHint.tsx          # Empty state when DB not seeded
│   └── driver-comparison.tsx     # Driver stat comparison widget
│
├── hooks/
│   ├── useAuth.ts                # Auth guard — redirects if no token
│   └── useUserTier.ts            # Fetch FREE/PRO plan from /profile
│
├── lib/
│   └── api.ts                    # apiFetch() — handles JWT, base URL, errors
│
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app — routes, startup, CORS
│   │   ├── models.py             # SQLAlchemy ORM models
│   │   ├── schemas.py            # Pydantic validation schemas
│   │   ├── seed.py               # Idempotent DB seeder (20 drivers, 10 teams, 24 circuits, 480 race results)
│   │   ├── database.py           # DB connection + session factory
│   │   ├── auth.py               # bcrypt + JWT helpers
│   │   └── dependencies.py       # get_current_user() JWT validator
│   ├── routes/
│   │   ├── f1.py                 # /drivers /teams /tracks /races endpoints
│   │   ├── profile.py            # /profile /update-preferences
│   │   └── prediction.py         # /predictions/podium /predictions/overtake
│   ├── ml/
│   │   ├── processor.py          # Feature engineering from race_results
│   │   └── feature_engineer.py   # 17-feature builder
│   └── train_model.py            # Train + save Random Forest model
│
└── F1_PLATFORM.md                # This file
```

---

## Feature Breakdown

### 1. Navbar System (`components/navbar.tsx`)

**Architecture:**
```
<RaceTicker />                   ← Scrolling red strip with live race info
<FloatingNav>
  Logo → /
  Links: Learn F1 | Sims | Teams | Drivers | Tracks | Predictions
  User section: email + tier badge + logout
  Mobile: slide-in drawer with staggered links
</FloatingNav>
```

**Key animations:**
- `layoutId="nav-indicator"` → Framer Motion shared layout for the active tab racing-line
- Ticker uses `animation: ticker 28s linear infinite` CSS keyframe (no JS, zero reflow)
- Logo rotates on hover via `whileHover={{ rotate: 0 }}`
- Nav shrinks on scroll via `scrollYProgress` → `paddingTop/paddingBottom`

---

### 2. Homepage (`app/page.tsx`)

**Sections (top to bottom):**

| Section | Key Feature |
|---|---|
| **Hero** | `SpeedCanvas` bg + `AnimatedTitle` (char-by-char spring) + 3 CTAs |
| **Dashboard** | Animated standings bars + live race countdown timer |
| **Feature Grid** | 6 `TiltCard` feature cards with CSS-3D tilt + racing-line hover |
| **Stats** | `Counter` component — counts up on scroll intersection |
| **Learn CTA** | Carbon-fiber banner with gradient glow |

**Scroll storytelling:** `useScroll` + `useTransform` on the hero section — title fades and translates as you scroll into the dashboard.

---

### 3. 3D System

#### `SpeedCanvas.tsx` — Canvas (zero dependencies)
- Vanilla `<canvas>` with `requestAnimationFrame`
- Draws 80 light streaks (configurable with `intensity` prop)
- Each streak: `createLinearGradient` from transparent → red → white
- Streaks move left at variable speeds, recycled when off-screen
- **Performance:** all drawing in rAF, `clearRect` each frame — ~0.1ms per frame

#### `SpeedScene.tsx` — React Three Fiber (requires `npm install`)
- 2000 particle warp field using `<Points>` + `<PointMaterial>`
- 60 instanced stream lines moving toward camera
- Camera: `position={[0,0,3]}` with `dpr={[1, 1.5]}` cap
- `frameloop="always"` + `alpha: true` for transparent overlay
- **To activate:** import in `app/layout.tsx` or any page

---

### 4. Simulations (`app/simulations/page.tsx`)

Four self-contained interactive components, selected via animated tab bar:

#### Flag Quiz
- 6 flags in sequence (green, yellow, red, chequered, blue, B&Y)
- Multiple-choice answers with animated correct/wrong states
- Tip reveals after each answer
- Score counter + completion screen
- Auto-advances to next flag

#### Points Calculator
- Range slider (P1 → P20)
- Animated speedometer-style points bar
- Context description for each position
- Quick-select grid for P1–P10
- Spring-animated number transition

#### Pit Stop Challenge
- 3-phase game: `idle → entering → go`
- Car animates into pit box from right
- Green light flashes at random delay (1.5–4s)
- Measures reaction time in milliseconds
- Rating system: "World Record Speed" → "Keep practicing"
- Too-early penalty detection

#### DRS Effect Demo
- SVG top-down F1 car with animated rear wing
- Wing opens/closes with `motion.rect` animate
- Real-time speed simulation: 280 → 335 km/h
- SVG speedometer with animated needle + arc
- Animated speed streaks that intensify when DRS on

---

### 5. Learn F1 System (`app/learn/page.tsx`)

7 accordion modules:

| # | Module | Key Content |
|---|---|---|
| 1 | What is F1? | Stats grid, speed facts, analogy |
| 2 | Race Weekend | Fri/Sat/Sun breakdown with badges |
| 3 | Teams & Drivers | 6 team cards + Driver vs Constructor explanation |
| 4 | Points System | Full 1-10 grid + fastest lap rule |
| 5 | F1 Flags | 8 flags with emoji + explanation |
| 6 | Pit Stops | 6-step breakdown + tyre compound cards |
| 7 | DRS | Open/closed comparison + rules checklist |

**Progress system:**
- `Set<string>` tracks opened modules
- Red progress bar fills as you complete modules
- "Got it" button auto-advances to next module
- Completion card with 🏆 and link to `/prediction`

---

### 6. Data Seeding (`backend/app/seed.py`)

Auto-runs on every Render restart via `@app.on_event("startup")`.

**Idempotency check:**
```python
if db.query(models.Driver).count() >= 20:
    print("Already seeded — skipping")
    return
```

**What gets seeded:**
- 20 drivers (full stats + F1 image URLs)
- 10 constructor teams
- 24 circuits (full 2024 calendar — lap records, DRS zones, difficulty)
- 480 race result rows (all 24 rounds × 20 drivers, 2024 season)

**Manual trigger (no shell access needed):**
```
GET /seed?secret=harsh123
```

---

## How Everything Works Together

```
User visits site
    ↓
Next.js renders layout.tsx
    → RaceTicker + FloatingNav appear
    → SpeedCanvas starts drawing in rAF
    ↓
Hero section loads (page.tsx)
    → AnimatedTitle chars spring in (delay staggered)
    → Framer Motion springs, 60fps
    ↓
User scrolls
    → useScroll → hero fades + parallaxes
    → IntersectionObserver fires Counters
    ↓
User clicks "Learn F1"
    → /learn page loads
    → Accordion modules, progress tracked in state
    ↓
User clicks "Simulations"
    → /simulations page, 4 mini-games
    → Flag quiz → Points calc → Pit timer → DRS demo
    ↓
User signs up (/auth/signin)
    → POST /signup → bcrypt password
    → POST /login → JWT returned
    → Token stored in localStorage
    ↓
Protected pages (Drivers, Teams, Tracks, Prediction)
    → useAuth() checks localStorage token
    → apiFetch() sends Authorization: Bearer {token}
    → FastAPI validates JWT → returns data
    ↓
User makes prediction (/prediction)
    → POST /predictions/podium
    → FastAPI loads RandomForest model
    → 17 features engineered per driver
    → Returns predicted P1/P2/P3 with confidence %
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (or use a free Atlas Postgres / Neon / Render Postgres)

### Frontend (Next.js)

```bash
cd d:/f1
npm install          # installs Framer Motion, Three.js, R3F, etc.
cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL=https://your-render-backend.onrender.com
npm run dev          # http://localhost:3000
```

### Backend (FastAPI)

```bash
cd d:/f1/backend
pip install -r requirements.txt
cp .env.example .env
# Set DATABASE_URL=postgresql://user:pass@host/db
uvicorn app.main:main --reload   # http://localhost:8000
# DB seeds automatically on first startup
```

### Enabling R3F (`SpeedScene`)

After `npm install`, import in any page or layout:

```tsx
// In app/layout.tsx (adds to ALL pages)
import dynamic from "next/dynamic";
const SpeedScene = dynamic(() => import("@/components/SpeedScene"), { ssr: false });

// Inside your component JSX:
<SpeedScene />
```

> `ssr: false` is required because Three.js accesses `window` during init.

### Production Deployment

**Render (Backend):**
1. Connect GitHub repo → select `/backend`
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add env vars: `DATABASE_URL`, `SECRET_KEY`
5. DB seeds automatically on first cold start

**Vercel (Frontend):**
1. Connect GitHub repo → root directory
2. Add env var: `NEXT_PUBLIC_API_BASE_URL=https://your-service.onrender.com`
3. Deploy — automatic on every push

---

## Design Philosophy

### Why This UI?

**Black + Red + Speed = F1 DNA.**
The color system (`#050508` background, `#E10600` accent) directly mirrors the official F1 brand. Every design decision reinforces the feeling of speed and precision.

### Why Animations?

F1 is not static. Everything moves — cars, data, strategy. Framer Motion springs (not easing curves) make interactions feel physical and alive. Staggered text reveals create the drama of a race start.

### Why Canvas Over CSS for Speed Effects?

CSS animations are GPU-composited but can't easily generate hundreds of random, individually-controlled elements. The `SpeedCanvas` uses `requestAnimationFrame` with `clearRect` for zero-overhead 2D drawing — no DOM elements, no layout thrashing, ~0.1ms per frame.

### Why 3D?

The `SpeedScene` (R3F) adds genuine depth perception that 2D can't replicate. The warp particle field makes the homepage feel like you're in the cockpit at 300 km/h. It's a statement: this is not a generic web app.

### Why Educational + Analytical?

F1 fans range from first-time viewers to data engineers. The `Learn F1` + `Simulations` modules serve the beginner; the driver telemetry, AI predictions, and race results serve the enthusiast. One platform, all skill levels.

---

## API Reference (Key Endpoints)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Health check |
| POST | `/signup` | No | Register user |
| POST | `/login` | No | Get JWT token |
| GET | `/drivers` | Yes | All 20 drivers |
| GET | `/teams` | Yes | All 10 teams |
| GET | `/tracks` | Yes | All 24 circuits |
| GET | `/races` | Yes | Race calendar |
| POST | `/predictions/podium` | Yes | AI podium prediction |
| GET | `/profile` | Yes | User data + tier |
| PUT | `/update-preferences` | Yes | Favorite team/driver |
| GET | `/seed?secret=harsh123` | No | Manual DB seed |

---

*Built with ❤️ for F1 fans everywhere.*
