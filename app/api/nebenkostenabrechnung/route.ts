import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/nebenkostenabrechnung - Generate Nebenkostenabrechnung for a tenant
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const year = searchParams.get('year')

    if (!tenantId || !year) {
      return NextResponse.json(
        { error: 'Missing tenantId or year parameter' },
        { status: 400 }
      )
    }

    // Get tenant with property details
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        property: {
          include: {
            tenants: {
              where: {
                OR: [
                  { leaseEnd: null },
                  { leaseEnd: { gte: new Date(`${year}-01-01`) } }
                ]
              }
            },
            expenses: {
              where: {
                date: {
                  gte: new Date(`${year}-01-01`),
                  lte: new Date(`${year}-12-31`)
                }
              }
            }
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

    // Calculate total units in property
    const totalUnits = tenant.property.units
    const occupiedUnits = tenant.property.tenants.length

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {}
    tenant.property.expenses.forEach(expense => {
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = 0
      }
      expensesByCategory[expense.category] += Number(expense.amount)
    })

    // Calculate allocation for this tenant (per unit)
    const tenantShare = 1 / totalUnits

    // Calculate costs per category for this tenant
    const costsPerCategory: Record<string, {
      total: number
      tenantShare: number
      basis: string
    }> = {}

    Object.entries(expensesByCategory).forEach(([category, total]) => {
      costsPerCategory[category] = {
        total,
        tenantShare: total * tenantShare,
        basis: 'per unit' // Could be 'per sqm' or 'per person' in future
      }
    })

    // Calculate totals
    const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0)
    const totalTenantCosts = Object.values(costsPerCategory).reduce((sum, cat) => sum + cat.tenantShare, 0)

    // Calculate months tenant was active in this year
    const leaseStart = new Date(tenant.leaseStart)
    const leaseEnd = tenant.leaseEnd ? new Date(tenant.leaseEnd) : new Date(`${year}-12-31`)
    const yearStart = new Date(`${year}-01-01`)
    const yearEnd = new Date(`${year}-12-31`)

    const activeStart = leaseStart > yearStart ? leaseStart : yearStart
    const activeEnd = leaseEnd < yearEnd ? leaseEnd : yearEnd

    const monthsActive = Math.ceil(
      (activeEnd.getTime() - activeStart.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )

    const monthlyFactor = monthsActive / 12

    // Apply monthly factor to tenant costs
    const adjustedTenantCosts = totalTenantCosts * monthlyFactor

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: `${tenant.firstName} ${tenant.lastName}`,
        email: tenant.email,
        leaseStart: tenant.leaseStart,
        leaseEnd: tenant.leaseEnd,
      },
      property: {
        id: tenant.property.id,
        address: tenant.property.address,
        city: tenant.property.city,
        totalUnits,
        occupiedUnits,
      },
      period: {
        year: parseInt(year),
        monthsActive,
        monthlyFactor,
      },
      costs: {
        byCategory: costsPerCategory,
        totalPropertyExpenses: totalExpenses,
        totalTenantCosts: totalTenantCosts,
        adjustedTenantCosts: adjustedTenantCosts,
      },
      summary: {
        rentPaid: Number(tenant.rentAmount) * 12 * monthlyFactor,
        nebenkostenCosts: adjustedTenantCosts,
        balance: (Number(tenant.rentAmount) * 12 * monthlyFactor) - adjustedTenantCosts,
      }
    })
  } catch (error) {
    console.error('Error generating Nebenkostenabrechnung:', error)
    return NextResponse.json(
      { error: 'Failed to generate Nebenkostenabrechnung' },
      { status: 500 }
    )
  }
}
