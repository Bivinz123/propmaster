import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/payments - Fetch all payments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const propertyId = searchParams.get('propertyId')
    const status = searchParams.get('status')

    const where: any = {}
    
    if (tenantId) {
      where.tenantId = tenantId
    }
    
    if (propertyId) {
      where.tenant = {
        propertyId: propertyId
      }
    }
    
    if (status) {
      where.status = status
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            property: {
              select: {
                id: true,
                address: true,
                city: true,
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// POST /api/payments - Create a new payment
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.tenantId || !body.amount || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.create({
      data: {
        tenantId: body.tenantId,
        amount: parseFloat(body.amount),
        date: new Date(body.date),
        type: body.type || 'RENT',
        status: body.status || 'PENDING',
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            property: {
              select: {
                address: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
