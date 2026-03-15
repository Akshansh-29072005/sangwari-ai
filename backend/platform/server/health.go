package server

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/response"
)

// HealthHandler handles system health and readiness checks.
type HealthHandler struct {
	db *gorm.DB
}

// NewHealthHandler creates a new handler.
func NewHealthHandler(db *gorm.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

// Health is a simple check to see if the HTTP server is alive.
func (h *HealthHandler) Health(c *gin.Context) {
	response.OK(c, "Server is healthy", map[string]string{"status": "ok"})
}

// Ready checks if the server and its dependencies (like DB) are ready to accept traffic.
func (h *HealthHandler) Ready(c *gin.Context) {
	sqlDB, err := h.db.DB()
	if err != nil || sqlDB.Ping() != nil {
		response.InternalError(c, "Database is not ready")
		return
	}

	response.OK(c, "Server is ready", map[string]string{"status": "ok", "database": "connected"})
}
