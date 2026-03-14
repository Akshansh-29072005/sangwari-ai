package errors

import (
	"fmt"
	"net/http"
)

// AppError is the unified application error type.
type AppError struct {
	Code       string `json:"code"`
	Message    string `json:"message"`
	StatusCode int    `json:"-"`
}

func (e *AppError) Error() string {
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

// Common pre-defined errors
var (
	ErrNotFound          = &AppError{Code: "NOT_FOUND", Message: "Resource not found", StatusCode: http.StatusNotFound}
	ErrUnauthorized      = &AppError{Code: "UNAUTHORIZED", Message: "Authentication required", StatusCode: http.StatusUnauthorized}
	ErrForbidden         = &AppError{Code: "FORBIDDEN", Message: "Access denied", StatusCode: http.StatusForbidden}
	ErrBadRequest        = &AppError{Code: "BAD_REQUEST", Message: "Invalid request", StatusCode: http.StatusBadRequest}
	ErrConflict          = &AppError{Code: "CONFLICT", Message: "Resource already exists", StatusCode: http.StatusConflict}
	ErrInternalServer    = &AppError{Code: "INTERNAL_ERROR", Message: "Internal server error", StatusCode: http.StatusInternalServerError}
	ErrValidation        = &AppError{Code: "VALIDATION_ERROR", Message: "Validation failed", StatusCode: http.StatusUnprocessableEntity}
	ErrDatabaseOperation = &AppError{Code: "DB_ERROR", Message: "Database operation failed", StatusCode: http.StatusInternalServerError}
	ErrInvalidToken      = &AppError{Code: "INVALID_TOKEN", Message: "Invalid or expired token", StatusCode: http.StatusUnauthorized}
	ErrAIServiceDown     = &AppError{Code: "AI_SERVICE_UNAVAILABLE", Message: "AI service is temporarily unavailable", StatusCode: http.StatusServiceUnavailable}
)

// New creates a custom AppError.
func New(code, message string, statusCode int) *AppError {
	return &AppError{Code: code, Message: message, StatusCode: statusCode}
}

// Wrap wraps an existing error with additional context.
func Wrap(err error, code, message string, statusCode int) *AppError {
	return &AppError{
		Code:       code,
		Message:    fmt.Sprintf("%s: %s", message, err.Error()),
		StatusCode: statusCode,
	}
}
