import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/validate'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const idsParam = searchParams.get('ids') || ''
    const weightPlacement = parseFloat(searchParams.get('wPlacement') || '0.4')
    const weightFees      = parseFloat(searchParams.get('wFees')      || '0.3')
    const weightRating    = parseFloat(searchParams.get('wRating')    || '0.3')

    const ids = idsParam.split(',').map(Number).filter(Boolean)
    if (ids.length < 2) return errorResponse('Provide at least 2 college IDs (e.g. ?ids=1,2,3)', 400)
    if (ids.length > 3) return errorResponse('Maximum 3 colleges can be compared', 400)

    const colleges = await prisma.college.findMany({
      where: { id: { in: ids } },
      include: {
        courses:        { orderBy: { fees_per_year: 'asc' } },
        placements:     { orderBy: { year: 'desc' } },
        cutoffs:        { where: { year: 2024 }, orderBy: { branch: 'asc' } },
        infrastructure: true,
        reviews:        { select: { overall_rating: true, academics_rating: true, placement_rating: true, infrastructure_rating: true, faculty_rating: true } },
        _count:         { select: { savedBy: true } },
      },
    })

    if (colleges.length < 2) return errorResponse('One or more colleges not found', 404)

    const enriched = colleges.map((c) => {
      const avgRating = c.reviews.length
        ? parseFloat((c.reviews.reduce((s, r) => s + r.overall_rating, 0) / c.reviews.length).toFixed(1))
        : 0
      const minFees        = c.courses[0]?.fees_per_year || 0
      const placement2024  = c.placements[0] || null
      const placementScore = placement2024?.placement_rate_percent || 0

      // Weighted score (0-100)
      const normalizedFees     = minFees > 0 ? Math.max(0, 100 - (minFees / 10000)) : 50
      const normalizedPlace    = placementScore
      const normalizedRating   = avgRating * 20
      const weightedScore      = parseFloat((
        (normalizedPlace  * weightPlacement) +
        (normalizedFees   * weightFees)      +
        (normalizedRating * weightRating)
      ).toFixed(2))

      return {
        id:              c.id,
        name:            c.name,
        slug:            c.slug,
        city:            c.city,
        state:           c.state,
        type:            c.type,
        nirf_rank:       c.nirf_rank,
        nirf_score:      c.nirf_score,
        naac_grade:      c.naac_grade,
        established_year: c.established_year,
        website:         c.website,
        total_seats:     c.total_seats,
        campus_size_acres: c.campus_size_acres,
        min_fees:        minFees,
        avg_rating:      avgRating,
        placement_2024:  placement2024,
        infrastructure:  c.infrastructure,
        courses_count:   c.courses.length,
        courses:         c.courses,
        cutoffs_2024:    c.cutoffs,
        saved_count:     c._count.savedBy,
        weighted_score:  weightedScore,
        rating_breakdown: c.reviews.length ? {
          academics:      parseFloat((c.reviews.reduce((s, r) => s + r.academics_rating,      0) / c.reviews.length).toFixed(1)),
          placements:     parseFloat((c.reviews.reduce((s, r) => s + r.placement_rating,      0) / c.reviews.length).toFixed(1)),
          infrastructure: parseFloat((c.reviews.reduce((s, r) => s + r.infrastructure_rating, 0) / c.reviews.length).toFixed(1)),
          faculty:        parseFloat((c.reviews.reduce((s, r) => s + r.faculty_rating,        0) / c.reviews.length).toFixed(1)),
        } : null,
      }
    })

    // Determine winners per category
    const winners = {
      nirf_rank:       enriched.reduce((a, b) => a.nirf_rank < b.nirf_rank ? a : b).name,
      fees:            enriched.reduce((a, b) => a.min_fees < b.min_fees ? a : b).name,
      placement_rate:  enriched.reduce((a, b) => (a.placement_2024?.placement_rate_percent || 0) > (b.placement_2024?.placement_rate_percent || 0) ? a : b).name,
      avg_package:     enriched.reduce((a, b) => (a.placement_2024?.average_package_lpa || 0) > (b.placement_2024?.average_package_lpa || 0) ? a : b).name,
      rating:          enriched.reduce((a, b) => a.avg_rating > b.avg_rating ? a : b).name,
      weighted_score:  enriched.reduce((a, b) => a.weighted_score > b.weighted_score ? a : b).name,
    }

    return successResponse({
      colleges: enriched,
      winners,
      weights: { placement: weightPlacement, fees: weightFees, rating: weightRating },
      overall_winner: winners.weighted_score,
    })
  } catch (err) {
    console.error('Compare error:', err)
    return errorResponse('Internal server error')
  }
}
