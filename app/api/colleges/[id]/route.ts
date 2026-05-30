import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/validate'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const isSlug = isNaN(Number(id))

    const college = await prisma.college.findFirst({
      where: isSlug ? { slug: id } : { id: Number(id) },
      include: {
        courses: { orderBy: { fees_per_year: 'asc' } },
        placements: { orderBy: { year: 'desc' } },
        cutoffs: { orderBy: [{ year: 'desc' }, { branch: 'asc' }] },
        infrastructure: true,
        reviews: {
          orderBy: { created_at: 'desc' },
          take: 10,
          include: {
            user: { select: { name: true, avatar_url: true } },
          },
        },
        _count: { select: { savedBy: true, reviews: true } },
      },
    })

    if (!college) return errorResponse('College not found', 404)

    const avgRatings = college.reviews.length
      ? {
          overall:        parseFloat((college.reviews.reduce((s, r) => s + r.overall_rating,        0) / college.reviews.length).toFixed(1)),
          academics:      parseFloat((college.reviews.reduce((s, r) => s + r.academics_rating,      0) / college.reviews.length).toFixed(1)),
          placements:     parseFloat((college.reviews.reduce((s, r) => s + r.placement_rating,      0) / college.reviews.length).toFixed(1)),
          infrastructure: parseFloat((college.reviews.reduce((s, r) => s + r.infrastructure_rating, 0) / college.reviews.length).toFixed(1)),
          faculty:        parseFloat((college.reviews.reduce((s, r) => s + r.faculty_rating,        0) / college.reviews.length).toFixed(1)),
        }
      : null

    const similarColleges = await prisma.college.findMany({
      where: {
        id: { not: college.id },
        state: college.state,
        type: college.type,
      },
      take: 4,
      orderBy: { nirf_rank: 'asc' },
      select: { id: true, name: true, slug: true, city: true, nirf_rank: true, naac_grade: true, logo_url: true },
    })

    return successResponse({
      college: {
        ...college,
        avg_ratings: avgRatings,
        saved_count: college._count.savedBy,
        total_reviews: college._count.reviews,
        similar_colleges: similarColleges,
      },
    })
  } catch (err) {
    console.error('College detail error:', err)
    return errorResponse('Internal server error')
  }
}
