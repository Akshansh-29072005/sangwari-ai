package entity

import (
	"time"
)

// User represents a citizen on the Sangwari AI platform.
// Auth is phone-based: OTP verification + MPIN for login.
type User struct {
	ID            string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CitizenID     string    `gorm:"size:50" json:"citizen_id"`                 // From citizens_master
	Name          string    `gorm:"size:255" json:"name"`                      // full_name
	Phone         string    `gorm:"size:20;uniqueIndex;not null" json:"phone"` // mobile_number
	DOB           string    `gorm:"size:50" json:"dob"`
	Age           int       `json:"age"`
	Gender        string    `gorm:"size:20" json:"gender"`
	District      string    `gorm:"size:100" json:"district"`
	VillageCity   string    `gorm:"size:100" json:"village_or_city"`
	Address       string    `gorm:"size:500" json:"address"`
	Pincode       string    `gorm:"size:20" json:"pincode"`
	Occupation    string    `gorm:"size:100" json:"occupation"`
	AnnualIncome  float64   `json:"annual_income"`
	Caste                    string    `gorm:"size:50" json:"caste"`
	AadharNumber             string    `gorm:"size:20" json:"aadhar_number"`
	PanNumber                string    `gorm:"size:20" json:"pan_number"`
	RationCardNumber         string    `gorm:"size:50" json:"ration_card_number"`
	DrivingLicenseNumber      string    `gorm:"size:50" json:"driving_license_number"`
	MPINHash                 string    `gorm:"size:255" json:"-"`                      // hashed 6-digit MPIN
	Role          string    `gorm:"size:50;default:'citizen'" json:"role"`  // citizen, admin
	Language      string    `gorm:"size:10;default:'en'" json:"language"`   // en, hi
	ProfilePicURL string    `gorm:"size:500" json:"profile_pic_url"`
	IsVerified    bool      `gorm:"default:false" json:"is_verified"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// OTPRecord stores temporary OTP for phone verification.
type OTPRecord struct {
	ID        string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Phone     string    `gorm:"size:20;not null;index"`
	OTP       string    `gorm:"size:10;not null"`
	ExpiresAt time.Time `gorm:"not null"`
	Used      bool      `gorm:"default:false"`
	CreatedAt time.Time
}
