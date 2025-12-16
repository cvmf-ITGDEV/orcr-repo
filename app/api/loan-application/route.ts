import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateReferenceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `LA-${year}${month}-${random}`
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  const [applications, total] = await Promise.all([
    prisma.loanApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, referenceNumber: true, applicationType: true, status: true, loanProductType: true, loanAmount: true, loanTermMonths: true, firstName: true, lastName: true, createdAt: true, updatedAt: true },
    }),
    prisma.loanApplication.count({ where }),
  ])

  return NextResponse.json({ applications, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN' && session.user.role !== 'PROCESSOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()

  const application = await prisma.loanApplication.create({
    data: {
      referenceNumber: generateReferenceNumber(),
      applicationType: body.applicationType || 'NEW',
      status: body.status || 'DRAFT',
      currentStep: body.currentStep || 1,
      referralSource: body.referralSource,
      loanProductType: body.loanProductType || 'PERSONAL',
      loanAmount: body.loanAmount || 0,
      loanTermMonths: body.loanTermMonths || 12,
      loanPurpose: body.loanPurpose,
      firstName: body.firstName || '',
      middleName: body.middleName,
      lastName: body.lastName || '',
      suffix: body.suffix,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: body.gender || null,
      civilStatus: body.civilStatus || null,
      nationality: body.nationality || 'Filipino',
      motherMaidenName: body.motherMaidenName,
      mobileNumber: body.mobileNumber,
      telephoneNumber: body.telephoneNumber,
      emailAddress: body.emailAddress,
      presentStreet: body.presentStreet,
      presentBarangay: body.presentBarangay,
      presentCity: body.presentCity,
      presentProvince: body.presentProvince,
      presentRegion: body.presentRegion,
      presentZipCode: body.presentZipCode,
      presentYearsStay: body.presentYearsStay,
      permanentSameAsPresent: body.permanentSameAsPresent ?? true,
      primaryIdType: body.primaryIdType,
      primaryIdNumber: body.primaryIdNumber,
      primaryIdExpiry: body.primaryIdExpiry ? new Date(body.primaryIdExpiry) : null,
      tin: body.tin,
      sssGsis: body.sssGsis,
      highestEducation: body.highestEducation,
      collateralType: body.collateralType,
      collateralValue: body.collateralValue,
      residenceOwnership: body.residenceOwnership || null,
      monthlyRent: body.monthlyRent,
      residenceYears: body.residenceYears,
      spouseFirstName: body.spouseFirstName,
      spouseLastName: body.spouseLastName,
      spouseMonthlyIncome: body.spouseMonthlyIncome,
      numberOfDependents: body.numberOfDependents || 0,
      primaryIncomeSource: body.primaryIncomeSource || null,
      employerName: body.employerName,
      jobPosition: body.jobPosition,
      monthlyNetSalary: body.monthlyNetSalary,
      businessName: body.businessName,
      businessNetIncome: body.businessNetIncome,
      monthlyExpenses: body.monthlyExpenses,
      existingLoanPayments: body.existingLoanPayments,
      hasCoBorrower: body.hasCoBorrower || false,
      coBorrowerFirstName: body.coBorrowerFirstName,
      coBorrowerLastName: body.coBorrowerLastName,
      coBorrowerMonthlyIncome: body.coBorrowerMonthlyIncome,
      undertakingSigned: body.undertakingSigned || false,
      privacyNoticeSigned: body.privacyNoticeSigned || false,
      signedAt: body.undertakingSigned && body.privacyNoticeSigned ? new Date() : null,
      submittedAt: body.status === 'SUBMITTED' ? new Date() : null,
      createdById: session.user.id,
    },
  })

  return NextResponse.json(application)
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, ...updateData } = body

  if (!id) return NextResponse.json({ error: 'Application ID required' }, { status: 400 })

  const existing = await prisma.loanApplication.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  if (existing.status !== 'DRAFT' && updateData.status !== 'SUBMITTED') return NextResponse.json({ error: 'Cannot edit submitted application' }, { status: 400 })

  const application = await prisma.loanApplication.update({
    where: { id },
    data: {
      currentStep: updateData.currentStep,
      status: updateData.status,
      loanProductType: updateData.loanProductType,
      loanAmount: updateData.loanAmount,
      loanTermMonths: updateData.loanTermMonths,
      loanPurpose: updateData.loanPurpose,
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null,
      gender: updateData.gender || null,
      civilStatus: updateData.civilStatus || null,
      mobileNumber: updateData.mobileNumber,
      emailAddress: updateData.emailAddress,
      presentStreet: updateData.presentStreet,
      presentCity: updateData.presentCity,
      presentProvince: updateData.presentProvince,
      primaryIdType: updateData.primaryIdType,
      primaryIdNumber: updateData.primaryIdNumber,
      residenceOwnership: updateData.residenceOwnership || null,
      primaryIncomeSource: updateData.primaryIncomeSource || null,
      employerName: updateData.employerName,
      monthlyNetSalary: updateData.monthlyNetSalary,
      businessName: updateData.businessName,
      businessNetIncome: updateData.businessNetIncome,
      monthlyExpenses: updateData.monthlyExpenses,
      undertakingSigned: updateData.undertakingSigned,
      privacyNoticeSigned: updateData.privacyNoticeSigned,
      submittedAt: updateData.status === 'SUBMITTED' ? new Date() : existing.submittedAt,
    },
  })

  return NextResponse.json(application)
}
