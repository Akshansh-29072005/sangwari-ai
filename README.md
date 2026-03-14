# Sangwari AI

AI-assisted citizen services platform composed of:

- `app/` — Expo React Native mobile client
- `backend/` — Go (Gin + GORM) API gateway and business backend
- `aiLayer/AI layer creation/` — FastAPI + ML/LLM service consumed by Go backend

The platform handles scheme discovery, eligibility analysis, application submission, grievance routing, document checks, multilingual assistant responses, and citizen notifications.

## Layer Documentation (In-Depth)

For full, layer-specific implementation and operations documentation, refer to:

- [Backend README](backend/README.md)
- [App README](app/README.md)
- [AI Layer README](aiLayer/README.md)

## Languages, Frameworks, Tools & Technologies

### Programming Languages

- Go
- Python
- TypeScript
- JavaScript
- SQL

### Frameworks & Libraries

- **Mobile App**: Expo, React Native, Expo Router, Nativewind, Tailwind CSS
- **Backend**: Gin, GORM, JWT, Zerolog, Go Validator
- **AI Layer**: FastAPI, SQLAlchemy, Pydantic, Scikit-learn, Pandas, Llama.cpp (`llama-cpp-python`)

### Databases & Storage

- PostgreSQL
- SQLite (fallback for AI layer local setup)
- AsyncStorage (mobile local persistence)

### DevOps & Tooling

- Docker, Docker Compose
- Adminer (DB administration)
- Uvicorn (ASGI server)
- npm / Node.js
- Go modules
- Python virtual environments (`venv`)

### AI/ML Tooling

- Hugging Face Hub (model artifact retrieval)
- Random Forest models (classification and regression)
- TF-IDF vectorization
- Rule-based inference engines (eligibility and anomaly checks)

---

## 1) High-Level Architecture

```text
Mobile App (Expo)  --->  Go Backend (Gin, :8000)  --->  AI Layer (FastAPI, :8001)
				 |                         |
				 |                         +--> PostgreSQL (:5432)
				 |
				 +--> Poll notifications via backend APIs
```

### Runtime responsibilities

- **App**: user-facing flows (auth, schemes, complaints, profile, notifications, voice UI)
- **Go backend**:
	- authentication + authorization
	- module routing and business orchestration
	- PostgreSQL persistence + seeding
	- proxy/orchestration calls to AI layer
- **AI layer**:
	- ML model training/loading/inference
	- multilingual translation/chat via local Llama model
	- eligibility/risk/routing/anomaly inference APIs

---

## 2) Monorepo Structure

```text
sangwari-ai/
├── docker-compose.yml                      # Root orchestration (postgres + adminer + backend + ai layer)
├── backend/                                # Go backend service
│   ├── main.go                             # Service bootstrap, DB connect, migrate, graceful shutdown
│   ├── Dockerfile                          # Backend container build
│   ├── docker-compose.yml                  # Optional local infra compose (postgres + adminer)
│   ├── internal/modules/                   # Domain modules (ai, user, scheme, complaint, ...)
│   ├── platform/                           # Shared infra (db, middleware, jwt, response, server)
│   └── migrations/001_initial_schema.sql   # SQL reference migration
├── aiLayer/
│   ├── README.md                           # Legacy high-level AI layer note
│   └── AI layer creation/
│       ├── Dockerfile                      # AI layer container build
│       ├── backend/                        # FastAPI code + ML/LLM logic
│       ├── datasets/                       # CSV datasets for training/seed/analysis
│       ├── models/                         # GGUF + trained pickle artifacts/metrics
│       └── PRD.txt / System Design Logic.txt / Project Task Breakdown.txt
└── app/                                    # Expo React Native app
		├── app/                                # Expo Router screens
		├── api/                                # Frontend API client + route wrappers
		├── components/                         # UI primitives and shared components
		├── context/                            # Theme + i18n providers
		├── services/                           # Notification polling service
		└── package.json
```

---

## 3) Quick Start (Recommended: Docker)

### Prerequisites

- Docker + Docker Compose
- (Optional for local app dev) Node.js 18+ and npm

### Run full stack

```bash
docker compose up --build
```

### Exposed services

- Go backend: `http://localhost:8000`
- AI layer: `http://localhost:8001`
- PostgreSQL: `localhost:5432`
- Adminer: `http://localhost:8080`

### Useful health checks

- `GET http://localhost:8000/health`
- `GET http://localhost:8000/ready`
- `GET http://localhost:8001/health`

---

## 4) Local Development (Without Docker)

## 4.1 Go Backend (`backend/`)

### Prerequisites

- Go 1.25+
- PostgreSQL running locally

### Environment variables

Set these before starting backend:

