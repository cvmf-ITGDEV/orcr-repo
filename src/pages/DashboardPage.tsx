import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Card, Button, StatusBadge, Spinner } from '../components/ui'
import type { LoanApplication } from '../types/database'
import { format } from 'date-fns'

interface DashboardStats {
  total: number
  draft: number
  submitted: number
  underReview: number
  approved: number
  rejected: number
}

export function DashboardPage() {
  const { user, hasRole } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentApplications, setRecentApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)

    const { data: applications, error } = await supabase
      .from('loan_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching applications:', error)
      setLoading(false)
      return
    }

    const allApps = applications || []
    setRecentApplications(allApps.slice(0, 5))

    setStats({
      total: allApps.length,
      draft: allApps.filter((a) => a.status === 'draft').length,
      submitted: allApps.filter((a) => a.status === 'submitted').length,
      underReview: allApps.filter((a) => a.status === 'under_review').length,
      approved: allApps.filter((a) => a.status === 'approved').length,
      rejected: allApps.filter((a) => a.status === 'rejected').length
    })

    setLoading(false)
  }

  const statCards = [
    { label: 'Total Applications', value: stats?.total || 0, icon: FileText, color: 'bg-royal-500' },
    { label: 'Drafts', value: stats?.draft || 0, icon: Clock, color: 'bg-gray-500' },
    { label: 'Submitted', value: stats?.submitted || 0, icon: AlertCircle, color: 'bg-blue-500' },
    { label: 'Under Review', value: stats?.underReview || 0, icon: TrendingUp, color: 'bg-amber-500' },
    { label: 'Approved', value: stats?.approved || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Rejected', value: stats?.rejected || 0, icon: XCircle, color: 'bg-red-500' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.full_name}</p>
        </div>
        {hasRole(['admin', 'processor']) && (
          <Link to="/applications/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 ${stat.color} opacity-10 rounded-bl-full`} />
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          <Link to="/applications" className="text-sm text-royal-600 hover:text-royal-700 font-medium">
            View all
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No applications yet</p>
            {hasRole(['admin', 'processor']) && (
              <Link to="/applications/new">
                <Button variant="outline" className="mt-4">
                  Create your first application
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        to={`/applications/${app.id}`}
                        className="text-royal-600 hover:text-royal-700 font-medium"
                      >
                        {app.reference_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {app.first_name} {app.last_name}
                    </td>
                    <td className="py-3 px-4 text-gray-600 capitalize">{app.loan_type}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(
                        app.loan_amount
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {format(new Date(app.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
