import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/properties/:id - Fetch single property
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        tenants: {
          where: {
            OR: [
              { leaseEnd: null },
              { leaseEnd: { gte: new Date() } }
            ]
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            rentAmount: true,
            leaseStart: true,
            leaseEnd: true,
          }
        },
        expenses: {
          orderBy: {
            date: 'desc'
          },
          take: 10,
        },
        documents: {
          orderBy: {
            uploadedAt: 'desc'
          },
          take: 10,
        },
        _count: {
          select: {
            tenants: true,
            expenses: true,
            documents: true,
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Calculate stats
    const monthlyRevenue = property.tenants.reduce(
      (sum, tenant) => sum + Number(tenant.rentAmount),
      0
    )

    const totalExpenses = property.expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    )

    return NextResponse.json({
      property: {
        ...property,
        occupiedUnits: property.tenants.length,
        monthlyRevenue,
        totalExpenses,
      }
    })
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

// PUT /api/properties/:id - Update property
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const property = await prisma.property.update({
      where: { id },
      data: {
        address: body.address,
        city: body.city,
        postalCode: body.postalCode,
        type: body.type,
        units: parseInt(body.units),
        purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
        currentValue: body.currentValue ? parseFloat(body.currentValue) : null,
      },
    })

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/:id - Delete property
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if property has tenants
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tenants: true }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    if (property._count.tenants > 0) {
      return NextResponse.json(
        { error: 'Cannot delete property with active tenants' },
        { status: 400 }
      )
    }

    // Delete related records first
    await prisma.expense.deleteMany({ where: { propertyId: id } })
    await prisma.document.deleteMany({ where: { propertyId: id } })

    // Delete property
    await prisma.property.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}
