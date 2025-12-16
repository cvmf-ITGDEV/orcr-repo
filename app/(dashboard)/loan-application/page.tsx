'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, TextField, MenuItem } from '@mui/material'
import { Add, Search } from '@mui/icons-material'
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
  firstName: string
  lastName: string
  createdAt: string
}

export default function ApplicationsPage() {
  const { data: session } = useSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [statusFilter])

  const fetchApplications = async () => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    const response = await fetch(`/api/loan-application?${params}`)
    const data = await response.json()
    setApplications(data.applications || [])
    setLoading(false)
  }

  const canCreate = session?.user?.role === 'ADMIN' || session?.user?.role === 'PROCESSOR'

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Loan Applications</Typography>
          <Typography color="text.secondary">Manage loan applications</Typography>
        </Box>
        {canCreate && (
          <Button component={Link} href="/loan-application/new" variant="contained" startIcon={<Add />}>New Application</Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2 }}>
          <TextField select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 200 }} size="small">
            <MenuItem value="">All Statuses</MenuItem>
            {Object.entries(statusLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : applications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No applications found</Typography></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Reference</TableCell>
                    <TableCell>Applicant</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id} hover component={Link} href={`/loan-application/${app.id}`} sx={{ textDecoration: 'none', cursor: 'pointer' }}>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{app.referenceNumber}</Typography></TableCell>
                      <TableCell>{app.firstName} {app.lastName}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{app.loanProductType.toLowerCase()}</TableCell>
                      <TableCell align="right">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(app.loanAmount))}</TableCell>
                      <TableCell><Chip label={statusLabels[app.status]} color={statusColors[app.status]} size="small" /></TableCell>
                      <TableCell>{format(new Date(app.createdAt), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