- `APP_ENV=development`
- `PORT=8000`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `AI_LAYER_URL` (for example `http://localhost:8001`)

### Run

```bash
cd backend
go mod tidy
go run main.go
```

On startup backend will:

1. connect to PostgreSQL
2. auto-migrate all entities
3. seed initial schemes/rules if empty
4. seed users from `aiLayer/AI layer creation/datasets/citizens_master.csv` if users table is empty

## 4.2 AI Layer (`aiLayer/AI layer creation/backend/`)

### Prerequisites

- Python 3.10
- `pip`
- C/C++ build tools (needed by `llama-cpp-python`)

### Environment variables

- `DATABASE_URL` (default fallback uses sqlite if not set)
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`

### Run

```bash
cd "aiLayer/AI layer creation/backend"
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Notes:

- The AI layer trains/loads model artifacts on startup.
- Llama GGUF model is expected under `aiLayer/AI layer creation/models/` (or downloaded from HF if missing).

## 4.3 Mobile App (`app/`)

### Prerequisites

- Node.js 18+
- Expo CLI tooling (via `npx expo`)

### Configure backend URL

Update `app/api/api.ts`:

- `API_BASE_URL = 'http://<your-ip>:8000'`

### Run

```bash
cd app
npm install
npx expo start
```

---

## 5) Backend Documentation (`backend/`)

## 5.1 Platform Layer (`backend/platform`)

- `database/postgres.go`
	- builds DSN from env
	- configures connection pool
	- runs `AutoMigrate`
	- seeds schemes, eligibility rules, and citizen users from CSV
- `server/server.go`
	- registers global middleware
	- exposes `/health`, `/ready`, `/uploads`
	- mounts all module routes
- `server/health.go`
	- basic liveness/readiness endpoints
- `middleware/`
	- `auth.go`: JWT auth + optional auth + admin gate
	- `cors.go`: permissive CORS setup
	- `ratelimit.go`: IP rate limiting (default `100-M`)
	- `sanitize.go`: JSON payload XSS sanitization with bluemonday
- `jwt/jwt.go`
	- token generation + verification

## 5.2 Domain Modules (`backend/internal/modules`)

### `user`

- Auth endpoints: OTP, verify OTP, set MPIN, login, change MPIN
- Profile endpoints: get/update profile
- Document upload and retrieval
- Profile photo upload endpoint

### `scheme`

- Eligible schemes retrieval (AI-assisted; fallback mode if AI unavailable)
- Scheme search (`/schemes/search`)
- Scheme detail and form schema
- Scheme application submission + SLA prediction via AI

### `application`

- submit application
- get current user applications
- get application detail
- admin status update endpoint

### `complaint`

- file complaint
- AI-based department routing and SLA estimation
- list/detail/escalate complaints
- admin complaint status update endpoint

### `notification`

- list notifications
- mark notification as read
- admin push notification endpoint

### `document`

- document upload/get/delete endpoints (currently stubbed/basic handler)

### `voice`

- intent classification and AI response endpoints (placeholder responses in current implementation)

### `ai`

- authenticated proxy routes from backend to AI layer:
	- `/ai/analyze-eligibility`
	- `/ai/route-complaint`
	- `/ai/rejection-risk`
	- `/ai/verify-application`
	- `/ai/chat`
	- `/ai/voice-intent` (legacy compatibility)

## 5.3 Backend API Surface (Primary)

### Public routes

- `POST /auth/send-otp`
- `POST /auth/verify-otp`
- `POST /auth/set-mpin`
- `POST /auth/login`
- `GET /schemes/search` (optional auth)
- `GET /health`
- `GET /ready`

### Protected routes (Bearer token)

- User: `/user/*`
- Schemes: `/schemes/eligible`, `/schemes/registered`, `/schemes/:id`, `/schemes/:id/form-schema`, `/schemes/:id/apply`, `/schemes/applications/status`
- Applications: `/applications/*`
- Complaints: `/complaints/*`
- Voice: `/voice/*`
- Notifications: `/notifications/*`
- Documents: `/documents/*`
- AI proxy: `/ai/*`

---

## 6) AI Layer Documentation (`aiLayer/AI layer creation/`)

## 6.1 Core Backend Files

- `backend/main.py`
	- FastAPI entrypoint
	- startup model loading/training checks
	- CORS policy
	- ML and LLM inference endpoints
- `backend/ml_models.py`
	- trains model pipelines
	- saves/loads pickle artifacts and metrics
	- provides inference helpers
- `backend/eligibility.py`
	- rule-based scheme eligibility evaluation against DB rules
- `backend/llm_service.py`
	- Llama GGUF loading via `llama-cpp-python`
	- translation to English
	- multilingual short chat responses
- `backend/database.py`
	- SQLAlchemy engine/session bootstrap
