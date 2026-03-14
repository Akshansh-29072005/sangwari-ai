package handler

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/response"
)

// VoiceHandler handles voice assistant API endpoints.
type VoiceHandler struct {
	db *gorm.DB
}

func NewVoiceHandler(db *gorm.DB) *VoiceHandler {
	return &VoiceHandler{db: db}
}

// POST /voice/classify-intent — determine user intent from transcription
func (h *VoiceHandler) ClassifyIntent(c *gin.Context) {
	response.OK(c, "Intent classified", map[string]interface{}{
		"intent":     "scheme_discovery",
		"confidence": 0.92,
		"entities":   map[string]string{"keyword": "pension"},
	})
}

// POST /voice/respond — generate AI voice response
func (h *VoiceHandler) GetVoiceResponse(c *gin.Context) {
	response.OK(c, "Voice response generated", map[string]interface{}{
		"reply":  "I found 3 pension schemes you may qualify for. Would you like me to show them?",
		"intent": "scheme_discovery",
	})
}
