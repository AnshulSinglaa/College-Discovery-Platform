import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { validateBody, successResponse, errorResponse } from '@/lib/validate'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { error, data } = validateBody(loginSchema, body)
    if (error || !data) return error || errorResponse('Validation failed', 400)

    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user) return errorResponse('Invalid email or password', 401)

    const isValid = await bcrypt.compare(data.password, user.password)
    if (!isValid) return errorResponse('Invalid email or password', 401)

    const token = signToken({ userId: user.id, email: user.email })

    return successResponse({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    })
  } catch (err) {
    console.error('Login error:', err)
    return errorResponse('Internal server error')
  }
}
