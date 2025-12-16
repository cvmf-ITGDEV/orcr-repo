'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Stepper, Step, StepLabel, Button, Typography, Card, CardContent, Alert, CircularProgress, Grid2 as Grid, TextField, MenuItem, FormControlLabel, Checkbox, Radio, RadioGroup, FormControl, FormLabel, Divider } from '@mui/material'
import { Save, Send, ArrowBack, ArrowForward } from '@mui/icons-material'

const steps = [
  { label: 'Application Type', description: 'New or Renewal' },
  { label: 'Loan Details', description: 'Amount, Term, Purpose' },
  { label: 'Personal Info', description: 'Name, DOB, Contact' },
  { label: 'ID & Education', description: 'Documents' },
  { label: 'Collateral', description: 'Security details' },
  { label: 'Residence', description: 'Ownership details' },
  { label: 'Family Info', description: 'Spouse & Dependents' },
  { label: 'Income Source', description: 'Employment/Business' },
  { label: 'Co-Borrower', description: 'Optional' },
  { label: 'References', description: 'Character & Trade' },
  { label: 'Undertaking', description: 'Privacy Notice' },
  { label: 'Review', description: 'Confirm & Submit' },
]

export interface ApplicationFormData {
  applicationType: 'NEW' | 'RENEWAL'
  referralSource: string
  loanProductType: string
  loanAmount: number
  loanTermMonths: number
  loanPurpose: string
  firstName: string
  middleName: string
  lastName: string
  suffix: string
  dateOfBirth: string
  gender: string
  civilStatus: string
  mobileNumber: string
  emailAddress: string
  presentStreet: string
  presentCity: string
  presentProvince: string
  primaryIdType: string
  primaryIdNumber: string
  collateralType: string
  collateralValue: number
  residenceOwnership: string
  residenceYears: number
  spouseFirstName: string
  spouseLastName: string
  spouseMonthlyIncome: number
  numberOfDependents: number
  primaryIncomeSource: string
  employerName: string
  jobPosition: string
  monthlyNetSalary: number
  businessName: string
  businessNetIncome: number
  monthlyExpenses: number
  hasCoBorrower: boolean
  coBorrowerFirstName: string
  coBorrowerLastName: string
  coBorrowerMonthlyIncome: number
  undertakingSigned: boolean
  privacyNoticeSigned: boolean
}

const initialFormData: ApplicationFormData = {
  applicationType: 'NEW',
  referralSource: '',
  loanProductType: 'PERSONAL',
  loanAmount: 0,
  loanTermMonths: 12,
  loanPurpose: '',
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  dateOfBirth: '',
  gender: '',
  civilStatus: '',
  mobileNumber: '',
  emailAddress: '',
  presentStreet: '',
  presentCity: '',
  presentProvince: '',
  primaryIdType: '',
  primaryIdNumber: '',
  collateralType: '',
  collateralValue: 0,
  residenceOwnership: '',
  residenceYears: 0,
  spouseFirstName: '',
  spouseLastName: '',
  spouseMonthlyIncome: 0,
  numberOfDependents: 0,
  primaryIncomeSource: '',
  employerName: '',
  jobPosition: '',
  monthlyNetSalary: 0,
  businessName: '',
  businessNetIncome: 0,
  monthlyExpenses: 0,
  hasCoBorrower: false,
  coBorrowerFirstName: '',
  coBorrowerLastName: '',
  coBorrowerMonthlyIncome: 0,
  undertakingSigned: false,
  privacyNoticeSigned: false,
}

interface ApplicationWizardProps {
  applicationId?: string
  initialData?: Partial<ApplicationFormData>
}

