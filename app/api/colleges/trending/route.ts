import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/validate'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    const trending = await prisma.college.findMany({
      take: limit,
      orderBy: { savedBy: { _count: 'desc' } },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        nirf_rank: true,
        naac_grade: true,
        logo_url: true,
        _count: { select: { savedBy: true } },
        placements: {
          where: { year: 2024 },
          select: { average_package_lpa: true, placement_rate_percent: true },
        },
      },
    })

    return successResponse({ trending })
  } catch (err) {
    console.error('Trending error:', err)
    return errorResponse('Internal server error')
  }
}
