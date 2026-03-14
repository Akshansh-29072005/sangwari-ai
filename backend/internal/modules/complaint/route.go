package complaint

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/complaint/handler"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/middleware"
)

// RegisterRoutes sets up all complaint module endpoints to match frontend API:
//
//	/complaints/file, /complaints, /complaints/:id, /complaints/:id/escalate
func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	h := handler.NewComplaintHandler(db)

	complaints := rg.Group("/complaints")
	complaints.Use(middleware.AuthRequired())
	{
		complaints.POST("/file", h.FileComplaint)
		complaints.GET("", h.GetMyComplaints)
		complaints.GET("/:id", h.GetComplaintDetail)
		complaints.POST("/:id/escalate", h.EscalateComplaint)

		// Admin only
		admin := complaints.Group("")
		admin.Use(middleware.AdminRequired())
		{
			admin.PUT("/:id/status", h.UpdateStatus)
		}
	}
}
