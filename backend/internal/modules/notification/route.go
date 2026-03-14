package notification

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/notification/handler"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/middleware"
)

func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	h := handler.NewNotificationHandler(db)

	notifications := rg.Group("/notifications")
	notifications.Use(middleware.AuthRequired())
	{
		notifications.GET("", h.GetMyNotifications)
		notifications.PUT("/:id/read", h.MarkAsRead)

		// Admin only
		admin := notifications.Group("")
		admin.Use(middleware.AdminRequired())
		{
			admin.POST("/push", h.PushNotification)
		}
	}
}
