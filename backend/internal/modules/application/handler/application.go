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

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/application/entity"
	notificationEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/notification/entity"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/response"
)

type ApplicationHandler struct {
	db *gorm.DB
}

func NewApplicationHandler(db *gorm.DB) *ApplicationHandler {
	return &ApplicationHandler{db: db}
}

// aiLayerURL returns the AI layer base URL from env or fallback
func aiLayerURL() string {
	u := os.Getenv("AI_LAYER_URL")
	if u == "" {
		return "http://localhost:8001"
	}
	return u
}

// predictSLA calls the Python AI layer to get estimated resolution days
func predictSLA(text string) (int, error) {
	payload, _ := json.Marshal(map[string]string{"text": text})
	url := fmt.Sprintf("%s/predict-sla", aiLayerURL())

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(payload))
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, err
	}

	var result struct {
		Days int `json:"estimated_resolution_days"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return 0, err
	}

	return result.Days, nil
}

func (h *ApplicationHandler) Apply(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		SchemeID string `json:"scheme_id" binding:"required"`
		FormData string `json:"form_data"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err)
		return
	}

	// Fetch scheme to get description for SLA prediction
	var scheme struct {
		Title       string
		Description string
	}
	if err := h.db.Table("schemes").Select("title, description").Where("id = ?", req.SchemeID).First(&scheme).Error; err != nil {
		response.NotFound(c, "Scheme not found")
		return
	}

	// Predict SLA
	slaDays, err := predictSLA(scheme.Description)
	if err != nil {
		log.Warn().Err(err).Msg("Failed to predict SLA for application, using default")
		slaDays = 15 // default fallback
	}

	application := entity.Application{
		UserID:                  userID.(string),
		SchemeID:                req.SchemeID,
		FormData:                req.FormData,
		Status:                  "submitted",
		EstimatedResolutionDays: slaDays,
	}

	if err := h.db.Create(&application).Error; err != nil {
		response.InternalError(c, "Failed to submit application")
		return
	}

	// Create Notification
	notification := notificationEntity.Notification{
		UserID:    userID.(string),
		Title:     "Scheme Application Submitted 📄",
		Message:   fmt.Sprintf("Your application for '%s' has been received. Estimated processing time: %d days.", scheme.Title, slaDays),
		Type:      "success",
		IsRead:    false,
	}
	h.db.Create(&notification)

	response.Created(c, "Application submitted successfully", application)
}

func (h *ApplicationHandler) GetMyApplications(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var applications []entity.Application
	if err := h.db.Preload("Scheme").Where("user_id = ?", userID).Find(&applications).Error; err != nil {
		response.InternalError(c, "Failed to fetch applications")
		return
	}

	response.OK(c, "Applications fetched", applications)
}

func (h *ApplicationHandler) GetApplicationDetail(c *gin.Context) {
	response.OK(c, "Application detail fetched", map[string]string{"id": c.Param("id")})
}

func (h *ApplicationHandler) UpdateStatus(c *gin.Context) {
	response.OK(c, "Application status updated", nil)
}
