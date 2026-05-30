import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { validateBody, successResponse, errorResponse } from '@/lib/validate'

function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) return null
  return verifyToken(token)
}

const saveSchema = z.object({
  college_id: z.number().positive(),
  status: z.enum(['shortlisted', 'applied', 'rejected', 'admitted']).default('shortlisted'),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return errorResponse('Unauthorized', 401)

    const saved = await prisma.savedCollege.findMany({
      where: { user_id: user.userId },
      include: {
        college: {
          select: {
            id: true, name: true, slug: true,
            city: true, state: true, type: true,
            nirf_rank: true, naac_grade: true, logo_url: true,
            placements: {
              where: { year: 2024 },
              select: { average_package_lpa: true, placement_rate_percent: true },
            },
            courses: {
              take: 1,
              orderBy: { fees_per_year: 'asc' },
              select: { fees_per_year: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return successResponse({ saved })
  } catch (err) {
    console.error('Saved GET error:', err)
    return errorResponse('Internal server error')
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return errorResponse('Unauthorized', 401)

    const body = await req.json()
    const { error, data } = validateBody(saveSchema, body)
    if (error || !data) return error || errorResponse('Validation failed', 400)

    const college = await prisma.college.findUnique({ where: { id: data.college_id } })
    if (!college) return errorResponse('College not found', 404)

    const existing = await prisma.savedCollege.findUnique({
      where: { user_id_college_id: { user_id: user.userId, college_id: data.college_id } },
    })
    if (existing) return errorResponse('College already saved', 409)

    const saved = await prisma.savedCollege.create({
      data: { user_id: user.userId, college_id: data.college_id, status: data.status, notes: data.notes },
    })

    return successResponse({ saved }, 201)
  } catch (err) {
    console.error('Saved POST error:', err)
    return errorResponse('Internal server error')
  }
}
