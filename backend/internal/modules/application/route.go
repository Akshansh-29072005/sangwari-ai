package application

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/application/handler"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/middleware"
)

func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	h := handler.NewApplicationHandler(db)

	apps := rg.Group("/applications")
	apps.Use(middleware.AuthRequired())
	{
		apps.POST("", h.Apply)
		apps.GET("", h.GetMyApplications)
		apps.GET("/:id", h.GetApplicationDetail)

		// Admin only
		admin := apps.Group("")
		admin.Use(middleware.AdminRequired())
		{
			admin.PUT("/:id/status", h.UpdateStatus)
		}
	}
}
