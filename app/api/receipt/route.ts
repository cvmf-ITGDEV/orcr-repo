import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateReceiptNumber(type: string): string {
  const prefix = type === 'OFFICIAL_RECEIPT' ? 'OR' : 'CR'
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `${prefix}-${year}${month}-${random}`
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const applicationId = searchParams.get('applicationId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: Record<string, unknown> = {}
  if (applicationId) where.applicationId = applicationId

  const [receipts, total] = await Promise.all([
    prisma.oRCRReceipt.findMany({
      where,
      orderBy: { issuedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        application: { select: { referenceNumber: true, firstName: true, lastName: true } },
        issuedBy: { select: { fullName: true } },
      },
    }),
    prisma.oRCRReceipt.count({ where }),
  ])

  return NextResponse.json({ receipts, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN' && session.user.role !== 'PROCESSOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()

  const application = await prisma.loanApplication.findUnique({ where: { id: body.applicationId } })
  if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  if (!['APPROVED', 'FOR_DISBURSEMENT', 'ACTIVE'].includes(application.status)) return NextResponse.json({ error: 'Cannot issue receipt' }, { status: 400 })

  const receipt = await prisma.oRCRReceipt.create({
    data: {
      receiptNumber: generateReceiptNumber(body.receiptType),
      receiptType: body.receiptType,
      applicationId: body.applicationId,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      paymentReference: body.paymentReference,
      paymentDate: new Date(body.paymentDate),
      payorName: body.payorName,
      payorAddress: body.payorAddress,
      particulars: body.particulars,
      issuedById: session.user.id,
    },
    include: {
      application: { select: { referenceNumber: true, firstName: true, lastName: true } },
      issuedBy: { select: { fullName: true } },
    },
  })

  return NextResponse.json(receipt)
}
