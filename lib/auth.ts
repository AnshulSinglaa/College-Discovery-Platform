import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'campusiq_secret'

export function signToken(payload: { userId: number; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string }
  } catch {
    return null
  }
}
