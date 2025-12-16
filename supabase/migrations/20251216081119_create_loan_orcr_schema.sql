/*
  # Loan Application and OR/CR System Schema

  1. New Tables
    - `users` - System users with roles (admin, processor, viewer)
      - `id` (uuid, primary key) - Links to auth.users
      - `email` (text, unique) - User email
      - `full_name` (text) - User's full name
      - `role` (text) - User role: admin, processor, viewer
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `psgc_regions` - Philippine regions
      - `code` (text, primary key) - PSGC region code
      - `name` (text) - Region name

    - `psgc_provinces` - Philippine provinces
      - `code` (text, primary key) - PSGC province code
      - `name` (text) - Province name
      - `region_code` (text) - Foreign key to regions

    - `psgc_cities` - Philippine cities/municipalities
      - `code` (text, primary key) - PSGC city code
      - `name` (text) - City name
      - `province_code` (text) - Foreign key to provinces

    - `psgc_barangays` - Philippine barangays
      - `code` (text, primary key) - PSGC barangay code
      - `name` (text) - Barangay name
      - `city_code` (text) - Foreign key to cities

    - `loan_applications` - Loan application records
      - Full applicant details, loan info, employment, financial data
      - Status tracking (draft, submitted, under_review, approved, rejected)
      - Reference number auto-generation

    - `orcr_receipts` - Official Receipt and Collection Receipt records
      - Receipt number auto-generation
      - Links to loan applications
      - Void functionality with audit trail

    - `audit_logs` - System audit trail
      - Tracks all significant actions

  2. Security
    - RLS enabled on all tables
    - Role-based access policies
    - Users can only access data based on their role

  3. Functions
    - Auto-generate reference numbers for applications
    - Auto-generate receipt numbers for OR/CR
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'processor', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE loan_type AS ENUM ('personal', 'business', 'housing', 'auto', 'education');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE employment_type AS ENUM ('employed', 'self_employed', 'business_owner', 'retired', 'unemployed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE receipt_type AS ENUM ('official_receipt', 'collection_receipt');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admins can update any user
CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PSGC Tables
CREATE TABLE IF NOT EXISTS psgc_regions (
  code text PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS psgc_provinces (
  code text PRIMARY KEY,
  name text NOT NULL,
  region_code text NOT NULL REFERENCES psgc_regions(code)
);

CREATE TABLE IF NOT EXISTS psgc_cities (
  code text PRIMARY KEY,
  name text NOT NULL,
  province_code text NOT NULL REFERENCES psgc_provinces(code)
);

CREATE TABLE IF NOT EXISTS psgc_barangays (
  code text PRIMARY KEY,
  name text NOT NULL,
  city_code text NOT NULL REFERENCES psgc_cities(code)
);

-- Enable RLS on PSGC tables (public read)
ALTER TABLE psgc_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE psgc_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE psgc_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE psgc_barangays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read regions" ON psgc_regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read provinces" ON psgc_provinces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read cities" ON psgc_cities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read barangays" ON psgc_barangays FOR SELECT TO authenticated USING (true);

-- Loan Applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text UNIQUE NOT NULL DEFAULT '',
  user_id uuid NOT NULL REFERENCES users(id),
  status application_status NOT NULL DEFAULT 'draft',
  current_step integer NOT NULL DEFAULT 1,
  
  -- Loan Details
  loan_type loan_type NOT NULL,
  loan_amount numeric(15,2) NOT NULL,
  loan_term_months integer NOT NULL,
  loan_purpose text,
  
  -- Personal Information
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  suffix text,
  date_of_birth date,
  gender text,
  civil_status text,
  nationality text DEFAULT 'Filipino',
  tin text,
  sss_gsis text,
  contact_number text,
  email text,
  
  -- Present Address
  present_address_street text,
  present_address_barangay text,
  present_address_city text,
  present_address_province text,
  present_address_region text,
  present_address_zip text,
  
  -- Permanent Address
  permanent_address_same boolean DEFAULT true,
  permanent_address_street text,
  permanent_address_barangay text,
  permanent_address_city text,
  permanent_address_province text,
  permanent_address_region text,
  permanent_address_zip text,
  
  -- Employment
  employment_type employment_type,
  employer_name text,
  employer_address text,
  job_title text,
  years_employed integer,
  
  -- Financial
  monthly_income numeric(15,2),
  other_income numeric(15,2) DEFAULT 0,
  other_income_source text,
  monthly_expenses numeric(15,2) DEFAULT 0,
  existing_loans numeric(15,2) DEFAULT 0,
  
  -- Co-borrower
  co_borrower_name text,
  co_borrower_relationship text,
  co_borrower_income numeric(15,2) DEFAULT 0,
  
  -- Collateral
  collateral_type text,
  collateral_description text,
  collateral_value numeric(15,2) DEFAULT 0,
  
  -- Review
  submitted_at timestamptz,
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  review_notes text,
  approved_amount numeric(15,2),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Function to generate reference number
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS trigger AS $$
DECLARE
  year_prefix text;
  seq_num integer;
  new_ref text;
BEGIN
  year_prefix := to_char(now(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(reference_number FROM 9) AS integer)), 0) + 1
  INTO seq_num
  FROM loan_applications
  WHERE reference_number LIKE 'LA-' || year_prefix || '-%';
  
  new_ref := 'LA-' || year_prefix || '-' || LPAD(seq_num::text, 6, '0');
  NEW.reference_number := new_ref;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reference_number
  BEFORE INSERT ON loan_applications
  FOR EACH ROW
  WHEN (NEW.reference_number = '' OR NEW.reference_number IS NULL)
  EXECUTE FUNCTION generate_reference_number();

-- Indexes for loan_applications
CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at DESC);

ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loan_applications
CREATE POLICY "Users can view all applications"
  ON loan_applications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Processors and admins can create applications"
  ON loan_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'processor')
    )
  );

CREATE POLICY "Processors and admins can update applications"
  ON loan_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'processor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'processor')
    )
  );

-- OR/CR Receipts table
CREATE TABLE IF NOT EXISTS orcr_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text UNIQUE NOT NULL DEFAULT '',
  loan_application_id uuid NOT NULL REFERENCES loan_applications(id),
  receipt_type receipt_type NOT NULL,
  amount numeric(15,2) NOT NULL,
  payment_method text,
  payment_reference text,
  payment_date date NOT NULL,
  issued_by uuid NOT NULL REFERENCES users(id),
  issued_at timestamptz DEFAULT now(),
  notes text,
  voided boolean DEFAULT false,
  voided_by uuid REFERENCES users(id),
  voided_at timestamptz,
  void_reason text,
  created_at timestamptz DEFAULT now()
);

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS trigger AS $$
DECLARE
  year_prefix text;
  type_prefix text;
  seq_num integer;
  new_ref text;
BEGIN
  year_prefix := to_char(now(), 'YYYY');
  type_prefix := CASE WHEN NEW.receipt_type = 'official_receipt' THEN 'OR' ELSE 'CR' END;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 9) AS integer)), 0) + 1
  INTO seq_num
  FROM orcr_receipts
  WHERE receipt_number LIKE type_prefix || '-' || year_prefix || '-%';
  
  new_ref := type_prefix || '-' || year_prefix || '-' || LPAD(seq_num::text, 6, '0');
  NEW.receipt_number := new_ref;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_receipt_number
  BEFORE INSERT ON orcr_receipts
  FOR EACH ROW
  WHEN (NEW.receipt_number = '' OR NEW.receipt_number IS NULL)
  EXECUTE FUNCTION generate_receipt_number();

-- Indexes for orcr_receipts
CREATE INDEX IF NOT EXISTS idx_orcr_receipts_loan_application_id ON orcr_receipts(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_orcr_receipts_receipt_type ON orcr_receipts(receipt_type);
CREATE INDEX IF NOT EXISTS idx_orcr_receipts_created_at ON orcr_receipts(created_at DESC);

ALTER TABLE orcr_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orcr_receipts
CREATE POLICY "Users can view all receipts"
  ON orcr_receipts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Processors and admins can create receipts"
  ON orcr_receipts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'processor')
    )
  );

CREATE POLICY "Admins can update receipts"
  ON orcr_receipts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
