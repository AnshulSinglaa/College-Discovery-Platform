import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/validate'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''

    if (q.length < 2) return successResponse({ suggestions: [] })

    const colleges = await prisma.college.findMany({
      where: {
        OR: [
          { name:  { contains: q, mode: 'insensitive' } },
          { city:  { contains: q, mode: 'insensitive' } },
          { state: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 8,
      orderBy: { nirf_rank: 'asc' },
      select: { id: true, name: true, slug: true, city: true, state: true, type: true },
    })

    return successResponse({ suggestions: colleges })
  } catch (err) {
    console.error('Suggestions error:', err)
    return errorResponse('Internal server error')
  }
}
