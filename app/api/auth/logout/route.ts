import { successResponse } from '@/lib/validate'

export async function POST() {
  return successResponse({ message: 'Logged out successfully' })
}
