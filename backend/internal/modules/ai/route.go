package ai

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/ai/handler"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/middleware"
)

func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	h := handler.NewAIHandler(db)

	ai := rg.Group("/ai")
	ai.Use(middleware.AuthRequired())
	{
		// Model 1: Beneficiary Discovery / Eligibility Check
		ai.GET("/analyze-eligibility", h.AnalyzeEligibility)

		// Model 2 + 3: Grievance Department Routing + SLA Prediction
		ai.POST("/route-complaint", h.RouteComplaint)

		// Model 4: Rejection Risk Predictor
		ai.POST("/rejection-risk", h.RejectionRisk)

		// Model 5: Document Mismatch / Anomaly Detection
		ai.POST("/verify-application", h.VerifyApplication)

		// Conversational chat proxy (multilingual)
		ai.POST("/chat", h.Chat)

		// Legacy voice intent (kept for backward compat)
		ai.POST("/voice-intent", h.VoiceIntent)
	}
}
