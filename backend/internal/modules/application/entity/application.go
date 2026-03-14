package entity

import (
	"time"

	schemeEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/scheme/entity"
	userEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/user/entity"
)

// Application represents a citizen's application for a specific government scheme.
type Application struct {
	ID        string              `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID    string              `gorm:"type:uuid;not null;index" json:"user_id"`
	User      userEntity.User     `gorm:"foreignKey:UserID" json:"-"`
	SchemeID  string              `gorm:"type:uuid;not null;index" json:"scheme_id"`
	Scheme    schemeEntity.Scheme `gorm:"foreignKey:SchemeID" json:"scheme"`
	Status                  string              `gorm:"size:50;default:'submitted'" json:"status"` // submitted, under_review, approved, rejected
	FormData                string              `gorm:"type:jsonb" json:"form_data"`                  // Raw form submission data
	Remarks                 string              `gorm:"type:text" json:"remarks"`                   // Admin remarks
	EstimatedResolutionDays int                 `gorm:"default:0" json:"estimated_resolution_days"`                   // Predicted days to resolve
	ResolvedAt              *time.Time          `gorm:"index" json:"resolved_at"`                       // Actual resolution time
	CreatedAt               time.Time           `json:"created_at"`
	UpdatedAt               time.Time           `json:"updated_at"`
}
