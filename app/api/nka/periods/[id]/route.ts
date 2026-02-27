import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/nka/periods/[id] - Get period details with costs
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const period = await prisma.accountingPeriod.findUnique({
      where: { id: params.id },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            units: true,
            totalSquareMeters: true
          }
        },
        costItems: {
          include: {
            category: {
              select: {
                nameDE: true,
                allocationType: true,
                betrkvSection: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!period) {
      return NextResponse.json(
        { error: 'Period not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(period)
  } catch (error) {
    console.error('Error fetching period:', error)
    return NextResponse.json(
      { error: 'Failed to fetch period' },
      { status: 500 }
    )
  }
}

// PUT /api/nka/periods/[id] - Update period status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    const period = await prisma.accountingPeriod.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'FINALIZED' && { finalizedAt: new Date() })
      }
    })

    return NextResponse.json(period)
  } catch (error) {
    console.error('Error updating period:', error)
    return NextResponse.json(
      { error: 'Failed to update period' },
      { status: 500 }
    )
  }
}
