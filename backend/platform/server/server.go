package server

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/ai"
	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/application"
	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/complaint"
	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/document"
	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/notification"
	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/scheme"
	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/user"
	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/voice"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/middleware"
)

// NewServer initializes the Gin engine with all platform middleware and registers routes.
func NewServer(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)

	r := gin.New()

	// 1. Global Middleware
	r.Use(gin.Recovery())
	r.Use(middleware.RequestLogger())
	r.Use(middleware.CORS())
	r.Use(middleware.RateLimiter("100-M"))
	r.Use(middleware.SanitizePayload())

	// 2. Health & Ready (at root)
	healthHandler := NewHealthHandler(db)
	r.GET("/health", healthHandler.Health)
	r.GET("/ready", healthHandler.Ready)

	// 3. Serve uploaded files (profile pics, documents) as static assets
	r.Static("/uploads", "./uploads")

	// 3. Root-level API routes (frontend calls without /api/v1 prefix)
	root := r.Group("")
	{
		user.RegisterRoutes(root, db)         // /auth/*, /user/*
		scheme.RegisterRoutes(root, db)       // /schemes/*
		complaint.RegisterRoutes(root, db)    // /complaints/*
		voice.RegisterRoutes(root, db)        // /voice/*
		application.RegisterRoutes(root, db)  // /applications/*
		notification.RegisterRoutes(root, db) // /notifications/*
		document.RegisterRoutes(root, db)     // /documents/*
		ai.RegisterRoutes(root, db)           // /ai/*
	}

	return r
}
