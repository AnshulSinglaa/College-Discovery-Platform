import { NextResponse } from 'next/server'
import { ZodSchema } from 'zod'

export function validateBody<T>(schema: ZodSchema<T>, body: unknown) {
  const result = schema.safeParse(body)
  if (!result.success) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      ),
      data: null,
    }
  }
  return { error: null, data: result.data }
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status })
}
