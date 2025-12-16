import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Settings,
  ClipboardList,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'processor', 'viewer'] },
  { name: 'Applications', href: '/applications', icon: FileText, roles: ['admin', 'processor', 'viewer'] },
  { name: 'New Application', href: '/applications/new', icon: ClipboardList, roles: ['admin', 'processor'] },
  { name: 'OR/CR Receipts', href: '/receipts', icon: Receipt, roles: ['admin', 'processor'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] }
]

export function Sidebar() {
  const { user, signOut } = useAuth()

  const filteredNav = navigation.filter(
    (item) => user && item.roles.includes(user.role)
  )

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-royal-900 text-white flex flex-col">
      <div className="p-6 border-b border-royal-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">LoanFlow</h1>
            <p className="text-royal-300 text-xs">OR/CR System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-royal-700 text-white'
                  : 'text-royal-200 hover:bg-royal-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-royal-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 bg-royal-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-royal-300 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm text-royal-200 hover:bg-royal-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
