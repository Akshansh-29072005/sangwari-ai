package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"

	jwtpkg "github.com/Akshansh-29072005/sangwari-ai/backend/platform/jwt"
	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/response"
)

// AuthRequired is a JWT Bearer token validation middleware.
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "Authorization header required")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			response.Unauthorized(c, "Authorization header must be in format: Bearer <token>")
			c.Abort()
			return
		}

		claims, err := jwtpkg.Verify(parts[1])
		if err != nil {
			log.Warn().Err(err).Str("ip", c.ClientIP()).Msg("Invalid JWT token")
			response.Unauthorized(c, "Invalid or expired token")
			c.Abort()
			return
		}

		// Store claims in context for downstream handlers
		c.Set("user_id", claims.UserID)
		c.Set("user_phone", claims.Phone)
		c.Set("user_role", claims.Role)
		c.Next()
	}
}

// OptionalAuth extracts user_id if token is present/valid, but doesn't abort if missing.
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
			claims, err := jwtpkg.Verify(parts[1])
			if err == nil {
				c.Set("user_id", claims.UserID)
				c.Set("user_phone", claims.Phone)
				c.Set("user_role", claims.Role)
			}
		}
		c.Next()
	}
}

// AdminRequired ensures the user has admin role.
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists || role != "admin" {
			response.Forbidden(c, "Admin access required")
			c.Abort()
			return
		}
		c.Next()
	}
}
