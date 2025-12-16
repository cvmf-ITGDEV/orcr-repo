import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Card, Spinner } from '../ui'
import { StepLoanDetails } from './steps/StepLoanDetails'
import { StepPersonalInfo } from './steps/StepPersonalInfo'
import { StepAddress } from './steps/StepAddress'
import { StepEmployment } from './steps/StepEmployment'
import { StepFinancial } from './steps/StepFinancial'
import { StepReview } from './steps/StepReview'

export interface ApplicationFormData {
  loan_type: string
  loan_amount: number
  loan_term_months: number
  loan_purpose: string
  first_name: string
  middle_name: string
  last_name: string
  suffix: string
  date_of_birth: string
  gender: string
  civil_status: string
  nationality: string
  tin: string
  sss_gsis: string
  contact_number: string
  email: string
  present_address_street: string
  present_address_barangay: string
  present_address_city: string
  present_address_province: string
  present_address_region: string
  present_address_zip: string
  permanent_address_same: boolean
  permanent_address_street: string
  permanent_address_barangay: string
  permanent_address_city: string
  permanent_address_province: string
  permanent_address_region: string
  permanent_address_zip: string
  employment_type: string
  employer_name: string
  employer_address: string
  job_title: string
  years_employed: number
  monthly_income: number
  other_income: number
  other_income_source: string
  monthly_expenses: number
  existing_loans: number
  co_borrower_name: string
  co_borrower_relationship: string
  co_borrower_income: number
  collateral_type: string
  collateral_description: string
  collateral_value: number
}

const initialFormData: ApplicationFormData = {
  loan_type: 'personal',
  loan_amount: 0,
  loan_term_months: 12,
  loan_purpose: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  suffix: '',
  date_of_birth: '',
  gender: '',
  civil_status: '',
  nationality: 'Filipino',
  tin: '',
  sss_gsis: '',
  contact_number: '',
  email: '',
  present_address_street: '',
  present_address_barangay: '',
  present_address_city: '',
  present_address_province: '',
  present_address_region: '',
  present_address_zip: '',
  permanent_address_same: true,
  permanent_address_street: '',
  permanent_address_barangay: '',
  permanent_address_city: '',
  permanent_address_province: '',
  permanent_address_region: '',
  permanent_address_zip: '',
  employment_type: '',
  employer_name: '',
  employer_address: '',
  job_title: '',
  years_employed: 0,
  monthly_income: 0,
  other_income: 0,
  other_income_source: '',
  monthly_expenses: 0,
  existing_loans: 0,
  co_borrower_name: '',
  co_borrower_relationship: '',
  co_borrower_income: 0,
  collateral_type: '',
  collateral_description: '',
  collateral_value: 0
}

const steps = [
  { id: 1, name: 'Loan Details', description: 'Type and amount' },
  { id: 2, name: 'Personal Info', description: 'Basic information' },
  { id: 3, name: 'Address', description: 'Present & permanent' },
  { id: 4, name: 'Employment', description: 'Work details' },
  { id: 5, name: 'Financial', description: 'Income & expenses' },
  { id: 6, name: 'Review', description: 'Confirm & submit' }
]

