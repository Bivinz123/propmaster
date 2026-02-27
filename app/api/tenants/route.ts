import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/tenants - Fetch all tenants
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    const where = propertyId ? { propertyId } : {}

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
          }
        },
        _count: {
          select: {
            payments: true,
            documents: true,
            requests: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Add lease status
    const tenantsWithStatus = tenants.map(tenant => ({
      ...tenant,
      leaseStatus: !tenant.leaseEnd || new Date(tenant.leaseEnd) > new Date() 
        ? 'ACTIVE' 
        : 'EXPIRED'
    }))

    return NextResponse.json({ tenants: tenantsWithStatus })
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    )
  }
}

// POST /api/tenants - Create a new tenant
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Basic validation
    if (!body.firstName || !body.lastName || !body.email || !body.propertyId || 
        !body.leaseStart || !body.rentAmount || !body.deposit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: body.propertyId }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const tenant = await prisma.tenant.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
        propertyId: body.propertyId,
        leaseStart: new Date(body.leaseStart),
        leaseEnd: body.leaseEnd ? new Date(body.leaseEnd) : null,
        rentAmount: parseFloat(body.rentAmount),
        deposit: parseFloat(body.deposit),
      },
      include: {
        property: {
          select: {
            address: true,
            city: true,
          }
        }
      }
    })

    return NextResponse.json({ tenant }, { status: 201 })
  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    )
  }
}
