package document

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/document/handler"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/middleware"
)

func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	h := handler.NewDocumentHandler(db)

	docs := rg.Group("/documents")
	docs.Use(middleware.AuthRequired())
	{
		docs.POST("/upload", h.UploadDocument)
		docs.GET("/:id", h.GetDocument)
		docs.DELETE("/:id", h.DeleteDocument)
	}
}
