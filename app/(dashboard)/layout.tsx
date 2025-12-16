import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Box } from '@mui/material'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 4, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  )
}
