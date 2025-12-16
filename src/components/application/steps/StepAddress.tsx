import { PSGCAddressSelector } from '../../address/PSGCAddressSelector'
import type { ApplicationFormData } from '../ApplicationWizard'

interface StepAddressProps {
  formData: ApplicationFormData
  updateFormData: (updates: Partial<ApplicationFormData>) => void
  errors: Record<string, string>
}

export function StepAddress({ formData, updateFormData, errors }: StepAddressProps) {
  function handleFieldChange(field: string, value: string) {
    updateFormData({ [field]: value } as Partial<ApplicationFormData>)
  }

  function handleSameAddressToggle(checked: boolean) {
    updateFormData({ permanent_address_same: checked })
    if (checked) {
      updateFormData({
        permanent_address_street: '',
        permanent_address_barangay: '',
        permanent_address_city: '',
        permanent_address_province: '',
        permanent_address_region: '',
        permanent_address_zip: ''
      })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Address Information</h2>
        <p className="text-sm text-gray-500">Enter your present and permanent address details.</p>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4">Present Address</h3>
        <PSGCAddressSelector
          prefix="present_address"
          values={{
            region: formData.present_address_region,
            province: formData.present_address_province,
            city: formData.present_address_city,
            barangay: formData.present_address_barangay,
            street: formData.present_address_street,
            zip: formData.present_address_zip
          }}
          onChange={handleFieldChange}
          errors={errors}
        />
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium text-gray-900">Permanent Address</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.permanent_address_same}
              onChange={(e) => handleSameAddressToggle(e.target.checked)}
              className="w-4 h-4 text-royal-600 border-gray-300 rounded focus:ring-royal-500"
            />
            <span className="text-sm text-gray-600">Same as present address</span>
          </label>
        </div>

        {!formData.permanent_address_same && (
          <PSGCAddressSelector
            prefix="permanent_address"
            values={{
              region: formData.permanent_address_region,
              province: formData.permanent_address_province,
              city: formData.permanent_address_city,
              barangay: formData.permanent_address_barangay,
              street: formData.permanent_address_street,
              zip: formData.permanent_address_zip
            }}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}
      </div>
    </div>
  )
}
