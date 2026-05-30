import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { validateBody, successResponse, errorResponse } from '@/lib/validate'

const predictSchema = z.object({
  exam:            z.enum(['JEE_ADV', 'JEE_MAIN', 'NEET', 'CAT', 'BITSAT', 'XAT', 'GATE']),
  rank:            z.number().positive(),
  category:        z.enum(['General', 'OBC', 'SC', 'ST', 'EWS']).default('General'),
  preferredCourse: z.string().optional(),
  preferredState:  z.string().optional(),
  maxFees:         z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { error, data } = validateBody(predictSchema, body)
    if (error || !data) return error || errorResponse('Validation failed', 400)

    const { exam, rank, category, preferredCourse, preferredState, maxFees } = data

    // Find cutoffs where closing rank >= user's rank (user can get in)
    const matchingCutoffs = await prisma.cutoff.findMany({
      where: {
        exam,
        category,
        year: 2024,
        closing_rank: { gte: rank },
        ...(preferredCourse ? { branch: { contains: preferredCourse, mode: 'insensitive' } } : {}),
      },
      include: {
        college: {
          include: {
            courses: {
              where: maxFees ? { fees_per_year: { lte: maxFees } } : {},
              orderBy: { fees_per_year: 'asc' },
              take: 1,
            },
            placements: { where: { year: 2024 } },
            _count: { select: { savedBy: true } },
          },
        },
      },
      orderBy: { closing_rank: 'asc' },
    })

    // Filter by state if provided
    let filtered = matchingCutoffs
    if (preferredState) {
      filtered = matchingCutoffs.filter(c =>
        c.college.state.toLowerCase().includes(preferredState.toLowerCase())
      )
      // If no results in preferred state, fall back to all
      if (filtered.length === 0) filtered = matchingCutoffs
    }

    // Categorise into safe / moderate / reach
    const safe:     typeof filtered = []
    const moderate: typeof filtered = []
    const reach:    typeof filtered = []

    filtered.forEach((c) => {
      const buffer = c.closing_rank - rank
      const pct    = (buffer / c.closing_rank) * 100
      if (pct >= 20)      safe.push(c)
      else if (pct >= 8)  moderate.push(c)
      else                reach.push(c)
    })

    const format = (arr: typeof filtered) =>
      arr.slice(0, 6).map((c) => ({
        college_id:      c.college.id,
        college_name:    c.college.name,
        slug:            c.college.slug,
        city:            c.college.city,
        state:           c.college.state,
        nirf_rank:       c.college.nirf_rank,
        branch:          c.branch,
        opening_rank:    c.opening_rank,
        closing_rank:    c.closing_rank,
        your_rank:       rank,
        buffer:          c.closing_rank - rank,
        min_fees:        c.college.courses[0]?.fees_per_year || null,
        placement_2024:  c.college.placements[0] || null,
        saved_count:     c.college._count.savedBy,
      }))

    const totalMatches = safe.length + moderate.length + reach.length
    const admissionChance = totalMatches > 0
      ? `${Math.min(100, Math.round((safe.length / totalMatches) * 100 + 30))}%`
      : '0%'

    return successResponse({
      input: { exam, rank, category, preferredCourse, preferredState, maxFees },
      admission_chance: admissionChance,
      total_matches: totalMatches,
      safe_colleges:     format(safe),
      moderate_colleges: format(moderate),
      reach_colleges:    format(reach),
    })
  } catch (err) {
    console.error('Predict error:', err)
    return errorResponse('Internal server error')
  }
}
