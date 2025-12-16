'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert } from '@mui/material'
import { format } from 'date-fns'

interface Receipt {
  id: string
  receiptNumber: string
  receiptType: string
  amount: string
  paymentMethod: string
  paymentDate: string
  payorName: string
  isVoided: boolean
  issuedAt: string
  application: { referenceNumber: string; firstName: string; lastName: string }
  issuedBy: { fullName: string }
}

const formatCurrency = (amount: string | number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount))

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchReceipts() }, [])

  const fetchReceipts = async () => {
    try {
      const response = await fetch('/api/receipt')
      if (!response.ok) throw new Error('Failed')
      setReceipts((await response.json()).receipts || [])
    } catch { setError('Failed to load') }
    finally { setLoading(false) }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Receipts</Typography>
        <Typography color="text.secondary">Official Receipts and Collection Receipts</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <Card>
        <CardContent>
          {receipts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No receipts issued yet</Typography></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Receipt No.</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Application</TableCell>
                    <TableCell>Payor</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id} hover component={Link} href={`/receipts/${receipt.id}`} sx={{ textDecoration: 'none', cursor: 'pointer' }}>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{receipt.receiptNumber}</Typography></TableCell>
                      <TableCell><Chip label={receipt.receiptType === 'OFFICIAL_RECEIPT' ? 'OR' : 'CR'} size="small" color={receipt.receiptType === 'OFFICIAL_RECEIPT' ? 'primary' : 'secondary'} /></TableCell>
                      <TableCell>{receipt.application.referenceNumber}</TableCell>
                      <TableCell>{receipt.payorName}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(receipt.amount)}</TableCell>
                      <TableCell>{format(new Date(receipt.paymentDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{receipt.isVoided ? <Chip label="Voided" size="small" color="error" /> : <Chip label="Valid" size="small" color="success" />}</TableCell>
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
