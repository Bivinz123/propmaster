import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateNebenkostenabrechnung, validateNKAInputs } from '@/lib/nkaCalculations'

// GET /api/nka-pro/generate?tenantId=X&periodId=Y
// Professional Nebenkostenabrechnung with full calculations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const periodId = searchParams.get('periodId')

    if (!tenantId || !periodId) {
      return NextResponse.json(
        { error: 'Missing tenantId or periodId parameter' },
        { status: 400 }
      )
    }

    // Fetch accounting period with costs
    const period = await prisma.accountingPeriod.findUnique({
      where: { id: periodId },
      include: {
        costItems: {
          include: {
            category: true
          }
        },
        property: {
          include: {
            tenants: {
              where: {
                OR: [
                  { leaseEnd: null },
                  { leaseEnd: { gte: new Date(period?.startDate || new Date()) } }
                ]
              }
            }
          }
        }
      }
    })

    if (!period) {
      return NextResponse.json(
        { error: 'Accounting period not found' },
        { status: 404 }
      )
    }

    // Fetch tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        meters: {
          include: {
            readings: {
              where: {
                readingDate: {
                  gte: period.startDate,
                  lte: period.endDate
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

    // Fetch advance payments for this period
    const advancePayments = await prisma.advancePayment.findMany({
      where: {
        tenantId,
        periodId
      }
    })

    // Calculate meter readings (consumption per category)
    const meterReadings: Record<string, number> = {}
    tenant.meters.forEach(meter => {
      const latestReading = meter.readings[meter.readings.length - 1]
      if (latestReading && latestReading.consumption) {
        const categoryMap: Record<string, string> = {
          'HEATING': 'Heizkosten',
          'HOT_WATER': 'Warmwasser',
          'COLD_WATER': 'Wasserversorgung'
        }
        const category = categoryMap[meter.meterType]
        if (category) {
          meterReadings[category] = Number(latestReading.consumption)
        }
      }
    })

    // Prepare calculation parameters
    const params = {
      tenant: {
        id: tenant.id,
        squareMeters: tenant.squareMeters ? Number(tenant.squareMeters) : null,
        numberOfPersons: tenant.numberOfPersons,
        eigentumsanteil: tenant.eigentumsanteil ? Number(tenant.eigentumsanteil) : null,
        leaseStart: tenant.leaseStart,
        leaseEnd: tenant.leaseEnd
      },
      allTenants: period.property.tenants.map(t => ({
        id: t.id,
        squareMeters: t.squareMeters ? Number(t.squareMeters) : null,
        numberOfPersons: t.numberOfPersons,
        eigentumsanteil: t.eigentumsanteil ? Number(t.eigentumsanteil) : null,
        leaseStart: t.leaseStart,
        leaseEnd: t.leaseEnd
      })),
      costItems: period.costItems.map(item => ({
        category: {
          allocationType: item.category.allocationType,
          nameDE: item.category.nameDE
        },
        totalAmount: Number(item.totalAmount),
        allocableAmount: item.allocableAmount ? Number(item.allocableAmount) : null
      })),
      periodStart: period.startDate,
      periodEnd: period.endDate,
      totalSquareMeters: period.property.totalSquareMeters ? Number(period.property.totalSquareMeters) : 0,
      totalUnits: period.property.units,
      meterReadings,
      advancePayments: advancePayments.map(adv => ({
        totalPaid: Number(adv.totalPaid)
      }))
    }

    // Validate inputs
    const errors = validateNKAInputs(params)
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Calculate
    const result = calculateNebenkostenabrechnung(params)

    // Return comprehensive result
    return NextResponse.json({
      period: {
        id: period.id,
        year: period.year,
        startDate: period.startDate,
        endDate: period.endDate,
        status: period.status
      },
      tenant: {
        id: tenant.id,
        name: `${tenant.firstName} ${tenant.lastName}`,
        email: tenant.email,
        squareMeters: tenant.squareMeters,
        numberOfPersons: tenant.numberOfPersons,
        leaseStart: tenant.leaseStart,
        leaseEnd: tenant.leaseEnd
      },
      property: {
        id: period.property.id,
        address: period.property.address,
        city: period.property.city,
        totalSquareMeters: period.property.totalSquareMeters,
        totalUnits: period.property.units,
        occupiedUnits: period.property.tenants.length
      },
      calculation: result
    })
  } catch (error) {
    console.error('Error generating NKA:', error)
    return NextResponse.json(
      { error: 'Failed to generate Nebenkostenabrechnung', details: (error as Error).message },
      { status: 500 }
    )
  }
}
