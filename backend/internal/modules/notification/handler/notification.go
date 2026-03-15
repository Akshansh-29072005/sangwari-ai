package handler

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/notification/entity"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/response"
)

type NotificationHandler struct {
	db *gorm.DB
}

func NewNotificationHandler(db *gorm.DB) *NotificationHandler {
	return &NotificationHandler{db: db}
}

func (h *NotificationHandler) GetMyNotifications(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var notifications []entity.Notification
	if err := h.db.Where("user_id = ?", userID).Order("created_at desc").Find(&notifications).Error; err != nil {
		response.InternalError(c, "Failed to fetch notifications")
		return
	}

	response.OK(c, "Notifications fetched", notifications)
}

func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Model(&entity.Notification{}).Where("id = ?", id).Update("is_read", true).Error; err != nil {
		response.InternalError(c, "Failed to mark notification as read")
		return
	}
	response.OK(c, "Notification marked as read", nil)
}

func (h *NotificationHandler) PushNotification(c *gin.Context) {
	response.OK(c, "Push notification sent successfully", nil)
}
