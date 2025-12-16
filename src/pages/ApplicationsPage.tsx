import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Button, Card, StatusBadge, Spinner, Select } from '../components/ui'
import type { LoanApplication } from '../types/database'
import { format } from 'date-fns'

export function ApplicationsPage() {
  const { hasRole } = useAuth()
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loanTypeFilter, setLoanTypeFilter] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    setLoading(true)
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications:', error)
    } else {
      setApplications(data || [])
    }
    setLoading(false)
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchTerm === '' ||
      app.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === '' || app.status === statusFilter
    const matchesType = loanTypeFilter === '' || app.loan_type === loanTypeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ]

  const loanTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' },
    { value: 'housing', label: 'Housing' },
    { value: 'auto', label: 'Auto' },
    { value: 'education', label: 'Education' }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
          <p className="text-gray-500 mt-1">{applications.length} total applications</p>
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

      <Card className="mb-6" padding="sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              className="w-40"
            />
            <Select
              value={loanTypeFilter}
              onChange={(e) => setLoanTypeFilter(e.target.value)}
              options={loanTypeOptions}
              className="w-40"
            />
          </div>
        </div>
      </Card>

      {filteredApplications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {applications.length === 0
                ? 'No applications yet'
                : 'No applications match your filters'}
            </p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/applications/${app.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        {app.status === 'draft' && hasRole(['admin', 'processor']) && (
                          <Link to={`/applications/${app.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
