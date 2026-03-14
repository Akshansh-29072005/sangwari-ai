package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"

	applicationEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/application/entity"
	notificationEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/notification/entity"
	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/scheme/entity"
	userEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/user/entity"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/response"
)

type SchemeHandler struct {
	db *gorm.DB
}

func NewSchemeHandler(db *gorm.DB) *SchemeHandler {
	return &SchemeHandler{db: db}
}

// aiLayerURL returns the AI layer base URL from env or fallback
func aiLayerURL() string {
	u := os.Getenv("AI_LAYER_URL")
	if u == "" {
		return "http://localhost:8001"
	}
	return u
}
// predictSLA calls the Python AI layer to get estimated resolution days
func (h *SchemeHandler) predictSLA(text string) (int, error) {
	payload, _ := json.Marshal(map[string]string{"text": text})
	url := fmt.Sprintf("%s/predict-sla", aiLayerURL())

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(payload))
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, err
	}

	var result struct {
		Days int `json:"estimated_resolution_days"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return 0, err
	}

	return result.Days, nil
}

// GET /schemes/eligible — eligible schemes for the current user (calls AI layer)
func (h *SchemeHandler) GetEligibleSchemes(c *gin.Context) {
	uID, _ := c.Get("user_id")
	userID, ok := uID.(string)
	if !ok {
		response.Unauthorized(c, "Invalid user ID in context")
		return
	}

	results, err := h.fetchAIEligibility(userID)
	if err != nil {
		log.Warn().Err(err).Msg("AI eligibility failed, falling back")
		h.fallbackEligibleSchemes(c)
		return
	}

	response.OK(c, "Eligible schemes fetched", results)
}

// fetchAIEligibility calls the FastAPI layer to get eligibility results for a user
func (h *SchemeHandler) fetchAIEligibility(userID string) ([]map[string]interface{}, error) {
	// Fetch user profile from DB
	var user userEntity.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	// Build payload for AI layer /eligibility endpoint
	payload := map[string]interface{}{
		"name":           user.Name,
		"age":            user.Age,
		"gender":         strings.ToLower(user.Gender),
		"address":        user.Address,
		"district":       user.District,
		"income":         user.AnnualIncome,
		"occupation":     user.Occupation,
		"caste":          user.Caste,
		"is_student":     false,
		"spouse_dead":    false,
		"marital_status": "",
	}

	payloadBytes, _ := json.Marshal(payload)
	url := fmt.Sprintf("%s/eligibility", aiLayerURL())

	log.Info().Str("user_id", userID).Str("name", user.Name).Msg("Calling AI eligibility for user")

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI layer returned status %d: %s", resp.StatusCode, string(body))
	}

	var aiResult struct {
		Success bool `json:"success"`
		Data    []struct {
			SchemeID     string   `json:"scheme_id"`
			SchemeName   string   `json:"scheme_name"`
			Department   string   `json:"department"`
			IsEligible   bool     `json:"is_eligible"`
			MatchScore   float64  `json:"match_score"`
			UnmetReasons []string `json:"unmet_reasons"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &aiResult); err != nil {
		return nil, err
	}

	var results []map[string]interface{}
	for _, s := range aiResult.Data {
		matchStr := fmt.Sprintf("%.0f%%", s.MatchScore)
		results = append(results, map[string]interface{}{
			"id":            s.SchemeID,
			"name":          s.SchemeName,
			"desc":          "",
			"match":         matchStr,
			"eligible":      s.IsEligible,
			"category":      s.Department,
			"unmet_reasons": s.UnmetReasons,
		})
	}

	return results, nil
}

// fallbackEligibleSchemes returns all active schemes when AI layer is unavailable
func (h *SchemeHandler) fallbackEligibleSchemes(c *gin.Context) {
	var schemes []entity.Scheme
	if err := h.db.Where("is_active = ?", true).Find(&schemes).Error; err != nil {
		response.InternalError(c, "Failed to fetch schemes")
		return
	}

	var results []map[string]interface{}
	for _, s := range schemes {
		results = append(results, map[string]interface{}{
			"id":       s.ID,
			"name":     s.Title,
			"desc":     s.Description,
			"match":    "N/A",
			"eligible": true,
			"category": "Welfare",
		})
	}

	response.OK(c, "Eligible schemes fetched (fallback)", results)
}

// GET /schemes/registered — user's registered/active schemes
func (h *SchemeHandler) GetRegisteredSchemes(c *gin.Context) {
	response.OK(c, "Registered schemes fetched", []interface{}{})
}

// GET /schemes/:id — scheme details with form schema
func (h *SchemeHandler) GetSchemeByID(c *gin.Context) {
	schemeID := c.Param("id")
	var scheme entity.Scheme
	if err := h.db.First(&scheme, "id = ?", schemeID).Error; err != nil {
		response.NotFound(c, "Scheme not found")
		return
	}

	// If no form_fields are stored yet, use sensible defaults for govt. schemes
	if scheme.FormFields == "" || scheme.FormFields == "null" || scheme.FormFields == "[]" {
		h.db.Model(&scheme).Update("form_fields", `[
			{"name":"full_name","label":"Full Name","type":"text","required":true},
			{"name":"aadhar_number","label":"Aadhaar Number","type":"text","required":true},
			{"name":"annual_income","label":"Annual Income (₹)","type":"number","required":true},
			{"name":"village_or_city","label":"Village / City","type":"text","required":true},
			{"name":"district","label":"District","type":"text","required":true},
			{"name":"bank_account","label":"Bank Account Number","type":"text","required":false},
			{"name":"bank_ifsc","label":"IFSC Code","type":"text","required":false}
		]`)
		scheme.FormFields = "(see above)"
	}

	log.Info().Str("scheme_id", schemeID).Str("title", scheme.Title).Msg("Scheme detail fetched")
	response.OK(c, "Scheme fetched", map[string]interface{}{
		"id":                scheme.ID,
		"title":             scheme.Title,
		"description":       scheme.Description,
		"benefits":          scheme.Benefits,
		"documents_needed":  scheme.DocumentsNeeded,
		"form_fields":       scheme.FormFields,
		"eligibility_rules": scheme.EligibilityRules,
		"is_active":         scheme.IsActive,
	})
}

