import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/validate'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return errorResponse('Unauthorized', 401)
    const user = verifyToken(token)
    if (!user) return errorResponse('Unauthorized', 401)

    const saved = await prisma.savedCollege.findMany({
      where: { user_id: user.userId },
      select: { status: true },
    })

    const summary = {
      total:       saved.length,
      shortlisted: saved.filter(s => s.status === 'shortlisted').length,
      applied:     saved.filter(s => s.status === 'applied').length,
      admitted:    saved.filter(s => s.status === 'admitted').length,
      rejected:    saved.filter(s => s.status === 'rejected').length,
    }

    return successResponse({ summary })
  } catch (err) {
    console.error('Saved summary error:', err)
    return errorResponse('Internal server error')
  }
}
