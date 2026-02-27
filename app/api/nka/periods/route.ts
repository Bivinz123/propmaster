import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/nka/periods - List all accounting periods
export async function GET() {
  try {
    const periods = await prisma.accountingPeriod.findMany({
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true
          }
        },
        _count: {
          select: {
            costItems: true
          }
        }
      },
      orderBy: {
        year: 'desc'
      }
    })

    return NextResponse.json(periods)
  } catch (error) {
    console.error('Error fetching periods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch periods' },
      { status: 500 }
    )
  }
}

// POST /api/nka/periods - Create new accounting period
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { propertyId, year, startDate, endDate } = body

    if (!propertyId || !year || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if period already exists for this property/year
    const existing = await prisma.accountingPeriod.findFirst({
      where: {
        propertyId,
        year
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Abrechnungszeitraum für dieses Jahr existiert bereits' },
        { status: 400 }
      )
    }

    const period = await prisma.accountingPeriod.create({
      data: {
        propertyId,
        year: parseInt(year),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'DRAFT'
      },
      include: {
        property: true
      }
    })

    return NextResponse.json(period)
  } catch (error) {
    console.error('Error creating period:', error)
    return NextResponse.json(
      { error: 'Failed to create period' },
      { status: 500 }
    )
  }
}
