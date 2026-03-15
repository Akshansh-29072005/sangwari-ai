package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"mime/multipart"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/response"
	"github.com/rs/zerolog/log"
)

// VoiceHandler handles voice assistant API endpoints.
type VoiceHandler struct {
	db *gorm.DB
}

func NewVoiceHandler(db *gorm.DB) *VoiceHandler {
	return &VoiceHandler{db: db}
}

func aiLayerURL() string {
	u := os.Getenv("AI_LAYER_URL")
	if u == "" {
		return "http://localhost:8001"
	}
	return u
}

// POST /voice/classify-intent — determine user intent from transcription
// Deprecated: Moving all logic to /voice/process for efficiency
func (h *VoiceHandler) ClassifyIntent(c *gin.Context) {
	h.GetVoiceResponse(c)
}

// POST /voice/respond — handle audio file upload and forward to AI layer
func (h *VoiceHandler) GetVoiceResponse(c *gin.Context) {
	log.Info().Msg("Received /voice/respond request")
	// Multipart form parsing
	form, err := c.MultipartForm()
	if err != nil {
		response.BadRequest(c, "Failed to parse multipart form", err)
		return
	}

	files := form.File["audio"]
	if len(files) == 0 {
		response.BadRequest(c, "Audio file is required", nil)
		return
	}

	language := c.PostForm("language")
	if language == "" {
		language = "hi"
	}

	file, err := files[0].Open()
	if err != nil {
		response.InternalError(c, "Failed to open audio file")
		return
	}
	defer file.Close()

	// Create buffer for proxying
	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	// Add audio file
	part, err := writer.CreateFormFile("file", files[0].Filename)
	if err != nil {
		response.InternalError(c, "Failed to create form file")
		return
	}
	if _, err := io.Copy(part, file); err != nil {
		response.InternalError(c, "Failed to copy audio content")
		return
	}

	// Add language field
	if err := writer.WriteField("language", language); err != nil {
		response.InternalError(c, "Failed to add language field")
		return
	}
	writer.Close()

	// Forward to AI Layer /voice/process-audio
	url := fmt.Sprintf("%s/voice/process-audio", aiLayerURL())
	req, err := http.NewRequest("POST", url, &requestBody)
	if err != nil {
		response.InternalError(c, "Failed to create proxy request")
		return
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		response.InternalError(c, "AI Layer unreachable")
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var aiResult struct {
		Success bool   `json:"success"`
		Error   string `json:"error"`
		Data    struct {
			Intent        string `json:"intent"`
			Reply         string `json:"reply"`
			Transcription string `json:"transcription"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &aiResult); err != nil {
		log.Error().Err(err).Str("body", string(body)).Msg("Failed to parse AI response")
		response.InternalError(c, "Failed to parse AI response from intelligence layer")
		return
	}

	if !aiResult.Success {
		log.Warn().Str("error", aiResult.Error).Msg("AI Layer returned failure")
		response.BadRequest(c, aiResult.Error, nil)
		return
	}

	log.Info().Str("intent", aiResult.Data.Intent).Msg("Voice response generated successfully")
	response.OK(c, "Voice response generated", aiResult.Data)
}
