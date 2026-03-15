package database

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/google/uuid"

	"github.com/rs/zerolog/log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"

	applicationEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/application/entity"
	complaintEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/complaint/entity"
	documentEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/document/entity"
	notificationEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/notification/entity"
	schemeEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/scheme/entity"
	userEntity "github.com/Akshansh-29072005/sangwari-ai/backend/internal/modules/user/entity"
)

// Connect establishes a Gorm DB connection.
func Connect() (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=UTC",
		os.Getenv("DB_HOST"), // sangwari_postgres
		os.Getenv("DB_PORT"), // 5432
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Warn),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		return nil, fmt.Errorf("database connection failed: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)
	sqlDB.SetConnMaxIdleTime(2 * time.Minute)

	log.Info().Msg("Database connected successfully")
	return db, nil
}

// Migrate runs auto-migration for all entities and seeds initial data.
func Migrate(db *gorm.DB) error {
	log.Info().Msg("Running database migrations...")
	err := db.AutoMigrate(
		&userEntity.User{},
		&userEntity.OTPRecord{},
		&schemeEntity.Scheme{},
		&schemeEntity.SchemeRule{},
		&complaintEntity.Complaint{},
		&complaintEntity.ComplaintTimeline{},
		&applicationEntity.Application{},
		&notificationEntity.Notification{},
		&documentEntity.Document{},
	)
	if err != nil {
		return fmt.Errorf("migration failed: %w", err)
	}

	// Seed schemes if empty
	var count int64
	db.Model(&schemeEntity.Scheme{}).Count(&count)
	if count == 0 {
		log.Info().Msg("Seeding initial schemes...")
		emptyRules, _ := json.Marshal(map[string]interface{}{})
		emptyDocs, _ := json.Marshal([]string{})
		
		// Define form fields for different kinds of schemes
		basicFields, _ := json.Marshal([]map[string]interface{}{
			{"name": "aadhar_number", "label": "Aadhar Number", "type": "text", "required": true, "regex": "^[0-9]{12}$"},
			{"name": "income_certificate", "label": "Income Certificate No", "type": "text", "required": true},
			{"name": "bank_account", "label": "Bank Account No", "type": "text", "required": true},
		})
		
		healthFields, _ := json.Marshal([]map[string]interface{}{
			{"name": "aadhar_number", "label": "Aadhar Number", "type": "text", "required": true, "regex": "^[0-9]{12}$"},
			{"name": "ration_card", "label": "Ration Card No", "type": "text", "required": true},
		})

		businessFields, _ := json.Marshal([]map[string]interface{}{
			{"name": "aadhar_number", "label": "Aadhar Number", "type": "text", "required": true, "regex": "^[0-9]{12}$"},
			{"name": "business_reg_no", "label": "Business Registration No", "type": "text", "required": true},
			{"name": "project_cost", "label": "Estimated Project Cost", "type": "number", "required": true},
		})

		schemes := []schemeEntity.Scheme{
			{ID: uuid.New().String(), Title: "Kisan Samman Nidhi", Description: "Financial support for farmers", EligibilityRules: string(emptyRules), Benefits: "6000 per year", DocumentsNeeded: string(emptyDocs), FormFields: string(basicFields), IsActive: true},
			{ID: uuid.New().String(), Title: "Mitanin Yojana", Description: "Health worker support program", EligibilityRules: string(emptyRules), Benefits: "Monthly incentive", DocumentsNeeded: string(emptyDocs), FormFields: string(healthFields), IsActive: true},
			{ID: uuid.New().String(), Title: "PM Awas Yojana", Description: "Housing for rural & urban poor", EligibilityRules: string(emptyRules), Benefits: "Subsidy for home construction", DocumentsNeeded: string(emptyDocs), FormFields: string(basicFields), IsActive: true},
			{ID: uuid.New().String(), Title: "Ayushman Bharat", Description: "Health insurance up to ₹5 lakh", EligibilityRules: string(emptyRules), Benefits: "Free treatment up to 5 lakh", DocumentsNeeded: string(emptyDocs), FormFields: string(healthFields), IsActive: true},
			{ID: uuid.New().String(), Title: "PM Vishwakarma Yojana", Description: "Support for traditional artisans", EligibilityRules: string(emptyRules), Benefits: "Credit support and skill training", DocumentsNeeded: string(emptyDocs), FormFields: string(businessFields), IsActive: true},
			{ID: uuid.New().String(), Title: "PM Mudra Yojana", Description: "Loans up to ₹10 lakh for small business", EligibilityRules: string(emptyRules), Benefits: "Collateral free loans", DocumentsNeeded: string(emptyDocs), FormFields: string(businessFields), IsActive: true},
			{ID: uuid.New().String(), Title: "PM Ujjwala Yojana", Description: "Free LPG connections for BPL families", EligibilityRules: string(emptyRules), Benefits: "Free LPG connection", DocumentsNeeded: string(emptyDocs), FormFields: string(basicFields), IsActive: true},
			{ID: uuid.New().String(), Title: "Jan Dhan Yojana", Description: "Bank accounts with zero balance & insurance", EligibilityRules: string(emptyRules), Benefits: "Zero balance account", DocumentsNeeded: string(emptyDocs), FormFields: string(basicFields), IsActive: true},
			// Added from CSV
			{ID: uuid.New().String(), Title: "Old Age Pension", Description: "Monthly pension provided to citizens above 60 years with low income", EligibilityRules: string(emptyRules), Benefits: "Monthly pension", DocumentsNeeded: string(emptyDocs), FormFields: string(basicFields), IsActive: true},
			{ID: uuid.New().String(), Title: "Widow Pension", Description: "Financial assistance given to widowed women", EligibilityRules: string(emptyRules), Benefits: "Financial assistance", DocumentsNeeded: string(emptyDocs), FormFields: string(basicFields), IsActive: true},
			{ID: uuid.New().String(), Title: "Civil Service Income Benefits", Description: "Income-based financial relief scheme for civil service roles", EligibilityRules: string(emptyRules), Benefits: "Income supplement", DocumentsNeeded: string(emptyDocs), FormFields: string(basicFields), IsActive: true},
			{ID: uuid.New().String(), Title: "Scholarships", Description: "Educational scholarships for students", EligibilityRules: string(emptyRules), Benefits: "Annual scholarship", DocumentsNeeded: string(emptyDocs), FormFields: string(basicFields), IsActive: true},
			{ID: uuid.New().String(), Title: "Family Assistance Scheme", Description: "One-time financial assistance provided to families below poverty line", EligibilityRules: string(emptyRules), Benefits: "One-time assistance", DocumentsNeeded: string(emptyDocs), FormFields: string(basicFields), IsActive: true},
		}

		for _, s := range schemes {
			db.Create(&s)
		}
		
		log.Info().Msg("Seeding eligibility rules...")
		seedRules(db)
	}

	// Seed users from citizens_master.csv if empty
	var userCount int64
	db.Model(&userEntity.User{}).Count(&userCount)
	if userCount == 0 {
		log.Info().Msg("Seeding initial users from citizens_master.csv...")
		seedUsersFromCSV(db, "../aiLayer/AI layer creation/datasets/citizens_master.csv")
	}

	log.Info().Msg("Database migrations completed")
	return nil
}

