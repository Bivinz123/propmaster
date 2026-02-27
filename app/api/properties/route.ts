import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/properties - Fetch all properties
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        tenants: {
          where: {
            OR: [
              { leaseEnd: null },
              { leaseEnd: { gte: new Date() } }
            ]
          },
          select: {
            id: true,
            rentAmount: true,
          }
        },
        _count: {
          select: {
            tenants: true,
            expenses: true,
            documents: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate monthly revenue and occupied units for each property
    const propertiesWithStats = properties.map(property => ({
      ...property,
      occupiedUnits: property.tenants.length,
      monthlyRevenue: property.tenants.reduce(
        (sum, tenant) => sum + Number(tenant.rentAmount),
        0
      ),
    }))

    return NextResponse.json({ properties: propertiesWithStats })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

// POST /api/properties - Create a new property
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Basic validation
    if (!body.address || !body.city || !body.postalCode || !body.type || !body.units) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For now, hardcode ownerId - will use auth later
    const ownerId = 'user-demo-id'

    // Create or find user first
    let user = await prisma.user.findFirst({
      where: { id: ownerId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: ownerId,
          email: 'demo@propmaster.com',
          name: 'David',
          role: 'MANAGER',
        }
      })
    }

    const property = await prisma.property.create({
      data: {
        address: body.address,
        city: body.city,
        postalCode: body.postalCode,
        type: body.type,
        units: parseInt(body.units),
        purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
        currentValue: body.currentValue ? parseFloat(body.currentValue) : null,
        ownerId: user.id,
      },
      include: {
        _count: {
          select: {
            tenants: true,
          }
        }
      }
    })

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}
