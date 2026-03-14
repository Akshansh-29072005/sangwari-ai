-- Sangwari AI — Initial Database Migration
-- This is a reference file. GORM AutoMigrate handles DDL automatically.
-- Use this for manual migrations, seeding, or if you switch to a migration tool.

-- ============================================
-- USERS & AUTH
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name          VARCHAR(255),
    phone         VARCHAR(20) UNIQUE NOT NULL,
    mpin_hash     VARCHAR(255),
    role          VARCHAR(50) DEFAULT 'citizen',
    language      VARCHAR(10) DEFAULT 'en',
    profile_pic_url VARCHAR(500),
    is_verified   BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_records (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone      VARCHAR(20) NOT NULL,
    otp        VARCHAR(10) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_records_phone ON otp_records(phone);

-- ============================================
-- SCHEMES
-- ============================================

CREATE TABLE IF NOT EXISTS schemes (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title             VARCHAR(255) NOT NULL,
    description       TEXT NOT NULL,
    eligibility_rules JSONB,
    benefits          TEXT,
    documents_needed  JSONB,
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPLAINTS
-- ============================================

CREATE TABLE IF NOT EXISTS complaints (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id),
    title       VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category    VARCHAR(100) NOT NULL,
    department  VARCHAR(100),
    status      VARCHAR(50) DEFAULT 'pending',
    media_ur_ls JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);

CREATE TABLE IF NOT EXISTS complaint_timelines (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    status       VARCHAR(50) NOT NULL,
    notes        TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_complaint_timelines_complaint_id ON complaint_timelines(complaint_id);

-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS applications (
    id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id   UUID NOT NULL REFERENCES users(id),
    scheme_id UUID NOT NULL REFERENCES schemes(id),
    status    VARCHAR(50) DEFAULT 'submitted',
    form_data JSONB,
    remarks   TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme_id ON applications(scheme_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES users(id),
    title      VARCHAR(255) NOT NULL,
    message    TEXT NOT NULL,
    type       VARCHAR(50) NOT NULL,
    action_url VARCHAR(500),
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ============================================
-- DOCUMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS documents (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id),
    type        VARCHAR(100) NOT NULL,
    file_url    TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
