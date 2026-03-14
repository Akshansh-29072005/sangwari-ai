package entity

import (
	"time"

	userEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/user/entity"
)

// Document represents an uploaded file by a citizen (Aadhar, Income cert, etc)
type Document struct {
	ID        string          `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID    string          `gorm:"type:uuid;not null;index"`
	User      userEntity.User `gorm:"foreignKey:UserID"`
	Type      string          `gorm:"size:100;not null"` // aadhar, income_certificate, etc
	FileURL   string          `gorm:"type:text;not null"`
	IsVerified bool           `gorm:"default:false"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
