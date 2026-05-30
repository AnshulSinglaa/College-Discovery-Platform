import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { validateBody, successResponse, errorResponse } from '@/lib/validate'

const questionSchema = z.object({
  title:      z.string().min(10, 'Title must be at least 10 characters'),
  body:       z.string().min(20, 'Body must be at least 20 characters'),
  college_id: z.number().optional(),
  tags:       z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page       = parseInt(searchParams.get('page') || '1')
    const limit      = parseInt(searchParams.get('limit') || '10')
    const college_id = searchParams.get('collegeId')
    const tag        = searchParams.get('tag')
    const sort       = searchParams.get('sort') || 'latest'

    const where: any = {}
    if (college_id) where.college_id = Number(college_id)
    if (tag) where.tags = { has: tag }

    const orderBy = sort === 'popular'
      ? { upvotes: 'desc' as const }
      : { created_at: 'desc' as const }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          user:   { select: { id: true, name: true, avatar_url: true } },
          _count: { select: { answers: true } },
        },
      }),
      prisma.question.count({ where }),
    ])

    return successResponse({
      questions,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('Discussions GET error:', err)
    return errorResponse('Internal server error')
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return errorResponse('Unauthorized', 401)
    const user = verifyToken(token)
    if (!user) return errorResponse('Unauthorized', 401)

    const body = await req.json()
    const { error, data } = validateBody(questionSchema, body)
    if (error || !data) return error || errorResponse('Validation failed', 400)

    const question = await prisma.question.create({
      data: { ...data, user_id: user.userId },
      include: { user: { select: { id: true, name: true } } },
    })

    return successResponse({ question }, 201)
  } catch (err) {
    console.error('Discussions POST error:', err)
    return errorResponse('Internal server error')
  }
}
