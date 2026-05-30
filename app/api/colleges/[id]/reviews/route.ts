import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { validateBody, successResponse, errorResponse } from '@/lib/validate'

const reviewSchema = z.object({
  overall_rating:        z.number().min(1).max(5),
  academics_rating:      z.number().min(1).max(5),
  placement_rating:      z.number().min(1).max(5),
  infrastructure_rating: z.number().min(1).max(5),
  faculty_rating:        z.number().min(1).max(5),
  review_text:           z.string().min(50, 'Review must be at least 50 characters'),
  pros:                  z.string().min(10),
  cons:                  z.string().min(10),
  batch_year:            z.number().min(2000).max(2026),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const page  = parseInt(searchParams.get('page')  || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const college = await prisma.college.findFirst({
      where: isNaN(Number(id)) ? { slug: id } : { id: Number(id) },
    })
    if (!college) return errorResponse('College not found', 404)

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where:   { college_id: college.id },
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { created_at: 'desc' },
        include: { user: { select: { name: true, avatar_url: true } } },
      }),
      prisma.review.count({ where: { college_id: college.id } }),
    ])

    const avgRatings = reviews.length ? {
      overall:        parseFloat((reviews.reduce((s, r) => s + r.overall_rating,        0) / reviews.length).toFixed(1)),
      academics:      parseFloat((reviews.reduce((s, r) => s + r.academics_rating,      0) / reviews.length).toFixed(1)),
      placements:     parseFloat((reviews.reduce((s, r) => s + r.placement_rating,      0) / reviews.length).toFixed(1)),
      infrastructure: parseFloat((reviews.reduce((s, r) => s + r.infrastructure_rating, 0) / reviews.length).toFixed(1)),
      faculty:        parseFloat((reviews.reduce((s, r) => s + r.faculty_rating,        0) / reviews.length).toFixed(1)),
    } : null

    return successResponse({
      reviews,
      avg_ratings: avgRatings,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('Reviews GET error:', err)
    return errorResponse('Internal server error')
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return errorResponse('Unauthorized', 401)
    const user = verifyToken(token)
    if (!user) return errorResponse('Unauthorized', 401)

    const { id } = await params

    const college = await prisma.college.findFirst({
      where: isNaN(Number(id)) ? { slug: id } : { id: Number(id) },
    })
    if (!college) return errorResponse('College not found', 404)

    const existing = await prisma.review.findFirst({
      where: { college_id: college.id, user_id: user.userId },
    })
    if (existing) return errorResponse('You have already reviewed this college', 409)

    const body = await req.json()
    const { error, data } = validateBody(reviewSchema, body)
    if (error) return error

    const review = await prisma.review.create({
      data: { ...data, college_id: college.id, user_id: user.userId },
      include: { user: { select: { name: true } } },
    })

    return successResponse({ review }, 201)
  } catch (err) {
    console.error('Reviews POST error:', err)
    return errorResponse('Internal server error')
  }
}
