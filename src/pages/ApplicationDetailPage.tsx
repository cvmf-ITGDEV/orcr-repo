import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  Printer
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Button, Card, StatusBadge, Spinner, Modal } from '../components/ui'
import { ORCRGenerator } from '../components/orcr/ORCRGenerator'
import type { LoanApplication, ORCRReceipt } from '../types/database'
import { format } from 'date-fns'

export function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [receipts, setReceipts] = useState<ORCRReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showORCRModal, setShowORCRModal] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [approvedAmount, setApprovedAmount] = useState(0)

  useEffect(() => {
    if (id) {
      fetchApplication(id)
      fetchReceipts(id)
    }
  }, [id])

  async function fetchApplication(appId: string) {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('id', appId)
      .maybeSingle()

    if (error || !data) {
      console.error('Error fetching application:', error)
      navigate('/applications')
      return
    }

    setApplication(data)
    setApprovedAmount(data.loan_amount)
    setLoading(false)
  }

  async function fetchReceipts(appId: string) {
    const { data } = await supabase
      .from('orcr_receipts')
      .select('*')
      .eq('loan_application_id', appId)
      .order('created_at', { ascending: false })

    setReceipts(data || [])
  }

  async function handleReview() {
    if (!application || !user || !reviewAction) return

    setProcessing(true)
    const updates: Partial<LoanApplication> = {
      status: reviewAction === 'approve' ? 'approved' : 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes
    }

    if (reviewAction === 'approve') {
      updates.approved_amount = approvedAmount
    }

    const { error } = await supabase.from('loan_applications').update(updates).eq('id', application.id)

    if (error) {
      console.error('Error updating application:', error)
    } else {
      setApplication({ ...application, ...updates } as LoanApplication)
      setShowReviewModal(false)
    }
    setProcessing(false)
  }

  async function handleStartReview() {
    if (!application || !user) return

    setProcessing(true)
    const { error } = await supabase
      .from('loan_applications')
      .update({ status: 'under_review' })
      .eq('id', application.id)

    if (error) {
      console.error('Error updating status:', error)
    } else {
      setApplication({ ...application, status: 'under_review' })
    }
    setProcessing(false)
  }

  function openReviewModal(action: 'approve' | 'reject') {
    setReviewAction(action)
    setReviewNotes('')
    setShowReviewModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!application) {
    return <div>Application not found</div>
  }

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
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/applications')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{application.reference_number}</h1>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-gray-500 mt-1">
            Created {format(new Date(application.created_at), 'MMMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className="flex gap-3">
          {application.status === 'draft' && hasRole(['admin', 'processor']) && (
            <Link to={`/applications/${application.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
          {application.status === 'submitted' && hasRole(['admin', 'processor']) && (
            <Button onClick={handleStartReview} loading={processing}>
              <Clock className="w-4 h-4 mr-2" />
              Start Review
            </Button>
          )}
          {application.status === 'under_review' && hasRole(['admin', 'processor']) && (
            <>
              <Button variant="danger" onClick={() => openReviewModal('reject')}>
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button onClick={() => openReviewModal('approve')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </>
          )}
          {application.status === 'approved' && hasRole(['admin', 'processor']) && (
            <Button variant="secondary" onClick={() => setShowORCRModal(true)}>
              <Receipt className="w-4 h-4 mr-2" />
              Generate OR/CR
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Loan Type" value={loanTypeLabels[application.loan_type]} />
              <InfoItem label="Requested Amount" value={formatCurrency(application.loan_amount)} />
              <InfoItem label="Term" value={`${application.loan_term_months} months`} />
              {application.approved_amount && (
                <InfoItem
                  label="Approved Amount"
                  value={formatCurrency(application.approved_amount)}
                  highlight
                />
              )}
              {application.loan_purpose && (
                <div className="col-span-2">
                  <InfoItem label="Purpose" value={application.loan_purpose} />
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Applicant Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                label="Full Name"
                value={`${application.first_name} ${application.middle_name || ''} ${application.last_name} ${application.suffix || ''}`.trim()}
              />
              <InfoItem label="Date of Birth" value={application.date_of_birth || '-'} />
              <InfoItem label="Gender" value={application.gender || '-'} />
              <InfoItem label="Civil Status" value={application.civil_status || '-'} />
              <InfoItem label="Contact Number" value={application.contact_number || '-'} />
              <InfoItem label="Email" value={application.email || '-'} />
              {application.tin && <InfoItem label="TIN" value={application.tin} />}
              {application.sss_gsis && <InfoItem label="SSS/GSIS" value={application.sss_gsis} />}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Present Address</p>
                <p className="text-gray-900">
                  {[
                    application.present_address_street,
                    application.present_address_barangay,
                    application.present_address_city,
                    application.present_address_province,
                    application.present_address_region,
                    application.present_address_zip
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
              {!application.permanent_address_same && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Permanent Address</p>
                  <p className="text-gray-900">
                    {[
                      application.permanent_address_street,
                      application.permanent_address_barangay,
                      application.permanent_address_city,
                      application.permanent_address_province,
                      application.permanent_address_region,
                      application.permanent_address_zip
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Employment & Financial</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Employment Type" value={application.employment_type || '-'} />
              {application.employer_name && (
                <InfoItem label="Employer" value={application.employer_name} />
              )}
              {application.job_title && <InfoItem label="Position" value={application.job_title} />}
              <InfoItem label="Monthly Income" value={formatCurrency(application.monthly_income || 0)} />
              {(application.other_income ?? 0) > 0 && (
                <InfoItem label="Other Income" value={formatCurrency(application.other_income ?? 0)} />
              )}
              {(application.monthly_expenses ?? 0) > 0 && (
                <InfoItem label="Monthly Expenses" value={formatCurrency(application.monthly_expenses ?? 0)} />
              )}
              {(application.existing_loans ?? 0) > 0 && (
                <InfoItem label="Existing Loans" value={formatCurrency(application.existing_loans ?? 0)} />
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h2>
            <div className="space-y-4">
              <TimelineItem
                label="Created"
                date={application.created_at}
                active={true}
              />
              {application.submitted_at && (
                <TimelineItem
                  label="Submitted"
                  date={application.submitted_at}
                  active={true}
                />
              )}
              {application.status === 'under_review' && (
                <TimelineItem
                  label="Under Review"
                  date={new Date().toISOString()}
                  active={true}
                  current
                />
              )}
              {application.reviewed_at && (
                <TimelineItem
                  label={application.status === 'approved' ? 'Approved' : 'Rejected'}
                  date={application.reviewed_at}
                  active={true}
                  success={application.status === 'approved'}
                  error={application.status === 'rejected'}
                />
              )}
            </div>
            {application.review_notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">Review Notes</p>
                <p className="text-sm text-gray-700">{application.review_notes}</p>
              </div>
            )}
          </Card>

          {receipts.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">OR/CR Receipts</h2>
              <div className="space-y-3">
                {receipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{receipt.receipt_number}</p>
                      <p className="text-sm text-gray-500">
                        {receipt.receipt_type === 'official_receipt' ? 'Official Receipt' : 'Collection Receipt'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(receipt.amount)} - {format(new Date(receipt.payment_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={reviewAction === 'approve' ? 'Approve Application' : 'Reject Application'}
      >
        <div className="space-y-4">
          {reviewAction === 'approve' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approved Amount (PHP)
              </label>
              <input
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                max={application.loan_amount}
              />
              <p className="text-sm text-gray-500 mt-1">
                Requested: {formatCurrency(application.loan_amount)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Notes {reviewAction === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
              placeholder={
                reviewAction === 'reject'
                  ? 'Please provide reason for rejection...'
                  : 'Optional notes...'
              }
              required={reviewAction === 'reject'}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button
              variant={reviewAction === 'approve' ? 'primary' : 'danger'}
              onClick={handleReview}
              loading={processing}
              disabled={reviewAction === 'reject' && !reviewNotes.trim()}
            >
              {reviewAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showORCRModal}
        onClose={() => setShowORCRModal(false)}
        title="Generate OR/CR"
        size="lg"
      >
        <ORCRGenerator
          application={application}
          onSuccess={() => {
            setShowORCRModal(false)
            fetchReceipts(application.id)
          }}
        />
      </Modal>
    </div>
  )
}

function InfoItem({
  label,
  value,
  highlight
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`font-medium capitalize ${highlight ? 'text-green-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  )
}

function TimelineItem({
  label,
  date,
  active,
  current,
  success,
  error
}: {
  label: string
  date: string
  active: boolean
  current?: boolean
  success?: boolean
  error?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-3 h-3 rounded-full ${
          success
            ? 'bg-green-500'
            : error
            ? 'bg-red-500'
            : current
            ? 'bg-amber-500'
            : active
            ? 'bg-royal-500'
            : 'bg-gray-200'
        }`}
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{format(new Date(date), 'MMM d, yyyy h:mm a')}</p>
      </div>
    </div>
  )
}
