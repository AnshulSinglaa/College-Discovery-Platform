import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/validate'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page       = parseInt(searchParams.get('page') || '1')
    const limit      = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
    const search     = searchParams.get('search') || ''
    const state      = searchParams.get('state') || ''
    const type       = searchParams.get('type') || ''
    const minFees    = parseInt(searchParams.get('minFees') || '0')
    const maxFees    = parseInt(searchParams.get('maxFees') || '9999999')
    const minRating  = parseFloat(searchParams.get('minRating') || '0')
    const exam       = searchParams.get('exam') || ''
    const sortBy     = searchParams.get('sortBy') || 'nirf_rank'
    const order      = searchParams.get('order') || 'asc'

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (state) where.state = { contains: state, mode: 'insensitive' }
    if (type)  where.type  = { contains: type,  mode: 'insensitive' }

    if (minFees > 0 || maxFees < 9999999) {
      where.courses = {
        some: {
          fees_per_year: { gte: minFees, lte: maxFees }
        }
      }
    }

    if (minRating > 0) {
      where.reviews = {
        some: { overall_rating: { gte: minRating } }
      }
    }

    if (exam) {
      where.cutoffs = {
        some: { exam: { contains: exam, mode: 'insensitive' } }
      }
    }

    const validSortFields: Record<string, any> = {
      nirf_rank:        { nirf_rank: order },
      nirf_score:       { nirf_score: order === 'asc' ? 'desc' : 'asc' },
      established_year: { established_year: order },
      name:             { name: order },
    }

    const orderBy = validSortFields[sortBy] || { nirf_rank: 'asc' }

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          state: true,
          type: true,
          nirf_rank: true,
          nirf_score: true,
          naac_grade: true,
          logo_url: true,
          total_seats: true,
          website: true,
          placements: {
            where: { year: 2024 },
            select: {
              average_package_lpa: true,
              highest_package_lpa: true,
              placement_rate_percent: true,
            },
          },
          courses: {
            take: 1,
            orderBy: { fees_per_year: 'asc' },
            select: { fees_per_year: true },
          },
          reviews: {
            select: { overall_rating: true },
          },
          _count: { select: { savedBy: true } },
        },
      }),
      prisma.college.count({ where }),
    ])

    const formatted = colleges.map((c) => {
      const avgRating = c.reviews.length
        ? parseFloat((c.reviews.reduce((s, r) => s + r.overall_rating, 0) / c.reviews.length).toFixed(1))
        : null
      return {
        ...c,
        avg_rating: avgRating,
        min_fees: c.courses[0]?.fees_per_year || null,
        placement_2024: c.placements[0] || null,
        saved_count: c._count.savedBy,
        reviews: undefined,
        courses: undefined,
        placements: undefined,
        _count: undefined,
      }
    })

    return successResponse({
      colleges: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      filters: { search, state, type, minFees, maxFees, minRating, exam, sortBy, order },
    })
  } catch (err) {
    console.error('Colleges list error:', err)
    return errorResponse('Internal server error')
  }
}
