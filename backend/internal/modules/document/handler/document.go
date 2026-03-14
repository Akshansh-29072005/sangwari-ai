package handler

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/response"
)

type DocumentHandler struct {
	db *gorm.DB
}

func NewDocumentHandler(db *gorm.DB) *DocumentHandler {
	return &DocumentHandler{db: db}
}

func (h *DocumentHandler) UploadDocument(c *gin.Context) {
	response.Created(c, "Document uploaded successfully", map[string]string{"id": "dummy_doc_id"})
}

func (h *DocumentHandler) GetDocument(c *gin.Context) {
	response.OK(c, "Document details fetched", map[string]string{"id": c.Param("id")})
}

func (h *DocumentHandler) DeleteDocument(c *gin.Context) {
	response.OK(c, "Document deleted", nil)
}
