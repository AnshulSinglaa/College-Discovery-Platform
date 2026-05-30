import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/validate'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return errorResponse('Unauthorized', 401)
    const user = verifyToken(token)
    if (!user) return errorResponse('Unauthorized', 401)

    const { id } = await params

    const question = await prisma.question.update({
      where: { id: Number(id) },
      data: { upvotes: { increment: 1 } },
      select: { id: true, upvotes: true },
    })

    return successResponse({ question })
  } catch (err) {
    console.error('Vote error:', err)
    return errorResponse('Internal server error')
  }
}
