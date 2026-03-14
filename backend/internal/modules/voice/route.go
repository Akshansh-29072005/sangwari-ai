package voice

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/voice/handler"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/middleware"
)

// RegisterRoutes sets up voice assistant endpoints to match frontend API:
//
//	/voice/classify-intent, /voice/respond
func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	h := handler.NewVoiceHandler(db)

	voice := rg.Group("/voice")
	voice.Use(middleware.AuthRequired())
	{
		voice.POST("/classify-intent", h.ClassifyIntent)
		voice.POST("/respond", h.GetVoiceResponse)
	}
}
