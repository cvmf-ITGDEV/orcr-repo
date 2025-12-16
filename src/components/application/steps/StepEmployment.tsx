import { Input, Select } from '../../ui'
import type { ApplicationFormData } from '../ApplicationWizard'

interface StepEmploymentProps {
  formData: ApplicationFormData
  updateFormData: (updates: Partial<ApplicationFormData>) => void
  errors: Record<string, string>
}

const employmentTypes = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' }
]

export function StepEmployment({ formData, updateFormData, errors }: StepEmploymentProps) {
  const showEmploymentDetails = ['employed', 'self_employed', 'business_owner'].includes(
    formData.employment_type
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Employment Information</h2>
        <p className="text-sm text-gray-500">Provide details about your current employment status.</p>
      </div>

      <Select
        label="Employment Type"
        value={formData.employment_type}
        onChange={(e) => updateFormData({ employment_type: e.target.value })}
        options={employmentTypes}
        placeholder="Select employment type"
        error={errors.employment_type}
        required
      />

      {showEmploymentDetails && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={formData.employment_type === 'business_owner' ? 'Business Name' : 'Employer Name'}
              value={formData.employer_name}
              onChange={(e) => updateFormData({ employer_name: e.target.value })}
              placeholder={
                formData.employment_type === 'business_owner'
                  ? 'Name of your business'
                  : 'Company name'
              }
            />

            <Input
              label="Job Title / Position"
              value={formData.job_title}
              onChange={(e) => updateFormData({ job_title: e.target.value })}
              placeholder="Your role or position"
            />
          </div>

          <Input
            label={formData.employment_type === 'business_owner' ? 'Business Address' : 'Office Address'}
            value={formData.employer_address}
            onChange={(e) => updateFormData({ employer_address: e.target.value })}
            placeholder="Complete address"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={
                formData.employment_type === 'business_owner'
                  ? 'Years in Business'
                  : 'Years with Employer'
              }
              type="number"
              value={formData.years_employed || ''}
              onChange={(e) => updateFormData({ years_employed: Number(e.target.value) })}
              min={0}
              placeholder="0"
            />
          </div>
        </>
      )}

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-md font-medium text-gray-900 mb-4">Co-Borrower Information (Optional)</h3>
        <p className="text-sm text-gray-500 mb-4">
          Adding a co-borrower may help strengthen your loan application.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Co-Borrower Name"
            value={formData.co_borrower_name}
            onChange={(e) => updateFormData({ co_borrower_name: e.target.value })}
            placeholder="Full name"
          />

          <Input
            label="Relationship"
            value={formData.co_borrower_relationship}
            onChange={(e) => updateFormData({ co_borrower_relationship: e.target.value })}
            placeholder="e.g., Spouse, Parent"
          />

          <Input
            label="Co-Borrower Monthly Income (PHP)"
            type="number"
            value={formData.co_borrower_income || ''}
            onChange={(e) => updateFormData({ co_borrower_income: Number(e.target.value) })}
            placeholder="0"
            min={0}
          />
        </div>
      </div>
    </div>
  )
}
