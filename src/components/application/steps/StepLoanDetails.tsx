import { Input, Select } from '../../ui'
import type { ApplicationFormData } from '../ApplicationWizard'

interface StepLoanDetailsProps {
  formData: ApplicationFormData
  updateFormData: (updates: Partial<ApplicationFormData>) => void
  errors: Record<string, string>
}

const loanTypes = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'business', label: 'Business Loan' },
  { value: 'housing', label: 'Housing Loan' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'education', label: 'Education Loan' }
]

const termOptions = [
  { value: '6', label: '6 months' },
  { value: '12', label: '12 months' },
  { value: '18', label: '18 months' },
  { value: '24', label: '24 months' },
  { value: '36', label: '36 months' },
  { value: '48', label: '48 months' },
  { value: '60', label: '60 months' }
]

export function StepLoanDetails({ formData, updateFormData, errors }: StepLoanDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Loan Details</h2>
        <p className="text-sm text-gray-500">Enter the loan type and amount you wish to apply for.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Loan Type"
          value={formData.loan_type}
          onChange={(e) => updateFormData({ loan_type: e.target.value })}
          options={loanTypes}
          error={errors.loan_type}
          required
        />

        <Input
          label="Loan Amount (PHP)"
          type="number"
          value={formData.loan_amount || ''}
          onChange={(e) => updateFormData({ loan_amount: Number(e.target.value) })}
          placeholder="e.g., 100000"
          error={errors.loan_amount}
          min={0}
          required
        />

        <Select
          label="Loan Term"
          value={String(formData.loan_term_months)}
          onChange={(e) => updateFormData({ loan_term_months: Number(e.target.value) })}
          options={termOptions}
          error={errors.loan_term_months}
          required
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Loan</label>
          <textarea
            value={formData.loan_purpose}
            onChange={(e) => updateFormData({ loan_purpose: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
            placeholder="Describe why you need this loan..."
          />
        </div>
      </div>

      {formData.loan_amount > 0 && (
        <div className="bg-royal-50 border border-royal-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-royal-900 mb-2">Estimated Monthly Payment</h3>
          <p className="text-2xl font-bold text-royal-600">
            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(
              (formData.loan_amount * 1.15) / formData.loan_term_months
            )}
            <span className="text-sm font-normal text-gray-500"> / month</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">*Estimated at 15% annual interest rate</p>
        </div>
      )}
    </div>
  )
}