// GET /schemes/:id/form-schema — dynamic form for applying
func (h *SchemeHandler) GetFormSchema(c *gin.Context) {
	response.OK(c, "Form schema fetched", map[string]interface{}{
		"scheme_id": c.Param("id"),
		"fields":    []interface{}{},
	})
}

// POST /schemes/:id/apply — submit application
func (h *SchemeHandler) SubmitApplication(c *gin.Context) {
	uID, _ := c.Get("user_id")
	userID := uID.(string)
	schemeID := c.Param("id")

	var req struct {
		FormData interface{} `json:"form_data"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err)
		return
	}

	// Fetch scheme for SLA prediction
	var scheme entity.Scheme
	if err := h.db.First(&scheme, "id = ?", schemeID).Error; err != nil {
		response.NotFound(c, "Scheme not found")
		return
	}

	// Predict SLA
	slaDays, err := h.predictSLA(scheme.Description)
	if err != nil {
		log.Warn().Err(err).Msg("SLA prediction failed, using default")
		slaDays = 15
	}

	formDataJSON, _ := json.Marshal(req.FormData)

	application := applicationEntity.Application{
		UserID:                  userID,
		SchemeID:                schemeID,
		FormData:                string(formDataJSON),
		Status:                  "submitted",
		EstimatedResolutionDays: slaDays,
	}

	if err := h.db.Create(&application).Error; err != nil {
		response.InternalError(c, "Failed to persist application")
		return
	}

	// Create Notification
	notification := notificationEntity.Notification{
		UserID:  userID,
		Title:   "Scheme Application Submitted 📄",
		Message: fmt.Sprintf("Your application for '%s' has been received. Estimated processing time: %d days.", scheme.Title, slaDays),
		Type:    "success",
		IsRead:  false,
	}
	h.db.Create(&notification)

	response.Created(c, "Application submitted successfully", application)
}

// GET /schemes/applications/status — all application statuses
func (h *SchemeHandler) GetApplicationStatus(c *gin.Context) {
	response.OK(c, "Application statuses fetched", []interface{}{})
}

// GET /schemes/search?q= — search all schemes
func (h *SchemeHandler) SearchSchemes(c *gin.Context) {
	q := c.Query("q")
	if strings.TrimSpace(q) == "" {
		response.OK(c, "Search results", []interface{}{})
		return
	}

	// 1. Get all schemes matching search query from DB
	var dbSchemes []entity.Scheme
	query := "%" + strings.ToLower(q) + "%"
	if err := h.db.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", query, query).Find(&dbSchemes).Error; err != nil {
		response.InternalError(c, "Search failed")
		return
	}

	// 2. Identify if user is logged in
	uID, exists := c.Get("user_id")
	userID, isString := uID.(string)

	// 3. Fallback: If not logged in, return all results as ineligible
	if !exists || !isString {
		var results []map[string]interface{}
		for _, s := range dbSchemes {
			results = append(results, map[string]interface{}{
				"id":       s.ID,
				"name":     s.Title,
				"desc":     s.Description,
				"match":    "80%", // Search match placeholder
				"eligible": false, // Guest users are ineligible by default
				"category": "Welfare",
			})
		}
		response.OK(c, "Search results (guest)", results)
		return
	}

	// 4. If logged in, fetch real-time eligibility from AI layer
	aiEligibility, err := h.fetchAIEligibility(userID)
	if err != nil {
		log.Warn().Err(err).Msg("AI eligibility failed during search, returning basic info")
		// Fallback to DB results with false eligibility if AI is down
		var results []map[string]interface{}
		for _, s := range dbSchemes {
			results = append(results, map[string]interface{}{
				"id":       s.ID,
				"name":     s.Title,
				"desc":     s.Description,
				"match":    "80%",
				"eligible": false,
				"category": "Welfare",
			})
		}
		response.OK(c, "Search results (AI failed)", results)
		return
	}

	// 5. Cross-reference DB search results with AI eligibility
	eligibilityMap := make(map[string]map[string]interface{})
	for _, e := range aiEligibility {
		if id, ok := e["id"].(string); ok {
			eligibilityMap[id] = e
		}
	}

	var results []map[string]interface{}
	for _, s := range dbSchemes {
		if eligibleInfo, exists := eligibilityMap[s.ID]; exists {
			// Merge DB info with AI eligibility info
			results = append(results, map[string]interface{}{
				"id":            s.ID,
				"name":          s.Title,
				"desc":          s.Description,
				"match":         eligibleInfo["match"],
				"eligible":      eligibleInfo["eligible"],
				"category":      eligibleInfo["category"],
				"unmet_reasons": eligibleInfo["unmet_reasons"],
			})
		} else {
			// Scheme exists in DB match but wasn't returned by AI eligibility (edge case)
			results = append(results, map[string]interface{}{
				"id":       s.ID,
				"name":     s.Title,
				"desc":     s.Description,
				"match":    "0%",
				"eligible": false,
				"category": "Welfare",
			})
		}
	}

	response.OK(c, "Search results", results)
}
