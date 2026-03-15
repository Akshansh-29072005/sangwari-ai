package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/user/entity"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/logger"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/response"
)

type AIHandler struct {
	db *gorm.DB
}

func NewAIHandler(db *gorm.DB) *AIHandler {
	return &AIHandler{db: db}
}

// aiLayerURL returns the AI layer base URL from env or fallback
func aiLayerURL() string {
	u := os.Getenv("AI_LAYER_URL")
	if u == "" {
		return "http://localhost:8001"
	}
	return u
}

// proxyToAI sends a JSON payload to a Python FastAPI endpoint and pipes
// the response back to the frontend through the Go gateway.
func proxyToAI(c *gin.Context, endpoint string, payload interface{}) {
	log := logger.Get()

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Error().Err(err).Msg("Failed to marshal AI payload")
		response.InternalError(c, "Failed to prepare AI request")
		return
	}

	url := fmt.Sprintf("%s%s", aiLayerURL(), endpoint)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		log.Error().Err(err).Str("url", url).Msg("AI layer unreachable")
		response.InternalError(c, "AI Engine is unreachable")
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Error().Err(err).Msg("Failed to read AI response body")
		response.InternalError(c, "Failed to read AI response")
		return
	}

	if resp.StatusCode != http.StatusOK {
		log.Error().Int("status", resp.StatusCode).Str("body", string(body)).Msg("AI layer error")
		response.InternalError(c, "AI Engine returned an error")
		return
	}

	var aiResult map[string]interface{}
	if err := json.Unmarshal(body, &aiResult); err != nil {
		log.Error().Err(err).Msg("Failed to parse AI response JSON")
		response.InternalError(c, "Failed to parse AI response")
		return
	}

	response.OK(c, "AI response", aiResult["data"])
}

// ─── ENDPOINT: Beneficiary Discovery / Eligibility Check ─────────────────────
// GET /api/v1/ai/analyze-eligibility
// Proxy → Python POST /eligibility
func (h *AIHandler) AnalyzeEligibility(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "Unauthorized access")
		return
	}

	var user entity.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		response.NotFound(c, "User not found")
		return
	}

	payload := map[string]interface{}{
		"name":         user.Name,
		"age":          user.Age,
		"gender":       user.Gender,
		"address":      user.Address,
		"district":     user.District,
		"income":       user.AnnualIncome,
		"occupation":   user.Occupation,
		"caste":        user.Caste,
		"aadhar_number": user.AadharNumber,
	}
	proxyToAI(c, "/eligibility", payload)
}

// ─── ENDPOINT: Grievance Routing + SLA Prediction ────────────────────────────
// POST /api/v1/ai/route-complaint
// Body: { "text": "..." }
// Proxy → Python POST /route-complaint
func (h *AIHandler) RouteComplaint(c *gin.Context) {
	var req struct {
		Text string `json:"text" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "text field is required", nil)
		return
	}
	proxyToAI(c, "/route-complaint", map[string]string{"text": req.Text})
}

// ─── ENDPOINT: Rejection Risk Predictor ──────────────────────────────────────
// POST /api/v1/ai/rejection-risk
// Body: { "scheme_id": 1, "approval_confidence": 60, "age": 45, "family_size": 4 }
// Proxy → Python POST /rejection-risk
func (h *AIHandler) RejectionRisk(c *gin.Context) {
	var req struct {
		SchemeID           int     `json:"scheme_id" binding:"required"`
		ApprovalConfidence float64 `json:"approval_confidence" binding:"required"`
		Age                int     `json:"age"`
		FamilySize         int     `json:"family_size"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "scheme_id and approval_confidence are required", nil)
		return
	}
	proxyToAI(c, "/rejection-risk", req)
}

// ─── ENDPOINT: Document Mismatch / Anomaly Detection ─────────────────────────
// POST /api/v1/ai/verify-application
// Body: { "description": "...", "citizen_id": 1001, "document_type": "income_certificate" }
// Proxy → Python POST /verify-document
func (h *AIHandler) VerifyApplication(c *gin.Context) {
	var req struct {
		Description  string `json:"description" binding:"required"`
		CitizenID    *int   `json:"citizen_id"`
		DocumentType string `json:"document_type"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "description is required", nil)
		return
	}
	proxyToAI(c, "/verify-document", req)
}

// ─── ENDPOINT: Chat / Voice Query ─────────────────────────────────────────────
// POST /api/v1/ai/chat
// Body: { "message": "...", "language": "hi" }
// Proxy → Python POST /chat
func (h *AIHandler) Chat(c *gin.Context) {
	var req struct {
		Message  string `json:"message" binding:"required"`
		Language string `json:"language"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "message is required", nil)
		return
	}
	if req.Language == "" {
		req.Language = "hi"
	}
	proxyToAI(c, "/chat", req)
}

// ─── DEPRECATED: voice intent (kept for backward compat) ─────────────────────
func (h *AIHandler) VoiceIntent(c *gin.Context) {
	response.OK(c, "Voice intent extracted", map[string]interface{}{
		"intent":  "search_scheme",
		"keyword": "kisan",
	})
}
