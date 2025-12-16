'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Card, CardContent, Grid2 as Grid, Chip, Button, Divider, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material'
import { Edit, CheckCircle, Cancel, PlayArrow, Receipt } from '@mui/icons-material'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import { statusColors, statusLabels } from '@/lib/theme'

interface Application {
  id: string
  referenceNumber: string
  applicationType: string
  status: string
  loanProductType: string
  loanAmount: string
  loanTermMonths: number
  firstName: string
  lastName: string
  dateOfBirth: string
  mobileNumber: string
  emailAddress: string
  presentCity: string
  presentProvince: string
  createdAt: string
  submittedAt: string
  approvedAt: string
  approvedAmount: string
  rejectionReason: string
  createdBy: { fullName: string }
  processedBy: { fullName: string } | null
}

const formatCurrency = (amount: string | number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount))

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: string; title: string } | null>(null)
  const [actionNotes, setActionNotes] = useState('')

  useEffect(() => { fetchApplication() }, [resolvedParams.id])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/loan-application/${resolvedParams.id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      setApplication(await response.json())
    } catch { setError('Failed to load') }
    finally { setLoading(false) }
  }

  const handleAction = async () => {
    if (!actionDialog) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/loan-application/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionDialog.action, notes: actionNotes, reason: actionNotes }),
      })
      if (!response.ok) throw new Error('Failed')
      await fetchApplication()
      setActionDialog(null)
      setActionNotes('')
    } catch { setError('Action failed') }
    finally { setActionLoading(false) }
  }

  const canApprove = session?.user?.role === 'ADMIN'
  const canProcess = session?.user?.role === 'ADMIN' || session?.user?.role === 'PROCESSOR'

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>
  if (!application) return <Box sx={{ textAlign: 'center', py: 8 }}><Typography color="error">Application not found</Typography></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{application.referenceNumber}</Typography>
          <Chip label={statusLabels[application.status]} color={statusColors[application.status]} size="small" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {application.status === 'DRAFT' && canProcess && <Button variant="outlined" startIcon={<Edit />} onClick={() => router.push(`/loan-application/${resolvedParams.id}/edit`)}>Edit</Button>}
          {application.status === 'SUBMITTED' && canProcess && <Button variant="contained" startIcon={<PlayArrow />} onClick={() => setActionDialog({ open: true, action: 'start_vetting', title: 'Start Vetting' })}>Start Vetting</Button>}
          {application.status === 'PENDING_VETTING' && canApprove && (
            <>
              <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => setActionDialog({ open: true, action: 'approve', title: 'Approve' })}>Approve</Button>
              <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setActionDialog({ open: true, action: 'disapprove', title: 'Disapprove' })}>Disapprove</Button>
            </>
          )}
          {application.status === 'APPROVED' && canProcess && <Button variant="contained" onClick={() => setActionDialog({ open: true, action: 'for_disbursement', title: 'For Disbursement' })}>For Disbursement</Button>}
          {application.status === 'FOR_DISBURSEMENT' && canProcess && <Button variant="contained" color="success" onClick={() => setActionDialog({ open: true, action: 'activate', title: 'Release Funds' })}>Release Funds</Button>}
          {['APPROVED', 'ACTIVE'].includes(application.status) && canProcess && <Button variant="outlined" startIcon={<Receipt />} onClick={() => router.push(`/loan-application/${resolvedParams.id}/receipt`)}>Issue Receipt</Button>}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Loan Details</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Type</Typography><Typography>{application.applicationType}</Typography></Grid>
                <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Product</Typography><Typography>{application.loanProductType}</Typography></Grid>
                <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Term</Typography><Typography>{application.loanTermMonths} months</Typography></Grid>
                <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Amount</Typography><Typography sx={{ fontWeight: 600 }}>{formatCurrency(application.loanAmount)}</Typography></Grid>
                {application.approvedAmount && <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Approved</Typography><Typography sx={{ fontWeight: 600, color: 'success.main' }}>{formatCurrency(application.approvedAmount)}</Typography></Grid>}
              </Grid>
            </CardContent>
          </Card>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Borrower Information</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Name</Typography><Typography>{application.firstName} {application.lastName}</Typography></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary">Date of Birth</Typography><Typography>{application.dateOfBirth ? format(new Date(application.dateOfBirth), 'MMM d, yyyy') : '-'}</Typography></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary">Mobile</Typography><Typography>{application.mobileNumber || '-'}</Typography></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Email</Typography><Typography>{application.emailAddress || '-'}</Typography></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">Location</Typography><Typography>{[application.presentCity, application.presentProvince].filter(Boolean).join(', ') || '-'}</Typography></Grid>
              </Grid>
            </CardContent>
          </Card>
          {application.rejectionReason && <Alert severity="error" sx={{ mb: 3 }}><strong>Rejection Reason:</strong> {application.rejectionReason}</Alert>}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Timeline</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box><Typography variant="caption" color="text.secondary">Created</Typography><Typography>{format(new Date(application.createdAt), 'MMM d, yyyy h:mm a')}</Typography><Typography variant="caption">{application.createdBy?.fullName}</Typography></Box>
                {application.submittedAt && <Box><Typography variant="caption" color="text.secondary">Submitted</Typography><Typography>{format(new Date(application.submittedAt), 'MMM d, yyyy h:mm a')}</Typography></Box>}
                {application.approvedAt && <Box><Typography variant="caption" color="text.secondary">Approved</Typography><Typography>{format(new Date(application.approvedAt), 'MMM d, yyyy h:mm a')}</Typography>{application.processedBy && <Typography variant="caption">{application.processedBy.fullName}</Typography>}</Box>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={actionDialog?.open || false} onClose={() => setActionDialog(null)}>
        <DialogTitle>{actionDialog?.title}</DialogTitle>
        <DialogContent><TextField fullWidth multiline rows={3} label="Notes" value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} sx={{ mt: 2 }} /></DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleAction} disabled={actionLoading}>{actionLoading ? <CircularProgress size={20} /> : 'Confirm'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
