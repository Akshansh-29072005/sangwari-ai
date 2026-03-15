package validator

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

// Validate is the singleton validator instance.
var Validate *validator.Validate

func init() {
	Validate = validator.New()
}

// FormatValidationErrors creates a user-friendly map of field errors.
func FormatValidationErrors(err error) map[string]string {
	errs := make(map[string]string)
	
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			// Convert "StructContext.Field" to "field"
			field := strings.ToLower(e.Field())
			errs[field] = getErrorMessage(e)
		}
	} else {
		errs["error"] = err.Error()
	}

	return errs
}

func getErrorMessage(e validator.FieldError) string {
	switch e.Tag() {
	case "required":
		return "This field is required"
	case "email":
		return "Invalid email format"
	case "min":
		return fmt.Sprintf("Must be at least %s characters", e.Param())
	case "max":
		return fmt.Sprintf("Must be at most %s characters", e.Param())
	case "gte":
		return fmt.Sprintf("Must be greater than or equal to %s", e.Param())
	case "lte":
		return fmt.Sprintf("Must be less than or equal to %s", e.Param())
	case "oneof":
		return fmt.Sprintf("Must be one of: %s", e.Param())
	default:
		return fmt.Sprintf("Invalid value (failed '%s' condition)", e.Tag())
	}
}
