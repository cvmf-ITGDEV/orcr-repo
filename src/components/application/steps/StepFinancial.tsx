import { Input, Select } from '../../ui'
import type { ApplicationFormData } from '../ApplicationWizard'

interface StepFinancialProps {
  formData: ApplicationFormData
  updateFormData: (updates: Partial<ApplicationFormData>) => void
  errors: Record<string, string>
}

const collateralTypes = [
  { value: '', label: 'No Collateral' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'savings', label: 'Savings / Time Deposit' },
  { value: 'stocks', label: 'Stocks / Bonds' },
  { value: 'other', label: 'Other' }
]

export function StepFinancial({ formData, updateFormData, errors }: StepFinancialProps) {
  const totalIncome = (formData.monthly_income || 0) + (formData.other_income || 0)
  const totalExpenses = (formData.monthly_expenses || 0) + (formData.existing_loans || 0)
  const netIncome = totalIncome - totalExpenses
  const dti = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Financial Information</h2>
        <p className="text-sm text-gray-500">Provide your income and expense details.</p>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4">Income</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Monthly Income (PHP)"
            type="number"
            value={formData.monthly_income || ''}
            onChange={(e) => updateFormData({ monthly_income: Number(e.target.value) })}
            placeholder="0"
            error={errors.monthly_income}
            min={0}
            required
          />

          <Input
            label="Other Income (PHP)"
            type="number"
            value={formData.other_income || ''}
            onChange={(e) => updateFormData({ other_income: Number(e.target.value) })}
            placeholder="0"
            min={0}
          />

          {formData.other_income > 0 && (
            <div className="md:col-span-2">
              <Input
                label="Source of Other Income"
                value={formData.other_income_source}
                onChange={(e) => updateFormData({ other_income_source: e.target.value })}
                placeholder="e.g., Rental income, Freelance work"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4">Expenses & Obligations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Monthly Expenses (PHP)"
            type="number"
            value={formData.monthly_expenses || ''}
            onChange={(e) => updateFormData({ monthly_expenses: Number(e.target.value) })}
            placeholder="0"
            helpText="Food, utilities, transportation, etc."
            min={0}
          />

          <Input
            label="Existing Loan Payments (PHP)"
            type="number"
            value={formData.existing_loans || ''}
            onChange={(e) => updateFormData({ existing_loans: Number(e.target.value) })}
            placeholder="0"
            helpText="Total monthly payments for other loans"
            min={0}
          />
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Financial Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Total Income</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Expenses</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalExpenses)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Net Income</p>
            <p className={`text-lg font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(netIncome)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Debt-to-Income</p>
            <p
              className={`text-lg font-semibold ${
                dti <= 35 ? 'text-green-600' : dti <= 50 ? 'text-amber-600' : 'text-red-600'
              }`}
            >
              {dti.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-md font-medium text-gray-900 mb-4">Collateral (Optional)</h3>
        <p className="text-sm text-gray-500 mb-4">
          Providing collateral may improve your chances of approval and get you better rates.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Collateral Type"
            value={formData.collateral_type}
            onChange={(e) => updateFormData({ collateral_type: e.target.value })}
            options={collateralTypes}
          />

          {formData.collateral_type && (
            <>
              <Input
                label="Estimated Value (PHP)"
                type="number"
                value={formData.collateral_value || ''}
                onChange={(e) => updateFormData({ collateral_value: Number(e.target.value) })}
                placeholder="0"
                min={0}
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.collateral_description}
                  onChange={(e) => updateFormData({ collateral_description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                  placeholder="Describe the collateral (e.g., property location, vehicle details)"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
