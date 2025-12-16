import { AlertCircle } from 'lucide-react'
import type { ApplicationFormData } from '../ApplicationWizard'

interface StepReviewProps {
  formData: ApplicationFormData
}

export function StepReview({ formData }: StepReviewProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)

  const loanTypeLabels: Record<string, string> = {
    personal: 'Personal Loan',
    business: 'Business Loan',
    housing: 'Housing Loan',
    auto: 'Auto Loan',
    education: 'Education Loan'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Review Application</h2>
        <p className="text-sm text-gray-500">
          Please review all information before submitting. Click "Edit" on any section to make changes.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Important</p>
          <p className="text-sm text-amber-700">
            By submitting this application, you confirm that all information provided is true and accurate
            to the best of your knowledge.
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        <Section title="Loan Details">
          <InfoRow label="Loan Type" value={loanTypeLabels[formData.loan_type] || formData.loan_type} />
          <InfoRow label="Loan Amount" value={formatCurrency(formData.loan_amount)} />
          <InfoRow label="Loan Term" value={`${formData.loan_term_months} months`} />
          {formData.loan_purpose && <InfoRow label="Purpose" value={formData.loan_purpose} />}
        </Section>

        <Section title="Personal Information">
          <InfoRow
            label="Full Name"
            value={`${formData.first_name} ${formData.middle_name} ${formData.last_name} ${formData.suffix}`.trim()}
          />
          <InfoRow label="Date of Birth" value={formData.date_of_birth} />
          <InfoRow label="Gender" value={formData.gender} />
          <InfoRow label="Civil Status" value={formData.civil_status} />
          <InfoRow label="Nationality" value={formData.nationality} />
          {formData.tin && <InfoRow label="TIN" value={formData.tin} />}
          {formData.sss_gsis && <InfoRow label="SSS/GSIS" value={formData.sss_gsis} />}
          <InfoRow label="Contact Number" value={formData.contact_number} />
          <InfoRow label="Email" value={formData.email} />
        </Section>

        <Section title="Present Address">
          <InfoRow label="Street" value={formData.present_address_street} />
          <InfoRow label="Barangay" value={formData.present_address_barangay} />
          <InfoRow label="City/Municipality" value={formData.present_address_city} />
          <InfoRow label="Province" value={formData.present_address_province} />
          <InfoRow label="Region" value={formData.present_address_region} />
          <InfoRow label="ZIP Code" value={formData.present_address_zip} />
        </Section>

        {!formData.permanent_address_same && (
          <Section title="Permanent Address">
            <InfoRow label="Street" value={formData.permanent_address_street} />
            <InfoRow label="Barangay" value={formData.permanent_address_barangay} />
            <InfoRow label="City/Municipality" value={formData.permanent_address_city} />
            <InfoRow label="Province" value={formData.permanent_address_province} />
            <InfoRow label="Region" value={formData.permanent_address_region} />
            <InfoRow label="ZIP Code" value={formData.permanent_address_zip} />
          </Section>
        )}

        <Section title="Employment">
          <InfoRow label="Employment Type" value={formData.employment_type} />
          {formData.employer_name && <InfoRow label="Employer/Business" value={formData.employer_name} />}
          {formData.job_title && <InfoRow label="Position" value={formData.job_title} />}
          {formData.employer_address && <InfoRow label="Address" value={formData.employer_address} />}
          {formData.years_employed > 0 && (
            <InfoRow label="Years Employed" value={`${formData.years_employed} years`} />
          )}
        </Section>

        {formData.co_borrower_name && (
          <Section title="Co-Borrower">
            <InfoRow label="Name" value={formData.co_borrower_name} />
            <InfoRow label="Relationship" value={formData.co_borrower_relationship} />
            {formData.co_borrower_income > 0 && (
              <InfoRow label="Monthly Income" value={formatCurrency(formData.co_borrower_income)} />
            )}
          </Section>
        )}

        <Section title="Financial Information">
          <InfoRow label="Monthly Income" value={formatCurrency(formData.monthly_income)} />
          {formData.other_income > 0 && (
            <>
              <InfoRow label="Other Income" value={formatCurrency(formData.other_income)} />
              {formData.other_income_source && (
                <InfoRow label="Other Income Source" value={formData.other_income_source} />
              )}
            </>
          )}
          {formData.monthly_expenses > 0 && (
            <InfoRow label="Monthly Expenses" value={formatCurrency(formData.monthly_expenses)} />
          )}
          {formData.existing_loans > 0 && (
            <InfoRow label="Existing Loan Payments" value={formatCurrency(formData.existing_loans)} />
          )}
        </Section>

        {formData.collateral_type && (
          <Section title="Collateral">
            <InfoRow label="Type" value={formData.collateral_type} />
            {formData.collateral_value > 0 && (
              <InfoRow label="Estimated Value" value={formatCurrency(formData.collateral_value)} />
            )}
            {formData.collateral_description && (
              <InfoRow label="Description" value={formData.collateral_description} />
            )}
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  if (!value) return null
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 capitalize">{value}</span>
    </div>
  )
}
