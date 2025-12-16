import { Input, Select } from '../../ui'
import type { ApplicationFormData } from '../ApplicationWizard'

interface StepPersonalInfoProps {
  formData: ApplicationFormData
  updateFormData: (updates: Partial<ApplicationFormData>) => void
  errors: Record<string, string>
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
]

const civilStatusOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
  { value: 'divorced', label: 'Divorced' }
]

const suffixOptions = [
  { value: '', label: 'None' },
  { value: 'Jr.', label: 'Jr.' },
  { value: 'Sr.', label: 'Sr.' },
  { value: 'II', label: 'II' },
  { value: 'III', label: 'III' },
  { value: 'IV', label: 'IV' }
]

export function StepPersonalInfo({ formData, updateFormData, errors }: StepPersonalInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Personal Information</h2>
        <p className="text-sm text-gray-500">Enter the applicant's basic personal details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="First Name"
          value={formData.first_name}
          onChange={(e) => updateFormData({ first_name: e.target.value })}
          error={errors.first_name}
          required
        />

        <Input
          label="Middle Name"
          value={formData.middle_name}
          onChange={(e) => updateFormData({ middle_name: e.target.value })}
        />

        <Input
          label="Last Name"
          value={formData.last_name}
          onChange={(e) => updateFormData({ last_name: e.target.value })}
          error={errors.last_name}
          required
        />

        <Select
          label="Suffix"
          value={formData.suffix}
          onChange={(e) => updateFormData({ suffix: e.target.value })}
          options={suffixOptions}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => updateFormData({ date_of_birth: e.target.value })}
          error={errors.date_of_birth}
          required
        />

        <Select
          label="Gender"
          value={formData.gender}
          onChange={(e) => updateFormData({ gender: e.target.value })}
          options={genderOptions}
          placeholder="Select gender"
          error={errors.gender}
          required
        />

        <Select
          label="Civil Status"
          value={formData.civil_status}
          onChange={(e) => updateFormData({ civil_status: e.target.value })}
          options={civilStatusOptions}
          placeholder="Select status"
          error={errors.civil_status}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nationality"
          value={formData.nationality}
          onChange={(e) => updateFormData({ nationality: e.target.value })}
        />

        <Input
          label="TIN (Tax Identification Number)"
          value={formData.tin}
          onChange={(e) => updateFormData({ tin: e.target.value })}
          placeholder="000-000-000-000"
        />

        <Input
          label="SSS/GSIS Number"
          value={formData.sss_gsis}
          onChange={(e) => updateFormData({ sss_gsis: e.target.value })}
          placeholder="00-0000000-0"
        />
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-md font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Contact Number"
            value={formData.contact_number}
            onChange={(e) => updateFormData({ contact_number: e.target.value })}
            placeholder="+63 9XX XXX XXXX"
            error={errors.contact_number}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="email@example.com"
            error={errors.email}
            required
          />
        </div>
      </div>
    </div>
  )
}
