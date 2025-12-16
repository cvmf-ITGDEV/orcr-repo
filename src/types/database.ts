export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'processor' | 'viewer'
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
export type LoanType = 'personal' | 'business' | 'housing' | 'auto' | 'education'
export type EmploymentType = 'employed' | 'self_employed' | 'business_owner' | 'retired' | 'unemployed'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      psgc_regions: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
      }
      psgc_provinces: {
        Row: {
          code: string
          name: string
          region_code: string
        }
        Insert: {
          code: string
          name: string
          region_code: string
        }
        Update: {
          code?: string
          name?: string
          region_code?: string
        }
      }
      psgc_cities: {
        Row: {
          code: string
          name: string
          province_code: string
        }
        Insert: {
          code: string
          name: string
          province_code: string
        }
        Update: {
          code?: string
          name?: string
          province_code?: string
        }
      }
      psgc_barangays: {
        Row: {
          code: string
          name: string
          city_code: string
        }
        Insert: {
          code: string
          name: string
          city_code: string
        }
        Update: {
          code?: string
          name?: string
          city_code?: string
        }
      }
      loan_applications: {
        Row: {
          id: string
          reference_number: string
          user_id: string
          status: ApplicationStatus
          loan_type: LoanType
          loan_amount: number
          loan_term_months: number
          loan_purpose: string | null
          first_name: string
          middle_name: string | null
          last_name: string
          suffix: string | null
          date_of_birth: string | null
          gender: string | null
          civil_status: string | null
          nationality: string | null
          tin: string | null
          sss_gsis: string | null
          contact_number: string | null
          email: string | null
          present_address_street: string | null
          present_address_barangay: string | null
          present_address_city: string | null
          present_address_province: string | null
          present_address_region: string | null
          present_address_zip: string | null
          permanent_address_same: boolean
          permanent_address_street: string | null
          permanent_address_barangay: string | null
          permanent_address_city: string | null
          permanent_address_province: string | null
          permanent_address_region: string | null
          permanent_address_zip: string | null
          employment_type: EmploymentType | null
          employer_name: string | null
          employer_address: string | null
          job_title: string | null
          years_employed: number | null
          monthly_income: number | null
          other_income: number | null
          other_income_source: string | null
          monthly_expenses: number | null
          existing_loans: number | null
          co_borrower_name: string | null
          co_borrower_relationship: string | null
          co_borrower_income: number | null
          collateral_type: string | null
          collateral_description: string | null
          collateral_value: number | null
          submitted_at: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          approved_amount: number | null
          created_at: string
          updated_at: string
          current_step: number
        }
        Insert: {
          id?: string
          reference_number?: string
          user_id: string
          status?: ApplicationStatus
          loan_type: LoanType
          loan_amount: number
          loan_term_months: number
          loan_purpose?: string | null
          first_name: string
          middle_name?: string | null
          last_name: string
          suffix?: string | null
          date_of_birth?: string | null
          gender?: string | null
          civil_status?: string | null
          nationality?: string | null
          tin?: string | null
          sss_gsis?: string | null
          contact_number?: string | null
          email?: string | null
          present_address_street?: string | null
          present_address_barangay?: string | null
          present_address_city?: string | null
          present_address_province?: string | null
          present_address_region?: string | null
          present_address_zip?: string | null
          permanent_address_same?: boolean
          permanent_address_street?: string | null
          permanent_address_barangay?: string | null
          permanent_address_city?: string | null
          permanent_address_province?: string | null
          permanent_address_region?: string | null
          permanent_address_zip?: string | null
          employment_type?: EmploymentType | null
          employer_name?: string | null
          employer_address?: string | null
          job_title?: string | null
          years_employed?: number | null
          monthly_income?: number | null
          other_income?: number | null
          other_income_source?: string | null
          monthly_expenses?: number | null
          existing_loans?: number | null
          co_borrower_name?: string | null
          co_borrower_relationship?: string | null
          co_borrower_income?: number | null
          collateral_type?: string | null
          collateral_description?: string | null
          collateral_value?: number | null
          submitted_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          approved_amount?: number | null
          created_at?: string
          updated_at?: string
          current_step?: number
        }
        Update: {
          id?: string
          reference_number?: string
          user_id?: string
          status?: ApplicationStatus
          loan_type?: LoanType
          loan_amount?: number
          loan_term_months?: number
          loan_purpose?: string | null
          first_name?: string
          middle_name?: string | null
          last_name?: string
          suffix?: string | null
          date_of_birth?: string | null
          gender?: string | null
          civil_status?: string | null
          nationality?: string | null
          tin?: string | null
          sss_gsis?: string | null
          contact_number?: string | null
          email?: string | null
          present_address_street?: string | null
          present_address_barangay?: string | null
          present_address_city?: string | null
          present_address_province?: string | null
          present_address_region?: string | null
          present_address_zip?: string | null
          permanent_address_same?: boolean
          permanent_address_street?: string | null
          permanent_address_barangay?: string | null
          permanent_address_city?: string | null
          permanent_address_province?: string | null
          permanent_address_region?: string | null
          permanent_address_zip?: string | null
          employment_type?: EmploymentType | null
          employer_name?: string | null
          employer_address?: string | null
          job_title?: string | null
          years_employed?: number | null
          monthly_income?: number | null
          other_income?: number | null
          other_income_source?: string | null
          monthly_expenses?: number | null
          existing_loans?: number | null
          co_borrower_name?: string | null
          co_borrower_relationship?: string | null
          co_borrower_income?: number | null
          collateral_type?: string | null
          collateral_description?: string | null
          collateral_value?: number | null
          submitted_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          approved_amount?: number | null
          created_at?: string
          updated_at?: string
          current_step?: number
        }
      }
      orcr_receipts: {
        Row: {
          id: string
          receipt_number: string
          loan_application_id: string
          receipt_type: 'official_receipt' | 'collection_receipt'
          amount: number
          payment_method: string | null
          payment_reference: string | null
          payment_date: string
          issued_by: string
          issued_at: string
          notes: string | null
          voided: boolean
          voided_by: string | null
          voided_at: string | null
          void_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          receipt_number?: string
          loan_application_id: string
          receipt_type: 'official_receipt' | 'collection_receipt'
          amount: number
          payment_method?: string | null
          payment_reference?: string | null
          payment_date: string
          issued_by: string
          issued_at?: string
          notes?: string | null
          voided?: boolean
          voided_by?: string | null
          voided_at?: string | null
          void_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          receipt_number?: string
          loan_application_id?: string
          receipt_type?: 'official_receipt' | 'collection_receipt'
          amount?: number
          payment_method?: string | null
          payment_reference?: string | null
          payment_date?: string
          issued_by?: string
          issued_at?: string
          notes?: string | null
          voided?: boolean
          voided_by?: string | null
          voided_at?: string | null
          void_reason?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type LoanApplication = Database['public']['Tables']['loan_applications']['Row']
export type ORCRReceipt = Database['public']['Tables']['orcr_receipts']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type Region = Database['public']['Tables']['psgc_regions']['Row']
export type Province = Database['public']['Tables']['psgc_provinces']['Row']
export type City = Database['public']['Tables']['psgc_cities']['Row']
export type Barangay = Database['public']['Tables']['psgc_barangays']['Row']
