package scheme

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/scheme/handler"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/middleware"
)

// RegisterRoutes sets up all scheme module endpoints to match frontend API:
//
//	/schemes/eligible, /schemes/registered, /schemes/:id/form-schema,
//	/schemes/:id/apply, /schemes/applications/status, /schemes/search?q=
func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	h := handler.NewSchemeHandler(db)

	schemes := rg.Group("/schemes")
	{
		// Public search (with optional auth for personalized eligibility)
		schemes.GET("/search", middleware.OptionalAuth(), h.SearchSchemes)

		// Protected
		protected := schemes.Group("")
		protected.Use(middleware.AuthRequired())
		{
			protected.GET("/eligible", h.GetEligibleSchemes)
			protected.GET("/registered", h.GetRegisteredSchemes)
			protected.GET("/applications/status", h.GetApplicationStatus)
			protected.GET("/:id", h.GetSchemeByID)
			protected.GET("/:id/form-schema", h.GetFormSchema)
			protected.POST("/:id/apply", h.SubmitApplication)
		}
	}
}
