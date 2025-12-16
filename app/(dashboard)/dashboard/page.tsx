import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { Box, Typography, Grid2 as Grid, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material'
import { Add, Description, AccessTime, CheckCircle, Cancel, TrendingUp, MonetizationOn } from '@mui/icons-material'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { statusColors, statusLabels } from '@/lib/theme'
import { format } from 'date-fns'

async function getStats() {
  const [total, submitted, pendingVetting, approved, active, disapproved] = await Promise.all([
    prisma.loanApplication.count(),
    prisma.loanApplication.count({ where: { status: 'SUBMITTED' } }),
    prisma.loanApplication.count({ where: { status: 'PENDING_VETTING' } }),
    prisma.loanApplication.count({ where: { status: 'APPROVED' } }),
    prisma.loanApplication.count({ where: { status: 'ACTIVE' } }),
    prisma.loanApplication.count({ where: { status: 'DISAPPROVED' } }),
  ])
  return { total, submitted, pendingVetting, approved, active, disapproved }
}

async function getRecentApplications() {
  return prisma.loanApplication.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { id: true, referenceNumber: true, firstName: true, lastName: true, loanProductType: true, loanAmount: true, status: true, createdAt: true },
  })
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{icon}</Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

async function DashboardContent() {
  const session = await getServerSession(authOptions)
  const stats = await getStats()
  const recentApplications = await getRecentApplications()
  const canCreate = session?.user?.role === 'ADMIN' || session?.user?.role === 'PROCESSOR'

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Dashboard</Typography>
          <Typography color="text.secondary">Welcome back, {session?.user?.name}</Typography>
        </Box>
        {canCreate && (
          <Button component={Link} href="/loan-application/new" variant="contained" startIcon={<Add />}>New Application</Button>
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}><StatCard title="Total Applications" value={stats.total} icon={<Description />} color="#1e3a8a" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}><StatCard title="Submitted" value={stats.submitted} icon={<AccessTime />} color="#0288d1" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}><StatCard title="Pending Vetting" value={stats.pendingVetting} icon={<TrendingUp />} color="#ed6c02" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}><StatCard title="Approved" value={stats.approved} icon={<CheckCircle />} color="#2e7d32" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}><StatCard title="Active Loans" value={stats.active} icon={<MonetizationOn />} color="#1e3a8a" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}><StatCard title="Disapproved" value={stats.disapproved} icon={<Cancel />} color="#d32f2f" /></Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Applications</Typography>
            <Button component={Link} href="/loan-application" size="small">View All</Button>
          </Box>
          {recentApplications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Description sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">No applications yet</Typography>
            </Box>
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
                  {recentApplications.map((app) => (
                    <TableRow key={app.id} hover component={Link} href={`/loan-application/${app.id}`} sx={{ textDecoration: 'none', cursor: 'pointer' }}>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{app.referenceNumber}</Typography></TableCell>
                      <TableCell>{app.firstName} {app.lastName}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{app.loanProductType.toLowerCase().replace('_', ' ')}</TableCell>
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
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>}>
      <DashboardContent />
    </Suspense>
  )
}
