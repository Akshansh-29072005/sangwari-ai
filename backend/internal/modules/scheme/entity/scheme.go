package entity

import (
	"time"
)

// Scheme represents a government scheme available for citizens
type Scheme struct {
	ID               string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title            string    `gorm:"size:255;not null" json:"title"`
	Description      string    `gorm:"type:text;not null" json:"description"`
	EligibilityRules string    `gorm:"type:jsonb" json:"eligibility_rules"` // JSON representation of rules for AI/logic parsing
	Benefits         string    `gorm:"type:text" json:"benefits"`
	DocumentsNeeded  string    `gorm:"type:jsonb" json:"documents_needed"` // JSON list of document IDs or names needed
	FormFields       string    `gorm:"type:jsonb" json:"form_fields"`      // Array of required fields for applying to this scheme
	IsActive         bool      `gorm:"default:true" json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// SchemeRule represents a condition for eligibility evaluated by the Python AI Layer
type SchemeRule struct {
	ID        string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	SchemeID  string `gorm:"type:uuid;index"`
	FieldName string `gorm:"size:100;not null"`
	Condition string `gorm:"size:20;not null"`
	Value     string `gorm:"size:255;not null"`
}
