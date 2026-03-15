package middleware

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	"github.com/ulule/limiter/v3/drivers/store/memory"

	"github.com/Akshansh-29072005/sangwari-ai/backend/platform/response"
)

// RateLimiter creates a new token bucket rate limiter middleware.
func RateLimiter(formattedRate string) gin.HandlerFunc {
	// Parse rate (e.g., "5-S", "10-M", "1000-H")
	rate, err := limiter.NewRateFromFormatted(formattedRate)
	if err != nil {
		panic(err)
	}

	store := memory.NewStore()
	instance := limiter.New(store, rate)

	return func(c *gin.Context) {
		// Use IP address as the key for limit tracking
		key := c.ClientIP()
		context, err := instance.Get(c, key)
		if err != nil {
			response.InternalError(c, "Rate limit check failed")
			c.Abort()
			return
		}

		c.Header("X-RateLimit-Limit", strconv.FormatInt(context.Limit, 10))
		c.Header("X-RateLimit-Remaining", strconv.FormatInt(context.Remaining, 10))
		c.Header("X-RateLimit-Reset", strconv.FormatInt(context.Reset, 10))

		if context.Reached {
			c.AbortWithStatusJSON(429, response.APIResponse{
				Success: false,
				Message: "Too Many Requests",
				Error:   "Rate limit exceeded. Try again later.",
			})
			return
		}

		c.Next()
	}
}
