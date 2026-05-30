import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/validate'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return errorResponse('Unauthorized', 401)

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    if (!payload) return errorResponse('Invalid or expired token', 401)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        created_at: true,
        _count: { select: { savedColleges: true, reviews: true } },
      },
    })

    if (!user) return errorResponse('User not found', 404)
    return successResponse({ user })
  } catch (err) {
    console.error('Me error:', err)
    return errorResponse('Internal server error')
  }
}