export function ApplicationWizard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(id || null)

  useEffect(() => {
    if (id) {
      loadApplication(id)
    }
  }, [id])

  async function loadApplication(appId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('id', appId)
      .maybeSingle()

    if (error || !data) {
      console.error('Error loading application:', error)
      navigate('/applications')
      return
    }

    setFormData({
      loan_type: data.loan_type,
      loan_amount: data.loan_amount,
      loan_term_months: data.loan_term_months,
      loan_purpose: data.loan_purpose || '',
      first_name: data.first_name,
      middle_name: data.middle_name || '',
      last_name: data.last_name,
      suffix: data.suffix || '',
      date_of_birth: data.date_of_birth || '',
      gender: data.gender || '',
      civil_status: data.civil_status || '',
      nationality: data.nationality || 'Filipino',
      tin: data.tin || '',
      sss_gsis: data.sss_gsis || '',
      contact_number: data.contact_number || '',
      email: data.email || '',
      present_address_street: data.present_address_street || '',
      present_address_barangay: data.present_address_barangay || '',
      present_address_city: data.present_address_city || '',
      present_address_province: data.present_address_province || '',
      present_address_region: data.present_address_region || '',
      present_address_zip: data.present_address_zip || '',
      permanent_address_same: data.permanent_address_same ?? true,
      permanent_address_street: data.permanent_address_street || '',
      permanent_address_barangay: data.permanent_address_barangay || '',
      permanent_address_city: data.permanent_address_city || '',
      permanent_address_province: data.permanent_address_province || '',
      permanent_address_region: data.permanent_address_region || '',
      permanent_address_zip: data.permanent_address_zip || '',
      employment_type: data.employment_type || '',
      employer_name: data.employer_name || '',
      employer_address: data.employer_address || '',
      job_title: data.job_title || '',
      years_employed: data.years_employed || 0,
      monthly_income: data.monthly_income || 0,
      other_income: data.other_income || 0,
      other_income_source: data.other_income_source || '',
      monthly_expenses: data.monthly_expenses || 0,
      existing_loans: data.existing_loans || 0,
      co_borrower_name: data.co_borrower_name || '',
      co_borrower_relationship: data.co_borrower_relationship || '',
      co_borrower_income: data.co_borrower_income || 0,
      collateral_type: data.collateral_type || '',
      collateral_description: data.collateral_description || '',
      collateral_value: data.collateral_value || 0
    })
    setCurrentStep(data.current_step || 1)
    setApplicationId(data.id)
    setLoading(false)
  }

  function updateFormData(updates: Partial<ApplicationFormData>) {
    setFormData((prev) => ({ ...prev, ...updates }))
    const clearedErrors = { ...errors }
    Object.keys(updates).forEach((key) => {
      delete clearedErrors[key]
    })
    setErrors(clearedErrors)
  }

  function validateStep(step: number): boolean {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.loan_type) newErrors.loan_type = 'Required'
      if (!formData.loan_amount || formData.loan_amount <= 0) newErrors.loan_amount = 'Enter valid amount'
      if (!formData.loan_term_months || formData.loan_term_months <= 0) newErrors.loan_term_months = 'Required'
    }

    if (step === 2) {
      if (!formData.first_name.trim()) newErrors.first_name = 'Required'
      if (!formData.last_name.trim()) newErrors.last_name = 'Required'
      if (!formData.date_of_birth) newErrors.date_of_birth = 'Required'
      if (!formData.gender) newErrors.gender = 'Required'
      if (!formData.civil_status) newErrors.civil_status = 'Required'
      if (!formData.contact_number.trim()) newErrors.contact_number = 'Required'
      if (!formData.email.trim()) newErrors.email = 'Required'
    }

    if (step === 3) {
      if (!formData.present_address_region) newErrors.present_address_region = 'Required'
      if (!formData.present_address_province) newErrors.present_address_province = 'Required'
      if (!formData.present_address_city) newErrors.present_address_city = 'Required'
      if (!formData.present_address_barangay) newErrors.present_address_barangay = 'Required'
      if (!formData.present_address_street.trim()) newErrors.present_address_street = 'Required'
      if (!formData.present_address_zip.trim()) newErrors.present_address_zip = 'Required'

      if (!formData.permanent_address_same) {
        if (!formData.permanent_address_region) newErrors.permanent_address_region = 'Required'
        if (!formData.permanent_address_province) newErrors.permanent_address_province = 'Required'
        if (!formData.permanent_address_city) newErrors.permanent_address_city = 'Required'
        if (!formData.permanent_address_barangay) newErrors.permanent_address_barangay = 'Required'
        if (!formData.permanent_address_street.trim()) newErrors.permanent_address_street = 'Required'
        if (!formData.permanent_address_zip.trim()) newErrors.permanent_address_zip = 'Required'
      }
    }

    if (step === 4) {
      if (!formData.employment_type) newErrors.employment_type = 'Required'
    }

    if (step === 5) {
      if (!formData.monthly_income || formData.monthly_income <= 0) newErrors.monthly_income = 'Required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function saveDraft() {
    if (!user) return

    setSaving(true)
    const appData = {
      ...formData,
      user_id: user.id,
      status: 'draft' as const,
      current_step: currentStep
    }

    try {
      if (applicationId) {
        const { error } = await supabase
          .from('loan_applications')
          .update(appData)
          .eq('id', applicationId)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('loan_applications')
          .insert(appData)
          .select()
          .single()

        if (error) throw error
        setApplicationId(data.id)
        navigate(`/applications/${data.id}/edit`, { replace: true })
      }
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit() {
    if (!user || !applicationId) return

    setLoading(true)
    const { error } = await supabase
      .from('loan_applications')
      .update({
        ...formData,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        current_step: 6
      })
      .eq('id', applicationId)

    if (error) {
      console.error('Error submitting:', error)
      setLoading(false)
      return
    }

    navigate(`/applications/${applicationId}`)
  }

  function handleNext() {
    if (validateStep(currentStep)) {
      saveDraft()
      setCurrentStep((prev) => Math.min(prev + 1, 6))
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {applicationId ? 'Edit Application' : 'New Loan Application'}
        </h1>
        <p className="text-gray-500 mt-1">Complete all steps to submit your application</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-royal-600 text-white ring-4 ring-royal-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <div className="mt-2 text-center hidden md:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 md:w-24 h-1 mx-2 rounded ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="mb-6">
        {currentStep === 1 && (
          <StepLoanDetails formData={formData} updateFormData={updateFormData} errors={errors} />
        )}
        {currentStep === 2 && (
          <StepPersonalInfo formData={formData} updateFormData={updateFormData} errors={errors} />
        )}
        {currentStep === 3 && (
          <StepAddress formData={formData} updateFormData={updateFormData} errors={errors} />
        )}
        {currentStep === 4 && (
          <StepEmployment formData={formData} updateFormData={updateFormData} errors={errors} />
        )}
        {currentStep === 5 && (
          <StepFinancial formData={formData} updateFormData={updateFormData} errors={errors} />
        )}
        {currentStep === 6 && <StepReview formData={formData} />}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <div className="flex gap-3">
          <Button variant="outline" onClick={saveDraft} loading={saving}>
            <Save className="w-4 h-4 mr-1" />
            Save Draft
          </Button>

          {currentStep < 6 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading}>
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
