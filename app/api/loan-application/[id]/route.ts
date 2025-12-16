import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const application = await prisma.loanApplication.findUnique({
    where: { id },
    include: {
      dependents: true,
      characterReferences: true,
      tradeReferences: true,
      receipts: { orderBy: { issuedAt: 'desc' } },
      createdBy: { select: { id: true, fullName: true, email: true } },
      processedBy: { select: { id: true, fullName: true, email: true } },
    },
  })

  if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  return NextResponse.json(application)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { action, ...data } = body

  const existing = await prisma.loanApplication.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  let updateData: Record<string, unknown> = {}

  switch (action) {
    case 'start_vetting':
      if (existing.status !== 'SUBMITTED') return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      updateData = { status: 'PENDING_VETTING', vettingStartedAt: new Date(), processedById: session.user.id }
      break
    case 'approve':
      if (!['PENDING_VETTING', 'SUBMITTED'].includes(existing.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      updateData = { status: 'APPROVED', approvedAt: new Date(), approvalNotes: data.notes, approvedAmount: data.approvedAmount || existing.loanAmount, interestRate: data.interestRate, processedById: session.user.id }
      break
    case 'disapprove':
      if (!['PENDING_VETTING', 'SUBMITTED'].includes(existing.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      updateData = { status: 'DISAPPROVED', rejectionReason: data.reason, processedById: session.user.id }
      break
    case 'for_disbursement':
      if (existing.status !== 'APPROVED') return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      updateData = { status: 'FOR_DISBURSEMENT', disbursementAt: new Date() }
      break
    case 'activate':
      if (existing.status !== 'FOR_DISBURSEMENT') return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      updateData = { status: 'ACTIVE', fundsReleasedAt: new Date() }
      break
    case 'mark_paid':
      if (existing.status !== 'ACTIVE') return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      updateData = { status: 'FULLY_PAID', completedAt: new Date() }
      break
    case 'cancel':
      if (['ACTIVE', 'FULLY_PAID', 'CANCELLED'].includes(existing.status)) return NextResponse.json({ error: 'Cannot cancel' }, { status: 400 })
      updateData = { status: 'CANCELLED', cancelledAt: new Date(), rejectionReason: data.reason }
      break
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const application = await prisma.loanApplication.update({ where: { id }, data: updateData })
  return NextResponse.json(application)
}
