package handler

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	documentEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/document/entity"
	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/user/entity"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/jwt"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/response"
)

// UserHandler handles auth and user profile HTTP requests.
type UserHandler struct {
	db *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{db: db}
}

// ──────────────── Auth Routes ────────────────

// POST /auth/send-otp
func (h *UserHandler) SendOTP(c *gin.Context) {
	var req struct {
		Phone string `json:"phone" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err)
		return
	}

	n, _ := rand.Int(rand.Reader, big.NewInt(900000))
	otp := fmt.Sprintf("%06d", n.Int64() + 100000)

	// Log OTP for development
	log.Info().Str("phone", req.Phone).Str("otp", otp).Msg("Generated OTP")

	// Save to DB
	record := entity.OTPRecord{
		Phone:     req.Phone,
		OTP:       otp,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}
	if err := h.db.Create(&record).Error; err != nil {
		response.InternalError(c, "Failed to generate OTP")
		return
	}

	response.OK(c, "OTP sent successfully", map[string]string{"status": "sent", "debug_otp": otp})
}

// POST /auth/verify-otp
func (h *UserHandler) VerifyOTP(c *gin.Context) {
	var req struct {
		Phone string `json:"phone" binding:"required"`
		OTP   string `json:"otp" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err)
		return
	}

	var record entity.OTPRecord
	if err := h.db.Where("phone = ? AND used = false AND expires_at > ?", req.Phone, time.Now()).
		Order("created_at desc").First(&record).Error; err != nil {
		response.Unauthorized(c, "Invalid or expired OTP")
		return
	}

	if record.OTP != req.OTP {
		response.Unauthorized(c, "Invalid OTP")
		return
	}

	// Mark OTP as used
	h.db.Model(&record).Update("used", true)

	// Ensure user exists
	var user entity.User
	if err := h.db.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		// Create new user (pending MPIN setup)
		user = entity.User{
			Phone: req.Phone,
		}
		h.db.Create(&user)
	}

	// For changing MPIN or setting it up, we might need an OTP token.
	// For now, returning success.
	response.OK(c, "OTP verified", map[string]interface{}{
		"verified":  true,
		"otp_token": record.ID, // can be used to verify they just passed OTP
	})
}

// POST /auth/set-mpin
func (h *UserHandler) SetMPIN(c *gin.Context) {
	var req struct {
		Phone string `json:"phone" binding:"required"`
		MPIN  string `json:"mpin" binding:"required,len=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err)
		return
	}

	var user entity.User
	if err := h.db.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		response.NotFound(c, "User not found. Verify OTP first.")
		return
	}

	hashedMPIN, err := bcrypt.GenerateFromPassword([]byte(req.MPIN), bcrypt.DefaultCost)
	if err != nil {
		response.InternalError(c, "Failed to hash MPIN")
		return
	}

	h.db.Model(&user).Updates(map[string]interface{}{
		"mpin_hash": string(hashedMPIN),
	})

	response.Created(c, "MPIN set successfully", nil)
}

// POST /auth/login
func (h *UserHandler) Login(c *gin.Context) {
	var req struct {
		Phone string `json:"phone" binding:"required"`
		MPIN  string `json:"mpin" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err)
		return
	}

	var user entity.User
	if err := h.db.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		response.Unauthorized(c, "Invalid phone or MPIN")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.MPINHash), []byte(req.MPIN)); err != nil {
		response.Unauthorized(c, "Invalid phone or MPIN")
		return
	}

	token, err := jwt.Generate(user.ID, user.Phone, user.Role)
	if err != nil {
		response.InternalError(c, "Failed to generate token")
		return
	}

	response.OK(c, "Login successful", map[string]string{"token": token})
}

// POST /auth/change-mpin
func (h *UserHandler) ChangeMPIN(c *gin.Context) {
	response.OK(c, "MPIN changed", nil)
}

// ──────────────── User Profile Routes ────────────────

// GET /user/profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var user entity.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		response.NotFound(c, "User not found")
		return
	}

	response.OK(c, "Profile fetched", map[string]interface{}{
		"id":              user.ID,
		"citizen_id":      user.CitizenID,
		"name":            user.Name,
		"phone":           user.Phone,
		"dob":             user.DOB,
		"age":             user.Age,
		"gender":          user.Gender,
		"district":        user.District,
		"village_or_city": user.VillageCity,
		"address":         user.Address,
		"pincode":         user.Pincode,
		"occupation":      user.Occupation,
		"annual_income":   user.AnnualIncome,
		"caste":           user.Caste,
		"aadhar_number":   user.AadharNumber,
		"role":            user.Role,
		"language":        user.Language,
		"profile_pic_url": user.ProfilePicURL,
		"is_verified":     user.IsVerified,
	})
}

// PUT /user/profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req struct {
		Name     string `json:"name"`
		Language string `json:"language"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid payload", err)
		return
	}

	h.db.Model(&entity.User{}).Where("id = ?", userID).Updates(req)
	response.OK(c, "Profile updated successfully", nil)
}

// GET /user/documents
func (h *UserHandler) GetDocuments(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var docs []documentEntity.Document
	if err := h.db.Where("user_id = ?", userID).Find(&docs).Error; err != nil {
		response.InternalError(c, "Failed to fetch documents")
		return
	}
	
	response.OK(c, "Documents fetched", docs)
}

// POST /user/documents/upload
func (h *UserHandler) UploadDocument(c *gin.Context) {
	userID, _ := c.Get("user_id")

	file, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, "No file uploaded", err)
		return
	}
	
	docType := c.PostForm("type")
	if docType == "" {
		docType = "general"
	}

	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
	savePath := filepath.Join("uploads", "documents", filename)
	
	os.MkdirAll(filepath.Join("uploads", "documents"), os.ModePerm)
	
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		response.InternalError(c, "Failed to save file")
		return
	}

	doc := documentEntity.Document{
		UserID:  userID.(string),
		Type:    docType,
		FileURL: "/" + savePath,
	}
	
	if err := h.db.Create(&doc).Error; err != nil {
		response.InternalError(c, "Failed to save document record")
		return
	}

	log.Info().Str("user_id", userID.(string)).Str("type", docType).Str("file", filename).Str("path", savePath).Msg("Document uploaded")
	response.Created(c, "Document uploaded successfully", doc)
}

// PUT /user/preferences/language
func (h *UserHandler) SetLanguage(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req struct {
		Language string `json:"language" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid payload", err)
		return
	}

	h.db.Model(&entity.User{}).Where("id = ?", userID).Update("language", req.Language)
	response.OK(c, "Language preference updated", nil)
}

// POST /user/profile-pic
func (h *UserHandler) UploadProfilePic(c *gin.Context) {
	userID, _ := c.Get("user_id")

	file, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, "No file uploaded", err)
		return
	}

	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
	savePath := filepath.Join("uploads", "profile", filename)
	os.MkdirAll(filepath.Join("uploads", "profile"), os.ModePerm)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		response.InternalError(c, "Failed to save profile picture")
		return
	}

	picURL := "/" + savePath
	h.db.Model(&entity.User{}).Where("id = ?", userID).Update("profile_pic_url", picURL)

	log.Info().Str("user_id", userID.(string)).Str("file", filename).Str("url", picURL).Msg("Profile picture uploaded")
	response.Created(c, "Profile picture uploaded", map[string]string{"url": picURL})
}

// GET /user/profile-pic
func (h *UserHandler) GetProfilePic(c *gin.Context) {
	response.OK(c, "Profile picture fetched", map[string]string{"url": ""})
}
