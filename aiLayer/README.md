# Sangwari AI — AI Layer (FastAPI)

This folder will contain the AI/ML models and FastAPI server for:

- **Eligibility Analysis** — Determine scheme eligibility based on user profile
- **Voice Intent Classification** — Classify user voice queries into intents
- **Complaint Routing** — Route complaints to the correct department via NLP
- **Chat / Conversational AI** — General assistant responses

## Future Structure
```
aiLayer/
├── main.py          (FastAPI entry point)
├── requirements.txt
├── models/          (ML models)
├── routes/          (API endpoints)
└── services/        (Business logic)
```

## Endpoints (planned)
| Method | Path | Description |
|---|---|---|
| POST | `/eligibility` | Analyze scheme eligibility |
| POST | `/intent` | Classify voice intent |
| POST | `/route-complaint` | AI complaint routing |
| POST | `/chat` | Conversational response |

> 📌 This will be built after the Go backend is complete.
