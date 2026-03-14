package middleware

import (
	"bytes"
	"encoding/json"
	"io"

	"github.com/gin-gonic/gin"
	"github.com/microcosm-cc/bluemonday"
)

// SanitizePayload scrubs incoming JSON request bodies against XSS attacks.
func SanitizePayload() gin.HandlerFunc {
	policy := bluemonday.UGCPolicy()

	return func(c *gin.Context) {
		if c.Request.Body == nil {
			c.Next()
			return
		}

		// Read the body
		bodyBytes, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.Next()
			return
		}

		// Only process JSON
		if len(bodyBytes) > 0 && c.ContentType() == "application/json" {
			var payload map[string]interface{}
			if err := json.Unmarshal(bodyBytes, &payload); err == nil {
				// Sanitize string values
				sanitizeMap(payload, policy)

				// Re-encode JSON
				sanitizedBytes, _ := json.Marshal(payload)
				c.Request.Body = io.NopCloser(bytes.NewBuffer(sanitizedBytes))
			} else {
				// Put body back if we can't parse it
				c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
			}
		} else {
			c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		c.Next()
	}
}

func sanitizeMap(m map[string]interface{}, p *bluemonday.Policy) {
	for k, v := range m {
		switch val := v.(type) {
		case string:
			m[k] = p.Sanitize(val)
		case map[string]interface{}:
			sanitizeMap(val, p)
		case []interface{}:
			for i, item := range val {
				if strItem, ok := item.(string); ok {
					val[i] = p.Sanitize(strItem)
				} else if mapItem, ok := item.(map[string]interface{}); ok {
					sanitizeMap(mapItem, p)
				}
			}
		}
	}
}
