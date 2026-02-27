import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/nka/costs - Add cost item to period
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      periodId,
      categoryId,
      totalAmount,
      allocableAmount,
      description,
      invoiceNumber,
      invoiceDate
    } = body

    if (!periodId || !categoryId || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const costItem = await prisma.costItem.create({
      data: {
        periodId,
        categoryId,
        totalAmount,
        allocableAmount: allocableAmount || totalAmount,
        description: description || null,
        invoiceNumber: invoiceNumber || null,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(costItem)
  } catch (error) {
    console.error('Error creating cost item:', error)
    return NextResponse.json(
      { error: 'Failed to create cost item' },
      { status: 500 }
    )
  }
}