- `backend/schemas.py`, `backend/models.py`
	- validation and ORM models
- `backend/seed.py`
	- optional seed utility for AI-side tables/sample data

## 6.2 AI Layer Endpoints

- `GET /health`
- `GET /models/metrics`
- `POST /eligibility`
- `POST /predict-sla`
- `POST /route-complaint`
- `POST /rejection-risk`
- `POST /verify-document`
- `POST /chat`

## 6.3 ML/LLM Capabilities

1. **Beneficiary discovery / eligibility** (rule-based against scheme rules)
2. **Grievance department classifier** (TF-IDF + RandomForest)
3. **SLA predictor** (RandomForest regressor)
4. **Rejection risk predictor** (RandomForest classifier)
5. **Document mismatch/anomaly detection** (rule + keyword scoring)
6. **Multilingual translation/chat** using Llama 3.2 3B Instruct GGUF

## 6.4 Data and Model Assets

- Datasets: `datasets/*.csv`
	- citizens master
	- grievance dataset
	- scheme applications
	- scheme rules, etc.
- Model artifacts:
	- `models/Llama-3.2-3B-Instruct-Q4_K_M.gguf`
	- generated `*.pkl` and `metrics.json`

---

## 7) App Documentation (`app/`)

## 7.1 App Architecture

- Framework: Expo + React Native + Expo Router (TypeScript)
- Styling: Nativewind + Tailwind-based tokens + custom theme context
- Localization: `context/I18nContext.tsx`
- Theming: `context/ThemeContext.tsx`
- API integration:
	- central fetch wrapper in `api/api.ts`
	- route wrappers under `api/routes/*`

## 7.2 Main Screen Groups

- `app/auth/*`
	- onboarding auth flows (phone/OTP/MPIN/language)
- `app/(tabs)/index.tsx`
	- home dashboard
	- complaint quick send
	- voice assistant modal flow
	- scheme/application/complaint snapshots
- `app/schemes/*`
	- eligible list
	- search
	- scheme detail/application flow
- `app/profile.tsx`
	- profile details
	- document upload
	- profile image upload
	- language/theme preferences
- `app/notifications.tsx`
	- notification center

## 7.3 Frontend API Route Wrappers

- `api/routes/auth.ts`
- `api/routes/schemes.ts`
- `api/routes/complaints.ts`
- `api/routes/voice.ts`
- `api/routes/user.ts`
- `api/routes/notifications.ts`

## 7.4 Notifications

- `services/NotificationService.ts`
	- polls backend every 30s
	- tracks last notification ID in AsyncStorage
	- triggers in-app toast HUD (`components/ui/NotificationToast.tsx`)

---

## 8) Data, Storage, and Files

- PostgreSQL persists users, OTP records, schemes, applications, complaints, notifications, documents
- Uploaded files are served by backend from `/uploads`
- ML models and metrics are persisted in AI layer `models/` directory
- App stores auth/notification local state using AsyncStorage

---

## 9) Security and Operational Notes

- JWT bearer auth required for most business routes
- Admin-only guards exist for select status/push operations
- Request payload sanitization is applied globally
- Rate limiting enabled globally by client IP
- CORS is currently permissive (`*`) in backend middleware
- `JWT_SECRET` must be overridden in production
- Replace hardcoded mobile `API_BASE_URL` with env-driven config before production rollout

---

## 10) Known Implementation State (Important)

The project is functional but includes a mix of production and placeholder implementations:

- Some handlers currently return stubbed responses (`voice`, parts of `document`, status-update details)
- API comments in some handlers refer to `/api/v1/*`, while server mounts routes at root paths (for example `/auth/*`, `/schemes/*`)
- AI model startup/training can be heavy on CPU/RAM depending on environment

---

## 11) Common Commands

### Full stack

```bash
docker compose up --build
docker compose down
```

### Backend

```bash
cd backend
go run main.go
```

### AI layer

```bash
cd "aiLayer/AI layer creation/backend"
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### App

```bash
cd app
npm install
npx expo start
```

---

## 12) Tech Stack Summary

- **Mobile**: Expo, React Native, TypeScript, Nativewind
- **Backend**: Go, Gin, GORM, PostgreSQL, Zerolog, JWT
- **AI Layer**: FastAPI, SQLAlchemy, Scikit-learn, Pandas, Llama.cpp
- **Infra**: Docker Compose, Adminer

---

## 13) Folder-Specific Supplementary Docs

Additional design/planning references are available under:

- `aiLayer/AI layer creation/PRD.txt`
- `aiLayer/AI layer creation/System Design Logic.txt`
- `aiLayer/AI layer creation/Project Task Breakdown.txt`

These are useful for product context and roadmap alignment beyond code-level implementation.