export default function ApplicationWizard({ applicationId, initialData }: ApplicationWizardProps) {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<ApplicationFormData>({ ...initialFormData, ...initialData })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const updateFormData = (updates: Partial<ApplicationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    const clearedErrors = { ...errors }
    Object.keys(updates).forEach((key) => delete clearedErrors[key])
    setErrors(clearedErrors)
  }

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    switch (activeStep) {
      case 1:
        if (!formData.loanAmount || formData.loanAmount <= 0) newErrors.loanAmount = 'Required'
        if (!formData.loanTermMonths) newErrors.loanTermMonths = 'Required'
        break
      case 2:
        if (!formData.firstName?.trim()) newErrors.firstName = 'Required'
        if (!formData.lastName?.trim()) newErrors.lastName = 'Required'
        if (!formData.mobileNumber?.trim()) newErrors.mobileNumber = 'Required'
        break
      case 10:
        if (!formData.undertakingSigned) newErrors.undertakingSigned = 'Must accept'
        if (!formData.privacyNoticeSigned) newErrors.privacyNoticeSigned = 'Must accept'
        break
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/loan-application', {
        method: applicationId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, ...formData, currentStep: activeStep + 1, status: 'DRAFT' }),
      })
      if (!response.ok) throw new Error('Failed to save')
      const data = await response.json()
      if (!applicationId) router.push(`/loan-application/${data.id}/edit`)
    } catch {
      setError('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/loan-application', {
        method: applicationId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, ...formData, currentStep: 12, status: 'SUBMITTED' }),
      })
      if (!response.ok) throw new Error('Failed to submit')
      const data = await response.json()
      router.push(`/loan-application/${data.id}`)
    } catch {
      setError('Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0))

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <FormControl component="fieldset">
              <FormLabel>Application Type</FormLabel>
              <RadioGroup row value={formData.applicationType} onChange={(e) => updateFormData({ applicationType: e.target.value as 'NEW' | 'RENEWAL' })}>
                <FormControlLabel value="NEW" control={<Radio />} label="New Application" />
                <FormControlLabel value="RENEWAL" control={<Radio />} label="Renewal" />
              </RadioGroup>
            </FormControl>
            <TextField fullWidth label="Referral Source" value={formData.referralSource} onChange={(e) => updateFormData({ referralSource: e.target.value })} sx={{ mt: 3 }} />
          </Box>
        )
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth label="Loan Product" value={formData.loanProductType} onChange={(e) => updateFormData({ loanProductType: e.target.value })}>
                <MenuItem value="PERSONAL">Personal Loan</MenuItem>
                <MenuItem value="AUTO">Auto Loan</MenuItem>
                <MenuItem value="HOUSING">Housing Loan</MenuItem>
                <MenuItem value="BUSINESS">Business Loan</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth type="number" label="Loan Amount" value={formData.loanAmount || ''} onChange={(e) => updateFormData({ loanAmount: Number(e.target.value) })} error={!!errors.loanAmount} helperText={errors.loanAmount} InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>PHP</Typography> }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth label="Term (Months)" value={formData.loanTermMonths} onChange={(e) => updateFormData({ loanTermMonths: Number(e.target.value) })} error={!!errors.loanTermMonths}>
                {[6, 12, 18, 24, 36, 48, 60].map((term) => <MenuItem key={term} value={term}>{term} months</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth multiline rows={2} label="Purpose" value={formData.loanPurpose} onChange={(e) => updateFormData({ loanPurpose: e.target.value })} />
            </Grid>
          </Grid>
        )
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><TextField fullWidth label="First Name" value={formData.firstName} onChange={(e) => updateFormData({ firstName: e.target.value })} error={!!errors.firstName} helperText={errors.firstName} required /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><TextField fullWidth label="Middle Name" value={formData.middleName} onChange={(e) => updateFormData({ middleName: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><TextField fullWidth label="Last Name" value={formData.lastName} onChange={(e) => updateFormData({ lastName: e.target.value })} error={!!errors.lastName} helperText={errors.lastName} required /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><TextField fullWidth label="Suffix" value={formData.suffix} onChange={(e) => updateFormData({ suffix: e.target.value })} placeholder="Jr., Sr., III" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><TextField fullWidth type="date" label="Date of Birth" value={formData.dateOfBirth} onChange={(e) => updateFormData({ dateOfBirth: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField select fullWidth label="Gender" value={formData.gender} onChange={(e) => updateFormData({ gender: e.target.value })}>
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField select fullWidth label="Civil Status" value={formData.civilStatus} onChange={(e) => updateFormData({ civilStatus: e.target.value })}>
                <MenuItem value="SINGLE">Single</MenuItem>
                <MenuItem value="MARRIED">Married</MenuItem>
                <MenuItem value="WIDOWED">Widowed</MenuItem>
                <MenuItem value="SEPARATED">Separated</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><TextField fullWidth label="Mobile Number" value={formData.mobileNumber} onChange={(e) => updateFormData({ mobileNumber: e.target.value })} error={!!errors.mobileNumber} helperText={errors.mobileNumber} required /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email" type="email" value={formData.emailAddress} onChange={(e) => updateFormData({ emailAddress: e.target.value })} /></Grid>
            <Divider sx={{ width: '100%', my: 2 }} />
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Street Address" value={formData.presentStreet} onChange={(e) => updateFormData({ presentStreet: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="City/Municipality" value={formData.presentCity} onChange={(e) => updateFormData({ presentCity: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Province" value={formData.presentProvince} onChange={(e) => updateFormData({ presentProvince: e.target.value })} /></Grid>
          </Grid>
        )
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth label="Primary ID Type" value={formData.primaryIdType} onChange={(e) => updateFormData({ primaryIdType: e.target.value })}>
                {['Passport', 'Driver\'s License', 'SSS ID', 'GSIS ID', 'TIN Card', 'National ID', 'Voter\'s ID'].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="ID Number" value={formData.primaryIdNumber} onChange={(e) => updateFormData({ primaryIdNumber: e.target.value })} /></Grid>
          </Grid>
        )
      case 4:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth label="Collateral Type" value={formData.collateralType} onChange={(e) => updateFormData({ collateralType: e.target.value })}>
                <MenuItem value="NONE">None (Unsecured)</MenuItem>
                <MenuItem value="VEHICLE">Motor Vehicle</MenuItem>
                <MenuItem value="REAL_ESTATE">Real Estate</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="number" label="Estimated Value" value={formData.collateralValue || ''} onChange={(e) => updateFormData({ collateralValue: Number(e.target.value) })} InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>PHP</Typography> }} /></Grid>
          </Grid>
        )
      case 5:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth label="Residence Ownership" value={formData.residenceOwnership} onChange={(e) => updateFormData({ residenceOwnership: e.target.value })}>
                <MenuItem value="OWNED">Owned</MenuItem>
                <MenuItem value="RENTED">Rented</MenuItem>
                <MenuItem value="LIVING_WITH_RELATIVES">Living with Relatives</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="number" label="Years at Residence" value={formData.residenceYears || ''} onChange={(e) => updateFormData({ residenceYears: Number(e.target.value) })} /></Grid>
          </Grid>
        )
      case 6:
        return (
          <Grid container spacing={3}>
            {formData.civilStatus === 'MARRIED' && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Spouse First Name" value={formData.spouseFirstName} onChange={(e) => updateFormData({ spouseFirstName: e.target.value })} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Spouse Last Name" value={formData.spouseLastName} onChange={(e) => updateFormData({ spouseLastName: e.target.value })} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="number" label="Spouse Monthly Income" value={formData.spouseMonthlyIncome || ''} onChange={(e) => updateFormData({ spouseMonthlyIncome: Number(e.target.value) })} InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>PHP</Typography> }} /></Grid>
              </>
            )}
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="number" label="Number of Dependents" value={formData.numberOfDependents || ''} onChange={(e) => updateFormData({ numberOfDependents: Number(e.target.value) })} /></Grid>
          </Grid>
        )
      case 7:
        return (
          <Box>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel>Primary Income Source</FormLabel>
              <RadioGroup row value={formData.primaryIncomeSource} onChange={(e) => updateFormData({ primaryIncomeSource: e.target.value })}>
                <FormControlLabel value="EMPLOYMENT" control={<Radio />} label="Employment" />
                <FormControlLabel value="BUSINESS" control={<Radio />} label="Business" />
                <FormControlLabel value="REMITTANCE" control={<Radio />} label="Remittance" />
                <FormControlLabel value="OTHER" control={<Radio />} label="Other" />
              </RadioGroup>
            </FormControl>
            {formData.primaryIncomeSource === 'EMPLOYMENT' && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Employer Name" value={formData.employerName} onChange={(e) => updateFormData({ employerName: e.target.value })} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Position" value={formData.jobPosition} onChange={(e) => updateFormData({ jobPosition: e.target.value })} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="number" label="Monthly Net Salary" value={formData.monthlyNetSalary || ''} onChange={(e) => updateFormData({ monthlyNetSalary: Number(e.target.value) })} InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>PHP</Typography> }} /></Grid>
              </Grid>
            )}
            {formData.primaryIncomeSource === 'BUSINESS' && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Business Name" value={formData.businessName} onChange={(e) => updateFormData({ businessName: e.target.value })} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="number" label="Monthly Net Income" value={formData.businessNetIncome || ''} onChange={(e) => updateFormData({ businessNetIncome: Number(e.target.value) })} InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>PHP</Typography> }} /></Grid>
              </Grid>
            )}
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="number" label="Monthly Expenses" value={formData.monthlyExpenses || ''} onChange={(e) => updateFormData({ monthlyExpenses: Number(e.target.value) })} InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>PHP</Typography> }} /></Grid>
            </Grid>
          </Box>
        )
      case 8:
        return (
          <Box>
            <FormControlLabel control={<Checkbox checked={formData.hasCoBorrower} onChange={(e) => updateFormData({ hasCoBorrower: e.target.checked })} />} label="I have a co-borrower" sx={{ mb: 3 }} />
            {formData.hasCoBorrower && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Co-Borrower First Name" value={formData.coBorrowerFirstName} onChange={(e) => updateFormData({ coBorrowerFirstName: e.target.value })} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Co-Borrower Last Name" value={formData.coBorrowerLastName} onChange={(e) => updateFormData({ coBorrowerLastName: e.target.value })} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="number" label="Monthly Income" value={formData.coBorrowerMonthlyIncome || ''} onChange={(e) => updateFormData({ coBorrowerMonthlyIncome: Number(e.target.value) })} InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>PHP</Typography> }} /></Grid>
              </Grid>
            )}
          </Box>
        )
      case 9:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Provide at least one character reference and one trade reference. (For demo purposes, this step is simplified)</Typography>
            <Alert severity="info">References can be added after saving the draft.</Alert>
          </Box>
        )
      case 10:
        return (
          <Box>
            <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Borrower&apos;s Undertaking</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>I certify that all information provided is true and correct. I authorize the verification of all information and agree to comply with all terms and conditions.</Typography>
              <FormControlLabel control={<Checkbox checked={formData.undertakingSigned} onChange={(e) => updateFormData({ undertakingSigned: e.target.checked })} />} label="I agree to the Borrower's Undertaking" />
              {errors.undertakingSigned && <Alert severity="error" sx={{ mt: 1 }}>{errors.undertakingSigned}</Alert>}
            </Card>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Data Privacy Notice</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>I consent to the collection, processing, and sharing of my personal information in accordance with RA 10173 (Data Privacy Act).</Typography>
              <FormControlLabel control={<Checkbox checked={formData.privacyNoticeSigned} onChange={(e) => updateFormData({ privacyNoticeSigned: e.target.checked })} />} label="I consent to the Data Privacy Notice" />
              {errors.privacyNoticeSigned && <Alert severity="error" sx={{ mt: 1 }}>{errors.privacyNoticeSigned}</Alert>}
            </Card>
          </Box>
        )
      case 11:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Review your application before submitting.</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Type</Typography><Typography>{formData.applicationType}</Typography></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Product</Typography><Typography>{formData.loanProductType}</Typography></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Amount</Typography><Typography fontWeight={600}>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(formData.loanAmount)}</Typography></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Term</Typography><Typography>{formData.loanTermMonths} months</Typography></Grid>
              <Grid size={{ xs: 12, sm: 8 }}><Typography variant="caption" color="text.secondary">Applicant</Typography><Typography>{formData.firstName} {formData.middleName} {formData.lastName}</Typography></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Mobile</Typography><Typography>{formData.mobileNumber}</Typography></Grid>
            </Grid>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{applicationId ? 'Edit Application' : 'New Loan Application'}</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Complete all steps to submit your application</Typography>

      <Box sx={{ mb: 4, overflowX: 'auto' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.label} completed={index < activeStep}>
              <StepLabel><Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' } }}>{step.label}</Typography></StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>{steps[activeStep].label}</Typography>
          {renderStepContent()}
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleBack} disabled={activeStep === 0} startIcon={<ArrowBack />}>Back</Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={handleSaveDraft} disabled={saving} startIcon={saving ? <CircularProgress size={16} /> : <Save />}>Save Draft</Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" color="secondary" onClick={handleSubmit} disabled={submitting || !formData.undertakingSigned || !formData.privacyNoticeSigned} startIcon={submitting ? <CircularProgress size={16} /> : <Send />}>Submit Application</Button>
          ) : (
            <Button variant="contained" onClick={handleNext} endIcon={<ArrowForward />}>Next</Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}
