# Sangwari AI Backend (Go)

Production-style API gateway and business backend for Sangwari AI.

This service is responsible for:

- Authentication (OTP + MPIN + JWT)
- Citizen profile, documents, and preferences
- Scheme discovery and applications
- Grievance filing, routing integration, and tracking
- Notification management
- Secure proxy integration with AI Layer (`/ai/*`)

---

## 1) Tech Stack

- Go `1.25`
- Gin (HTTP framework)
- GORM + PostgreSQL
- Zerolog (structured logging)
- JWT (`github.com/golang-jwt/jwt/v5`)
- Middleware: CORS, rate limiting, payload sanitization

---

## 2) Runtime Architecture

```text
Mobile App --> Go Backend (:8000) --> AI Layer (:8001)
                    |
                    +--> PostgreSQL (:5432)
```

Key design point: frontend never calls AI layer directly; all AI calls are orchestrated/proxied via backend module handlers.

---

## 3) Folder Ownership

```text
backend/
├── main.go                          # bootstrap, env loading, DB connect/migrate, graceful shutdown
├── Dockerfile
├── docker-compose.yml               # postgres + adminer (backend-local infra)
├── internal/modules/
│   ├── ai/                          # AI proxy routes/handlers
│   ├── application/                 # application lifecycle APIs
│   ├── complaint/                   # complaint filing and status APIs
│   ├── document/                    # document APIs
│   ├── notification/                # user/admin notifications
│   ├── scheme/                      # scheme listing/search/apply
│   ├── user/                        # auth/profile/document upload
│   └── voice/                       # voice assistant endpoints (currently placeholder logic)
├── platform/
│   ├── database/                    # postgres connection, automigrate, seeders
│   ├── middleware/                  # auth, CORS, rate limit, sanitization
│   ├── jwt/                         # JWT generation/verification
│   ├── response/                    # API response helpers
│   └── server/                      # route wiring + health endpoints
└── migrations/001_initial_schema.sql
```

---

## 4) Environment Variables

Required for normal development:

- `APP_ENV=development`
- `PORT=8000`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `AI_LAYER_URL` (example: `http://localhost:8001`)

Notes:

- If `APP_ENV=development`, logs are console-friendly.
- `AI_LAYER_URL` defaults to `http://localhost:8001` in handlers when missing.

---

## 5) Running Locally

### A) Start DB (recommended via Docker)

```bash
docker compose -f docker-compose.yml up -d
```

### B) Start backend

```bash
go mod tidy
go run main.go
```

On startup backend performs:

1. env load (`.env` optional)
2. DB connection and pool setup
3. auto-migration of all entities
4. seed of schemes/rules/users (if tables are empty)
5. route registration + HTTP server start

---

## 6) API Surface

## 6.1 Public routes

- `POST /auth/send-otp`
- `POST /auth/verify-otp`
- `POST /auth/set-mpin`
- `POST /auth/login`
- `GET /schemes/search` (optional auth personalization)
- `GET /health`
- `GET /ready`

## 6.2 Protected citizen routes

- `/user/*`
- `/schemes/eligible`
- `/schemes/registered`
- `/schemes/:id`
- `/schemes/:id/form-schema`
- `/schemes/:id/apply`
- `/schemes/applications/status`
- `/applications/*`
- `/complaints/*`
- `/notifications/*`
- `/documents/*`
- `/voice/*`
- `/ai/*`

## 6.3 Admin-protected routes

- `PUT /applications/:id/status`
- `PUT /complaints/:id/status`
- `POST /notifications/push`

---

## 7) Middleware and Security

Global middleware chain in server bootstrap:

1. Recovery
2. Request logger
3. CORS
4. Rate limiter (`100-M`)
5. JSON payload sanitization

Auth model:

- Bearer JWT for protected routes
- Optional auth mode for search personalization
- Role-based gate for admin actions

Additional notes:

- Uploaded files are exposed via static `/uploads` mount.
- `JWT_SECRET` must be strong and rotated for production.

---

## 8) AI Integration Contract

Backend `ai` module proxies to AI layer endpoints:

- `GET /ai/analyze-eligibility` -> `POST /eligibility`
- `POST /ai/route-complaint` -> `POST /route-complaint`
- `POST /ai/rejection-risk` -> `POST /rejection-risk`
- `POST /ai/verify-application` -> `POST /verify-document`
- `POST /ai/chat` -> `POST /chat`

Operational behavior:

- If AI is unavailable, some flows use fallback paths (for example scheme eligibility fallback list).

---

## 9) Data and Seeding

Database layer seeds when empty:

- baseline schemes
- eligibility rules
- users from `../aiLayer/AI layer creation/datasets/citizens_master.csv`

Reference SQL schema is available in `migrations/001_initial_schema.sql`.

---

## 10) Current Implementation Notes

- Some handlers are fully implemented (auth, profile, complaint create/list, application create/list, notifications).
- Some endpoints are currently placeholder/minimal responses (parts of `voice`, `document`, detail/status endpoints).
- Route comments may mention legacy `/api/v1/*`; active mounted routes are root-based (for example `/auth/*`, `/schemes/*`).

---

## 11) Development Checklist

Before opening PRs:

- Verify `GET /health` and `GET /ready`
- Validate auth token flow with `/auth/login`
- Test AI-dependent routes with AI layer running
- Ensure seed/migration side effects are acceptable for target environment

