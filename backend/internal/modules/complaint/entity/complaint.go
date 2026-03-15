package entity

import (
	"time"

	"github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/user/entity"
)

// Complaint represents a citizen grievance
type Complaint struct {
	ID          string      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID      string      `gorm:"type:uuid;not null;index" json:"user_id"`
	User        entity.User `gorm:"foreignKey:UserID" json:"-"`
	Title       string      `gorm:"size:255;not null" json:"title"`
	Description string      `gorm:"type:text;not null" json:"description"`
	Category    string      `gorm:"size:100;not null" json:"category"`    // e.g., Water, Road, Electricity
	Department  string      `gorm:"size:100" json:"department"`             // Assigned department via AI
	Status                  string      `gorm:"size:50;default:'pending'" json:"status"` // pending, processing, resolved, rejected
	MediaURLs               string      `gorm:"type:jsonb;default:'[]'" json:"media_urls"`   // URLs to photos/videos — default valid JSON
	EstimatedResolutionDays int         `gorm:"default:0" json:"estimated_resolution_days"`                 // Predicted days to resolve
	ResolvedAt              *time.Time  `gorm:"index" json:"resolved_at"`                     // Actual resolution time
	CreatedAt               time.Time   `json:"created_at"`
	UpdatedAt               time.Time   `json:"updated_at"`
}

// ComplaintTimeline tracks status updates over time
type ComplaintTimeline struct {
	ID          string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ComplaintID string    `gorm:"type:uuid;not null;index"`
	Status      string    `gorm:"size:50;not null"`
	Notes       string    `gorm:"type:text"`
	CreatedAt   time.Time
}
