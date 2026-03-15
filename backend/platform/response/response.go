package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIResponse is the unified JSON response envelope.
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   interface{} `json:"error,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

// Meta holds pagination metadata.
type Meta struct {
	Page    int   `json:"page"`
	PerPage int   `json:"per_page"`
	Total   int64 `json:"total"`
}

// OK sends a 200 success response.
func OK(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, APIResponse{Success: true, Message: message, Data: data})
}

// Created sends a 201 created response.
func Created(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusCreated, APIResponse{Success: true, Message: message, Data: data})
}

// OKWithMeta sends a 200 success response with pagination meta.
func OKWithMeta(c *gin.Context, message string, data interface{}, meta *Meta) {
	c.JSON(http.StatusOK, APIResponse{Success: true, Message: message, Data: data, Meta: meta})
}

// BadRequest sends a 400 error response.
func BadRequest(c *gin.Context, message string, errDetails interface{}) {
	c.JSON(http.StatusBadRequest, APIResponse{Success: false, Message: message, Error: errDetails})
}

// Unauthorized sends a 401 response.
func Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, APIResponse{Success: false, Message: message})
}

// Forbidden sends a 403 response.
func Forbidden(c *gin.Context, message string) {
	c.JSON(http.StatusForbidden, APIResponse{Success: false, Message: message})
}

// NotFound sends a 404 response.
func NotFound(c *gin.Context, message string) {
	c.JSON(http.StatusNotFound, APIResponse{Success: false, Message: message})
}

// Conflict sends a 409 response.
func Conflict(c *gin.Context, message string) {
	c.JSON(http.StatusConflict, APIResponse{Success: false, Message: message})
}

// InternalError sends a 500 response.
func InternalError(c *gin.Context, message string) {
	c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Message: message})
}

// UnprocessableEntity sends a 422 response.
func UnprocessableEntity(c *gin.Context, message string, errDetails interface{}) {
	c.JSON(http.StatusUnprocessableEntity, APIResponse{Success: false, Message: message, Error: errDetails})
}
