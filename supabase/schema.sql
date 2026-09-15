-- ==============================================================================
-- 🌱 KisaanSathi - PostgreSQL & Supabase Database Schema
-- Smart Farmer Procurement & Crop Tracking Platform
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. FARMERS TABLE
CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    aadhar_last4 VARCHAR(4),
    bank_name VARCHAR(100) DEFAULT 'State Bank of India',
    account_number VARCHAR(30) DEFAULT 'XXXXXX4892',
    ifsc_code VARCHAR(20) DEFAULT 'SBIN0001248',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROCUREMENT CENTERS TABLE
CREATE TABLE IF NOT EXISTS procurement_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_name VARCHAR(200) NOT NULL,
    location VARCHAR(200) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    daily_capacity NUMERIC(10, 2) NOT NULL DEFAULT 500.00, -- in Quintals
    current_capacity NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'full', 'maintenance'
    contact_phone VARCHAR(20),
    operating_hours VARCHAR(100) DEFAULT '08:00 AM - 06:00 PM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    procurement_center_id UUID REFERENCES procurement_centers(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'quality_inspector', -- 'weighing_officer', 'quality_inspector', 'center_manager', 'operator'
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'superadmin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CROPS TABLE
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(100) NOT NULL,
    crop_code VARCHAR(30) UNIQUE NOT NULL,
    msp_price NUMERIC(10, 2) NOT NULL, -- Rupees per Quintal
    max_moisture_limit NUMERIC(5, 2) NOT NULL DEFAULT 12.00, -- Maximum acceptable moisture %
    moisture_deduction_rate NUMERIC(6, 2) NOT NULL DEFAULT 25.00, -- Rs deduction per 0.5% over limit
    season VARCHAR(50) NOT NULL DEFAULT 'Rabi 2025-26',
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    variety VARCHAR(100) DEFAULT 'FAQ Standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TOKENS TABLE (Procurement Token & Gate Pass)
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_number VARCHAR(50) UNIQUE NOT NULL,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE RESTRICT,
    center_id UUID NOT NULL REFERENCES procurement_centers(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
    slot_time VARCHAR(50) NOT NULL,
    estimated_quantity_qtl NUMERIC(10, 2) NOT NULL,
    vehicle_number VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(50) DEFAULT 'Tractor Trolley',
    status VARCHAR(50) NOT NULL DEFAULT 'BOOKED', 
    -- 'BOOKED', 'GATE_ARRIVED', 'WEIGHED', 'QUALITY_CHECKED', 'ACCEPTED', 'REJECTED', 'DISPATCHED', 'PAYMENT_PROCESSED'
    queue_number INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. WEIGHING RECORDS TABLE
CREATE TABLE IF NOT EXISTS weighing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID UNIQUE NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
    gross_weight_kg NUMERIC(10, 2) NOT NULL,
    tare_weight_kg NUMERIC(10, 2) NOT NULL,
    net_weight_kg NUMERIC(10, 2) NOT NULL,
    net_weight_qtl NUMERIC(10, 2) NOT NULL,
    weighed_by_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    scale_slip_no VARCHAR(50) NOT NULL,
    weighed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. QUALITY CHECKS TABLE
CREATE TABLE IF NOT EXISTS quality_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID UNIQUE NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
    moisture_percentage NUMERIC(5, 2) NOT NULL,
    foreign_matter_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.5,
    damaged_grains_pct NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
    grain_grade VARCHAR(50) NOT NULL DEFAULT 'FAQ (Fair Average Quality)',
    is_acceptable BOOLEAN NOT NULL DEFAULT true,
    min_moisture_req NUMERIC(5, 2) DEFAULT 10.00,
    max_moisture_limit NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
    deduction_percentage NUMERIC(5, 2) DEFAULT 0.00,
    deduction_amount_per_qtl NUMERIC(8, 2) DEFAULT 0.00,
    checked_by_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    remarks TEXT,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PAYMENTS TABLE (Direct Benefit Transfer - DBT)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID UNIQUE NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    gross_amount NUMERIC(12, 2) NOT NULL,
    deduction_amount NUMERIC(10, 2) DEFAULT 0.00,
    net_payable NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'INITIATED', 'PROCESSED', 'CREDITED', 'FAILED'
    utr_number VARCHAR(50),
    bank_name VARCHAR(100) NOT NULL,
    account_number_masked VARCHAR(30) NOT NULL,
    ifsc VARCHAR(20) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    credited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_type VARCHAR(20) NOT NULL, -- 'farmer', 'staff', 'admin', 'all'
    recipient_id UUID,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'system',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. DISPATCH RECORDS TABLE
CREATE TABLE IF NOT EXISTS dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID UNIQUE NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
    warehouse_name VARCHAR(150) NOT NULL,
    truck_no VARCHAR(30) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    dispatched_by_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. INDEXES FOR HIGH-SPEED PROCUREMENT LOOKUPS
CREATE INDEX IF NOT EXISTS idx_farmers_mobile ON farmers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_tokens_farmer_id ON tokens(farmer_id);
CREATE INDEX IF NOT EXISTS idx_tokens_center_id ON tokens(center_id);
CREATE INDEX IF NOT EXISTS idx_tokens_booking_date ON tokens(booking_date);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens(status);
CREATE INDEX IF NOT EXISTS idx_payments_token ON payments(token_id);
CREATE INDEX IF NOT EXISTS idx_payments_farmer ON payments(farmer_id);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE weighing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read for center and crop directories
CREATE POLICY "Public can view centers" ON procurement_centers FOR SELECT USING (true);
CREATE POLICY "Public can view crops" ON crops FOR SELECT USING (true);

-- Farmers can view their own tokens and payments
CREATE POLICY "Farmers can read own tokens" ON tokens FOR SELECT USING (true);
CREATE POLICY "Farmers can book tokens" ON tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Farmers can view own payments" ON payments FOR SELECT USING (true);
