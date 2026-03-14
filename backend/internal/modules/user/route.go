package user

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/user/handler"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/middleware"
)

// RegisterRoutes sets up all user module endpoints to match frontend API:
//
//	/auth/send-otp, /auth/verify-otp, /auth/set-mpin, /auth/login, /auth/change-mpin
//	/user/profile, /user/documents, /user/preferences/language, /user/profile-pic
func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB) {
	h := handler.NewUserHandler(db)

	// Public auth routes
	auth := rg.Group("/auth")
	{
		auth.POST("/send-otp", h.SendOTP)
		auth.POST("/verify-otp", h.VerifyOTP)
		auth.POST("/set-mpin", h.SetMPIN)
		auth.POST("/login", h.Login)
		auth.POST("/change-mpin", middleware.AuthRequired(), h.ChangeMPIN)
	}

	// Protected user routes
	user := rg.Group("/user")
	user.Use(middleware.AuthRequired())
	{
		user.GET("/profile", h.GetProfile)
		user.PUT("/profile", h.UpdateProfile)
		user.GET("/documents", h.GetDocuments)
		user.POST("/documents/upload", h.UploadDocument)
		user.PUT("/preferences/language", h.SetLanguage)
		user.POST("/profile-pic", h.UploadProfilePic)
		user.GET("/profile-pic", h.GetProfilePic)
	}
}
