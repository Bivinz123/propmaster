import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/dashboard/stats - Fetch dashboard statistics
export async function GET() {
  try {
    // Total properties
    const totalProperties = await prisma.property.count()

    // Total units and occupied units
    const properties = await prisma.property.findMany({
      select: {
        units: true,
        tenants: {
          where: {
            OR: [
              { leaseEnd: null },
              { leaseEnd: { gte: new Date() } }
            ]
          }
        }
      }
    })

    const totalUnits = properties.reduce((sum, p) => sum + p.units, 0)
    const occupiedUnits = properties.reduce((sum, p) => sum + p.tenants.length, 0)

    // Monthly revenue (sum of active tenant rents)
    const activeTenants = await prisma.tenant.findMany({
      where: {
        OR: [
          { leaseEnd: null },
          { leaseEnd: { gte: new Date() } }
        ]
      },
      select: {
        rentAmount: true
      }
    })

    const monthlyRevenue = activeTenants.reduce(
      (sum, t) => sum + Number(t.rentAmount),
      0
    )

    // Pending tasks (maintenance requests)
    const pendingTasks = await prisma.maintenanceRequest.count({
      where: {
        status: {
          in: ['PENDING', 'IN_PROGRESS']
        }
      }
    })

    // Recent activity - payments
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Recent activity - expenses
    const recentExpenses = await prisma.expense.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: {
            address: true
          }
        }
      }
    })

    // Combine and sort activity
    const activity = [
      ...recentPayments.map(p => ({
        id: p.id,
        type: 'payment',
        description: `${p.type} payment ${p.status.toLowerCase()} from ${p.tenant.firstName} ${p.tenant.lastName}`,
        amount: Number(p.amount),
        time: p.createdAt,
      })),
      ...recentExpenses.map(e => ({
        id: e.id,
        type: 'expense',
        description: `${e.category} expense: ${e.property.address}${e.description ? ' - ' + e.description : ''}`,
        amount: -Number(e.amount),
        time: e.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10)

    return NextResponse.json({
      stats: {
        totalProperties,
        totalUnits,
        occupiedUnits,
        monthlyRevenue,
        pendingTasks,
      },
      recentActivity: activity,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
