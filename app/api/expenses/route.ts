import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/expenses - Fetch all expenses
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const category = searchParams.get('category')

    const where: any = {}
    
    if (propertyId) {
      where.propertyId = propertyId
    }
    
    if (category) {
      where.category = category
    }

    const expenses = await prisma.expense.findMany({
      where,
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
    })

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.propertyId || !body.category || !body.amount || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        propertyId: body.propertyId,
        category: body.category,
        amount: parseFloat(body.amount),
        date: new Date(body.date),
        description: body.description || null,
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

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}
