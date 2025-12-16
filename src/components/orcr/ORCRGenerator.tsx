import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input, Select } from '../ui'
import type { LoanApplication } from '../../types/database'

interface ORCRGeneratorProps {
  application: LoanApplication
  onSuccess: () => void
}

const receiptTypes = [
  { value: 'official_receipt', label: 'Official Receipt (OR)' },
  { value: 'collection_receipt', label: 'Collection Receipt (CR)' }
]

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'gcash', label: 'GCash' },
  { value: 'maya', label: 'Maya' },
  { value: 'credit_card', label: 'Credit Card' }
]

export function ORCRGenerator({ application, onSuccess }: ORCRGeneratorProps) {
  const { user } = useAuth()
  const [receiptType, setReceiptType] = useState('official_receipt')
  const [amount, setAmount] = useState(application.approved_amount || application.loan_amount)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    if (!user) return

    setLoading(true)
    setError('')

    const { error: insertError } = await supabase
      .from('orcr_receipts')
      .insert({
        loan_application_id: application.id,
        receipt_type: receiptType as 'official_receipt' | 'collection_receipt',
        amount,
        payment_method: paymentMethod,
        payment_reference: paymentReference || null,
        payment_date: paymentDate,
        issued_by: user.id,
        notes: notes || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error generating receipt:', insertError)
      setError('Failed to generate receipt. Please try again.')
      setLoading(false)
      return
    }

    onSuccess()
  }

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amt)

  return (
    <div className="space-y-6">
      <div className="bg-royal-50 border border-royal-100 rounded-lg p-4">
        <h3 className="font-medium text-royal-900 mb-2">Application Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-royal-600">Reference:</span>{' '}
            <span className="font-medium text-royal-900">{application.reference_number}</span>
          </div>
          <div>
            <span className="text-royal-600">Applicant:</span>{' '}
            <span className="font-medium text-royal-900">
              {application.first_name} {application.last_name}
            </span>
          </div>
          <div>
            <span className="text-royal-600">Loan Amount:</span>{' '}
            <span className="font-medium text-royal-900">{formatCurrency(application.loan_amount)}</span>
          </div>
          {application.approved_amount && (
            <div>
              <span className="text-royal-600">Approved:</span>{' '}
              <span className="font-medium text-green-600">
                {formatCurrency(application.approved_amount)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Receipt Type"
          value={receiptType}
          onChange={(e) => setReceiptType(e.target.value)}
          options={receiptTypes}
          required
        />

        <Input
          label="Amount (PHP)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min={0}
          required
        />

        <Select
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          options={paymentMethods}
          required
        />

        <Input
          label="Payment Reference"
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          placeholder="Check no., Transaction ID, etc."
        />

        <Input
          label="Payment Date"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
          placeholder="Additional notes (optional)"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button variant="ghost" onClick={onSuccess}>
          Cancel
        </Button>
        <Button onClick={handleGenerate} loading={loading}>
          Generate Receipt
        </Button>
      </div>
    </div>
  )
}
