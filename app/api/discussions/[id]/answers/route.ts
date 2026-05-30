import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { validateBody, successResponse, errorResponse } from '@/lib/validate'

const answerSchema = z.object({
  body: z.string().min(10, 'Answer must be at least 10 characters'),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return errorResponse('Unauthorized', 401)
    const user = verifyToken(token)
    if (!user) return errorResponse('Unauthorized', 401)

    const { id } = await params
    const body = await req.json()
    const { error, data } = validateBody(answerSchema, body)
    if (error || !data) return error || errorResponse('Validation failed', 400)

    const question = await prisma.question.findUnique({ where: { id: Number(id) } })
    if (!question) return errorResponse('Question not found', 404)

    const answer = await prisma.answer.create({
      data: { question_id: Number(id), user_id: user.userId, body: data.body },
      include: { user: { select: { id: true, name: true } } },
    })

    return successResponse({ answer }, 201)
  } catch (err) {
    console.error('Answer POST error:', err)
    return errorResponse('Internal server error')
  }
}
