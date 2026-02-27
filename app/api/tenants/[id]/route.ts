import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/tenants/:id - Fetch single tenant
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        property: true,
        payments: {
          orderBy: {
            date: 'desc'
          },
          take: 12,
        },
        documents: {
          orderBy: {
            uploadedAt: 'desc'
          }
        },
        requests: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            payments: true,
            documents: true,
            requests: true,
          }
        }
      }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Calculate payment stats
    const totalPaid = tenant.payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const pendingPayments = tenant.payments.filter(p => p.status === 'PENDING').length
    const overduePayments = tenant.payments.filter(p => p.status === 'OVERDUE').length

    return NextResponse.json({
      tenant: {
        ...tenant,
        totalPaid,
        pendingPayments,
        overduePayments,
      }
    })
  } catch (error) {
    console.error('Error fetching tenant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenant' },
      { status: 500 }
    )
  }
}

// PUT /api/tenants/:id - Update tenant
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
        leaseStart: new Date(body.leaseStart),
        leaseEnd: body.leaseEnd ? new Date(body.leaseEnd) : null,
        rentAmount: parseFloat(body.rentAmount),
        deposit: parseFloat(body.deposit),
      },
    })

    return NextResponse.json({ tenant })
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json(
      { error: 'Failed to update tenant' },
      { status: 500 }
    )
  }
}

// DELETE /api/tenants/:id - Delete tenant
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete related records first
    await prisma.payment.deleteMany({ where: { tenantId: id } })
    await prisma.maintenanceRequest.deleteMany({ where: { tenantId: id } })
    await prisma.document.deleteMany({ where: { tenantId: id } })

    // Delete tenant
    await prisma.tenant.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json(
      { error: 'Failed to delete tenant' },
      { status: 500 }
    )
  }
}
