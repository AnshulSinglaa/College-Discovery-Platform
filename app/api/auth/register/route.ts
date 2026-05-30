import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { validateBody, successResponse, errorResponse } from '@/lib/validate'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { error, data } = validateBody(registerSchema, body)
    if (error || !data) return error || errorResponse('Validation failed', 400)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return errorResponse('Email already registered', 409)

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, created_at: true },
    })

    const token = signToken({ userId: user.id, email: user.email })

    return successResponse({ user, token }, 201)
  } catch (err) {
    console.error('Register error:', err)
    return errorResponse('Internal server error')
  }
}
