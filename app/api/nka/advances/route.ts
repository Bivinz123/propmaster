import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/nka/advances - List all advance payments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const periodId = searchParams.get('periodId')

    const where: any = {}
    if (tenantId) where.tenantId = tenantId
    if (periodId) where.periodId = periodId

    const advances = await prisma.advancePayment.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        period: {
          include: {
            property: {
              select: {
                address: true,
                city: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(advances)
  } catch (error) {
    console.error('Error fetching advances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch advances' },
      { status: 500 }
    )
  }
}

// POST /api/nka/advances - Create advance payment
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      tenantId,
      periodId,
      monthlyAmount,
      monthsPaid,
      totalPaid,
      startMonth,
      endMonth
    } = body

    if (!tenantId || !periodId || !monthlyAmount || !monthsPaid || !startMonth || !endMonth) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const advance = await prisma.advancePayment.create({
      data: {
        tenantId,
        periodId,
        monthlyAmount,
        monthsPaid,
        totalPaid,
        startMonth: new Date(startMonth),
        endMonth: new Date(endMonth)
      },
      include: {
        tenant: true,
        period: true
      }
    })

    return NextResponse.json(advance)
  } catch (error) {
    console.error('Error creating advance payment:', error)
    return NextResponse.json(
      { error: 'Failed to create advance payment' },
      { status: 500 }
    )
  }
}
