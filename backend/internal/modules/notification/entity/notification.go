package entity

import (
	"time"

	userEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/user/entity"
)

// Notification represents an alert sent to the citizen
type Notification struct {
	ID        string          `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID    string          `gorm:"type:uuid;not null;index" json:"user_id"`
	User      userEntity.User `gorm:"foreignKey:UserID" json:"-"`
	Title     string          `gorm:"size:255;not null" json:"title"`
	Message   string          `gorm:"type:text;not null" json:"message"`
	Type      string          `gorm:"size:50;not null" json:"type"` // success, info, alert
	ActionURL string          `gorm:"size:500" json:"action_url,omitempty"`
	IsRead    bool            `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time       `json:"created_at"`
}
