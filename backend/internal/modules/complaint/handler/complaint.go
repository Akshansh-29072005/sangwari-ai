package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/complaint/entity"
	notificationEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/notification/entity"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/response"
)

type ComplaintHandler struct {
	db *gorm.DB
}

func NewComplaintHandler(db *gorm.DB) *ComplaintHandler {
	return &ComplaintHandler{db: db}
}

// aiLayerURL returns the AI layer base URL from env or fallback
func aiLayerURL() string {
	u := os.Getenv("AI_LAYER_URL")
	if u == "" {
		return "http://localhost:8001"
	}
	return u
}

// routeComplaintViaAI calls the Python AI layer to classify the complaint
// Returns (department, confidence, sla_days, error)
func routeComplaintViaAI(text string) (string, float64, int, error) {
	payload, _ := json.Marshal(map[string]string{"text": text})
	url := fmt.Sprintf("%s/route-complaint", aiLayerURL())

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(payload))
	if err != nil {
		return "", 0, 0, fmt.Errorf("AI layer unreachable: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", 0, 0, fmt.Errorf("failed to read AI response: %w", err)
	}

	var result struct {
		Success bool `json:"success"`
		Data    struct {
			PredictedDepartment     string  `json:"predicted_department"`
			Confidence              float64 `json:"confidence"`
			EstimatedResolutionDays int     `json:"estimated_resolution_days"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", 0, 0, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return result.Data.PredictedDepartment, result.Data.Confidence, result.Data.EstimatedResolutionDays, nil
}

// POST /complaints/file — file a new complaint
func (h *ComplaintHandler) FileComplaint(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description" binding:"required"`
		Category    string `json:"category"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err)
		return
	}

	// Use description (or title as fallback) for AI classification
	textForAI := req.Description
	if textForAI == "" {
		textForAI = req.Title
	}

	// Call AI layer for department routing
	department := ""
	status := "pending"

	dept, conf, slaDays, err := routeComplaintViaAI(textForAI)
	if err != nil {
		log.Warn().Err(err).Msg("AI layer complaint routing failed, falling back to pending assignment")
	} else {
		log.Info().
			Str("text", textForAI).
			Str("department", dept).
			Float64("confidence", conf).
			Int("sla_days", slaDays).
			Msg("AI complaint routing result")

		// Only assign department if confidence is above threshold (35%)
		// Below that the text is too vague / nonsensical
		if conf >= 0.35 {
			department = dept
			status = "processing"
		} else {
			log.Warn().
				Str("text", textForAI).
				Float64("confidence", conf).
				Msg("Complaint text too vague — below confidence threshold, leaving as pending")
		}
	}

	complaint := entity.Complaint{
		UserID:                  userID.(string),
		Title:                   req.Title,
		Description:             req.Description,
		Category:                req.Category,
		Department:              department,
		Status:                  status,
		MediaURLs:               "[]",
		EstimatedResolutionDays: slaDays,
	}
	if err := h.db.Create(&complaint).Error; err != nil {
		response.InternalError(c, "Failed to file complaint")
		return
	}

	// Create Notification
	notification := notificationEntity.Notification{
		UserID:    userID.(string),
		Title:     "Grievance Filed 📝",
		Message:   fmt.Sprintf("Your complaint '%s' has been received and assigned to %s. Estimated resolution: %d days.", complaint.Title, department, slaDays),
		Type:      "success",
		IsRead:    false,
	}
	h.db.Create(&notification)

	log.Info().Str("user_id", userID.(string)).Str("title", req.Title).Str("department", department).Str("status", status).Msg("Complaint filed")
	response.Created(c, "Complaint filed successfully", complaint)
}

// GET /complaints — list user's complaints
func (h *ComplaintHandler) GetMyComplaints(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var complaints []entity.Complaint
	if err := h.db.Where("user_id = ?", userID).Order("created_at desc").Find(&complaints).Error; err != nil {
		response.InternalError(c, "Failed to fetch complaints")
		return
	}

	response.OK(c, "Complaints fetched", complaints)
}

// GET /complaints/:id — complaint detail with timeline
func (h *ComplaintHandler) GetComplaintDetail(c *gin.Context) {
	response.OK(c, "Complaint detail fetched", map[string]string{"id": c.Param("id")})
}

// POST /complaints/:id/escalate — escalate a complaint
func (h *ComplaintHandler) EscalateComplaint(c *gin.Context) {
	response.OK(c, "Complaint escalated successfully", map[string]string{
		"id":     c.Param("id"),
		"status": "escalated",
	})
}

// PUT /complaints/:id/status — admin update status
func (h *ComplaintHandler) UpdateStatus(c *gin.Context) {
	response.OK(c, "Complaint status updated", nil)
}
