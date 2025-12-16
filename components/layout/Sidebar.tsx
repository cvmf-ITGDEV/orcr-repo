'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Avatar, Button } from '@mui/material'
import { Dashboard, Description, Receipt, People, Settings, AddCircle, Logout } from '@mui/icons-material'

const DRAWER_WIDTH = 260

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: <Dashboard />, roles: ['ADMIN', 'PROCESSOR', 'VIEWER'] },
  { label: 'Applications', href: '/loan-application', icon: <Description />, roles: ['ADMIN', 'PROCESSOR', 'VIEWER'] },
  { label: 'New Application', href: '/loan-application/new', icon: <AddCircle />, roles: ['ADMIN', 'PROCESSOR'] },
  { label: 'OR/CR Receipts', href: '/receipts', icon: <Receipt />, roles: ['ADMIN', 'PROCESSOR'] },
  { label: 'Users', href: '/users', icon: <People />, roles: ['ADMIN'] },
  { label: 'Settings', href: '/settings', icon: <Settings />, roles: ['ADMIN'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'VIEWER'
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: 'primary.dark', color: 'white' },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 44, height: 44, bgcolor: 'secondary.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Description sx={{ color: 'black', fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>LoanFlow</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>OR/CR System</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{ borderRadius: 2, bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <ListItemIcon sx={{ color: isActive ? 'secondary.main' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, px: 1 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}>{session?.user?.name?.charAt(0).toUpperCase() || 'U'}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>{session?.user?.name || 'User'}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>{userRole.toLowerCase()}</Typography>
          </Box>
        </Box>
        <Button fullWidth variant="text" startIcon={<Logout />} onClick={() => signOut({ callbackUrl: '/login' })} sx={{ color: 'rgba(255,255,255,0.7)', justifyContent: 'flex-start', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
          Sign Out
        </Button>
      </Box>
    </Drawer>
  )
}
