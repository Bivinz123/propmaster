import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/nka/categories - List all cost categories
export async function GET() {
  try {
    const categories = await prisma.costCategory.findMany({
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