// seedUsersFromCSV reads the CSV file and inserts records into the DB
func seedUsersFromCSV(db *gorm.DB, filepath string) {
	file, err := os.Open(filepath)
	if err != nil {
		log.Warn().Err(err).Msg("Could not open citizens_master.csv for seeding")
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	
	// Read header
	_, err = reader.Read()
	if err != nil {
		log.Warn().Err(err).Msg("Failed to read CSV header")
		return
	}

	// Read records
	records, err := reader.ReadAll()
	if err != nil {
		log.Warn().Err(err).Msg("Failed to read CSV records")
		return
	}

	var users []userEntity.User
	for _, record := range records {
		if len(record) < 14 {
			continue // Skip malformed rows
		}

		// parse numeric fields
		age := 0
		fmt.Sscanf(record[3], "%d", &age)
		
		income := 0.0
		fmt.Sscanf(record[10], "%f", &income)

		user := userEntity.User{
			CitizenID:    record[0],
			Name:         record[1],
			DOB:          record[2],
			Age:          age,
			Gender:       record[4],
			District:     record[5],
			VillageCity:  record[6],
			Address:      record[7],
			Pincode:      record[8],
			Occupation:   record[9],
			AnnualIncome: income,
			Caste:        record[11],
			AadharNumber: record[12],
			Phone:        "+91" + record[13],
			Role:         "citizen",
			Language:     "en",
			IsVerified:   true, // Seeding them as verified
		}
		users = append(users, user)
	}

	// Use CreateInBatches to handle 1000+ rows efficiently
	result := db.CreateInBatches(users, 100)
	if result.Error != nil {
		log.Error().Err(result.Error).Msg("Failed to bulk seed users")
	} else {
		log.Info().Int64("count", result.RowsAffected).Msg("Successfully seeded users from CSV")
	}
}

// seedRules dynamically maps 40 AI eligibility conditions to the auto-generated Scheme UUIDs
func seedRules(db *gorm.DB) {
	rulesMap := map[string][]schemeEntity.SchemeRule{
		"Old Age Pension": {
			{FieldName: "age", Condition: ">=", Value: "60"},
			{FieldName: "income", Condition: "<", Value: "200000"},
			{FieldName: "caste", Condition: "in", Value: "SC,ST,OBC,General"},
			{FieldName: "occupation", Condition: "!=", Value: "Government Employee"},
		},
		"Widow Pension": {
			{FieldName: "gender", Condition: "==", Value: "female"},
			{FieldName: "spouse_dead", Condition: "==", Value: "true"},
			{FieldName: "income", Condition: "<", Value: "180000"},
			{FieldName: "age", Condition: ">=", Value: "18"},
		},
		"Civil Service Income Benefits": {
			{FieldName: "occupation", Condition: "==", Value: "Government Employee"},
			{FieldName: "income", Condition: "<", Value: "350000"},
			{FieldName: "age", Condition: ">=", Value: "21"},
			{FieldName: "caste", Condition: "in", Value: "SC,ST,OBC"},
		},
		"Scholarships": {
			{FieldName: "is_student", Condition: "==", Value: "true"},
			{FieldName: "income", Condition: "<", Value: "300000"},
			{FieldName: "age", Condition: ">=", Value: "14"},
			{FieldName: "age", Condition: "<=", Value: "28"},
		},
		"Family Assistance Scheme": {
			{FieldName: "income", Condition: "<", Value: "150000"},
			{FieldName: "age", Condition: ">=", Value: "18"},
			{FieldName: "caste", Condition: "in", Value: "SC,ST,OBC"},
			{FieldName: "occupation", Condition: "in", Value: "Farmer,Labour,Unemployed"},
		},
		"Ayushman Bharat": {
			{FieldName: "income", Condition: "<", Value: "500000"},
			{FieldName: "age", Condition: ">=", Value: "18"},
		},
		"Jan Dhan Yojana": {
			{FieldName: "income", Condition: "<", Value: "300000"},
			{FieldName: "age", Condition: ">=", Value: "18"},
		},
		"Kisan Samman Nidhi": {
			{FieldName: "occupation", Condition: "in", Value: "Farmer,Agriculture"},
			{FieldName: "age", Condition: ">=", Value: "18"},
		},
		"Mitanin Yojana": {
			{FieldName: "gender", Condition: "==", Value: "female"},
			{FieldName: "age", Condition: ">=", Value: "25"},
			{FieldName: "age", Condition: "<=", Value: "50"},
		},
		"PM Awas Yojana": {
			{FieldName: "income", Condition: "<", Value: "300000"},
			{FieldName: "age", Condition: ">=", Value: "21"},
		},
		"PM Mudra Yojana": {
			{FieldName: "occupation", Condition: "in", Value: "Self-Employed,Business,Farmer"},
			{FieldName: "age", Condition: ">=", Value: "18"},
			{FieldName: "income", Condition: "<", Value: "1000000"},
		},
		"PM Ujjwala Yojana": {
			{FieldName: "gender", Condition: "==", Value: "female"},
			{FieldName: "income", Condition: "<", Value: "200000"},
			{FieldName: "age", Condition: ">=", Value: "18"},
		},
		"PM Vishwakarma Yojana": {
			{FieldName: "occupation", Condition: "in", Value: "Artisan,Craftsman,Self-Employed,Carpenter,Blacksmith,Potter"},
			{FieldName: "age", Condition: ">=", Value: "18"},
			{FieldName: "income", Condition: "<", Value: "500000"},
		},
	}

	for title, rules := range rulesMap {
		var s schemeEntity.Scheme
		if err := db.Where("title = ?", title).First(&s).Error; err == nil {
			for _, r := range rules {
				r.ID = uuid.New().String()
				r.SchemeID = s.ID
				db.Create(&r)
			}
		}
	}
	log.Info().Msg("AI scheme rules seeded successfully")
}
