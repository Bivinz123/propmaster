import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/reports/financial - Generate financial report
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const propertyId = searchParams.get('propertyId')

    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    const paymentWhere: any = {}
    const expenseWhere: any = {}

    if (Object.keys(dateFilter).length > 0) {
      paymentWhere.date = dateFilter
      expenseWhere.date = dateFilter
    }

    if (propertyId) {
      expenseWhere.propertyId = propertyId
      paymentWhere.tenant = {
        propertyId: propertyId
      }
    }

    // Fetch payments and expenses
    const [payments, expenses, properties] = await Promise.all([
      prisma.payment.findMany({
        where: paymentWhere,
        include: {
          tenant: {
            include: {
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
      }),
      prisma.expense.findMany({
        where: expenseWhere,
        include: {
          property: {
            select: {
              id: true,
              address: true,
              city: true,
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      }),
      propertyId ? 
        prisma.property.findUnique({
          where: { id: propertyId },
          include: {
            tenants: true,
          }
        }) : 
        prisma.property.findMany({
          include: {
            tenants: true,
          }
        })
    ])

    // Calculate totals
    const totalRevenue = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const totalExpenses = expenses
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const netProfit = totalRevenue - totalExpenses

    // Breakdown by category
    const expenseByCategory: Record<string, number> = {}
    expenses.forEach(expense => {
      if (!expenseByCategory[expense.category]) {
        expenseByCategory[expense.category] = 0
      }
      expenseByCategory[expense.category] += Number(expense.amount)
    })

    // Breakdown by payment type
    const revenueByType: Record<string, number> = {}
    payments
      .filter(p => p.status === 'PAID')
      .forEach(payment => {
        if (!revenueByType[payment.type]) {
          revenueByType[payment.type] = 0
        }
        revenueByType[payment.type] += Number(payment.amount)
      })

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        paymentCount: payments.length,
        expenseCount: expenses.length,
      },
      breakdown: {
        expenseByCategory,
        revenueByType,
      },
      transactions: {
        payments,
        expenses,
      },
      dateRange: {
        start: startDate || 'all',
        end: endDate || 'all',
      }
    })
  } catch (error) {
    console.error('Error generating financial report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
