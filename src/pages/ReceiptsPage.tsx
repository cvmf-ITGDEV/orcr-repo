import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, Search, Printer, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Card, Button, Badge, Spinner, Select, Modal } from '../components/ui'
import type { ORCRReceipt, LoanApplication } from '../types/database'
import { format } from 'date-fns'

interface ReceiptWithApplication extends ORCRReceipt {
  loan_application: Pick<LoanApplication, 'reference_number' | 'first_name' | 'last_name'>
}

export function ReceiptsPage() {
  const { user, hasRole } = useAuth()
  const [receipts, setReceipts] = useState<ReceiptWithApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showVoidModal, setShowVoidModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptWithApplication | null>(null)
  const [voidReason, setVoidReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchReceipts()
  }, [])

  async function fetchReceipts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('orcr_receipts')
      .select(`
        *,
        loan_application:loan_applications(reference_number, first_name, last_name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching receipts:', error)
    } else {
      setReceipts((data as ReceiptWithApplication[]) || [])
    }
    setLoading(false)
  }

  async function handleVoidReceipt() {
    if (!selectedReceipt || !user || !voidReason.trim()) return

    setProcessing(true)
    const { error } = await supabase
      .from('orcr_receipts')
      .update({
        voided: true,
        voided_by: user.id,
        voided_at: new Date().toISOString(),
        void_reason: voidReason
      })
      .eq('id', selectedReceipt.id)

    if (error) {
      console.error('Error voiding receipt:', error)
    } else {
      fetchReceipts()
      setShowVoidModal(false)
      setSelectedReceipt(null)
      setVoidReason('')
    }
    setProcessing(false)
  }

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      searchTerm === '' ||
      receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.loan_application?.reference_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === '' || receipt.receipt_type === typeFilter

    return matchesSearch && matchesType
  })

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'official_receipt', label: 'Official Receipt' },
    { value: 'collection_receipt', label: 'Collection Receipt' }
  ]

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)

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
          <h1 className="text-2xl font-bold text-gray-900">OR/CR Receipts</h1>
          <p className="text-gray-500 mt-1">{receipts.length} total receipts</p>
        </div>
      </div>

      <Card className="mb-6" padding="sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by receipt or reference number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
            />
          </div>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={typeOptions}
            className="w-48"
          />
        </div>
      </Card>

      {filteredReceipts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {receipts.length === 0 ? 'No receipts yet' : 'No receipts match your filters'}
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
                    Receipt No.
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReceipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className={`hover:bg-gray-50 transition-colors ${receipt.voided ? 'opacity-60' : ''}`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">{receipt.receipt_number}</td>
                    <td className="py-3 px-4">
                      <Badge variant={receipt.receipt_type === 'official_receipt' ? 'info' : 'default'}>
                        {receipt.receipt_type === 'official_receipt' ? 'OR' : 'CR'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/applications/${receipt.loan_application_id}`}
                        className="text-royal-600 hover:text-royal-700"
                      >
                        {receipt.loan_application?.reference_number}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {receipt.loan_application?.first_name} {receipt.loan_application?.last_name}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatCurrency(receipt.amount)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 capitalize">
                      {receipt.payment_method?.replace('_', ' ')}
                      {receipt.payment_reference && (
                        <p className="text-xs text-gray-400">{receipt.payment_reference}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {format(new Date(receipt.payment_date), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      {receipt.voided ? (
                        <Badge variant="danger">Voided</Badge>
                      ) : (
                        <Badge variant="success">Valid</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" disabled={receipt.voided}>
                          <Printer className="w-4 h-4" />
                        </Button>
                        {hasRole(['admin']) && !receipt.voided && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReceipt(receipt)
                              setShowVoidModal(true)
                            }}
                          >
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
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

      <Modal isOpen={showVoidModal} onClose={() => setShowVoidModal(false)} title="Void Receipt">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to void receipt{' '}
            <span className="font-medium">{selectedReceipt?.receipt_number}</span>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Voiding <span className="text-red-500">*</span>
            </label>
            <textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
              placeholder="Please provide a reason..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowVoidModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleVoidReceipt}
              loading={processing}
              disabled={!voidReason.trim()}
            >
              Void Receipt
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
