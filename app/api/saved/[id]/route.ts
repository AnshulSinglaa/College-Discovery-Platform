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

const updateSchema = z.object({
  status: z.enum(['shortlisted', 'applied', 'rejected', 'admitted']).optional(),
  notes: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUser(req)
    if (!user) return errorResponse('Unauthorized', 401)

    const { id } = await params
    const body = await req.json()
    const { error, data } = validateBody(updateSchema, body)
    if (error || !data) return error || errorResponse('Validation failed', 400)

    const saved = await prisma.savedCollege.findFirst({
      where: { id: Number(id), user_id: user.userId },
    })
    if (!saved) return errorResponse('Saved college not found', 404)

    const updated = await prisma.savedCollege.update({
      where: { id: Number(id) },
      data,
    })
    return successResponse({ saved: updated })
  } catch (err) {
    console.error('Saved PATCH error:', err)
    return errorResponse('Internal server error')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUser(req)
    if (!user) return errorResponse('Unauthorized', 401)

    const { id } = await params
    const saved = await prisma.savedCollege.findFirst({
      where: { id: Number(id), user_id: user.userId },
    })
    if (!saved) return errorResponse('Saved college not found', 404)

    await prisma.savedCollege.delete({ where: { id: Number(id) } })
    return successResponse({ message: 'College removed from saved list' })
  } catch (err) {
    console.error('Saved DELETE error:', err)
    return errorResponse('Internal server error')
  }
}
