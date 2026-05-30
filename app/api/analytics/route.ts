import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/validate'

export async function GET(req: NextRequest) {
  try {
    const [
      mostSaved,
      topRated,
      topPlacement,
      totalColleges,
      totalReviews,
      totalUsers,
    ] = await Promise.all([
      prisma.college.findMany({
        take: 5,
        orderBy: { savedBy: { _count: 'desc' } },
        select: { id: true, name: true, slug: true, nirf_rank: true, _count: { select: { savedBy: true } } },
      }),
      prisma.college.findMany({
        take: 5,
        orderBy: { nirf_score: 'desc' },
        select: { id: true, name: true, slug: true, nirf_rank: true, nirf_score: true },
      }),
      prisma.placement.findMany({
        where:   { year: 2024 },
        take:    5,
        orderBy: { average_package_lpa: 'desc' },
        select: {
          average_package_lpa: true,
          highest_package_lpa: true,
          placement_rate_percent: true,
          college: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.college.count(),
      prisma.review.count(),
      prisma.user.count(),
    ])

    return successResponse({
      stats: { totalColleges, totalReviews, totalUsers },
      most_saved:     mostSaved,
      top_rated:      topRated,
      top_placement:  topPlacement,
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return errorResponse('Internal server error')
  }
}
