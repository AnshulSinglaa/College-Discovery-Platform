import { NextRequest } from 'next/server'
import { z } from 'zod'
import Groq from 'groq-sdk'
import prisma from '@/lib/prisma'
import { validateBody, successResponse, errorResponse } from '@/lib/validate'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const shortlistSchema = z.object({
  description: z.string().min(20, 'Please describe yourself in at least 20 characters'),
  max_results: z.number().min(1).max(10).default(5),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { error, data } = validateBody(shortlistSchema, body)
    if (error) return error

    // Step 1 — Ask Groq to extract filters from description
    const filterCompletion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  500,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'Extract college search filters from the student description. Return ONLY valid JSON, no extra text.',
        },
        {
          role: 'user',
          content: `Student description: "${data.description}"

Extract filters and return JSON:
{
  "preferred_type": "Government" | "Private" | "Deemed" | null,
  "preferred_state": "state name" | null,
  "max_fees": number | null,
  "priority": "placements" | "research" | "fees" | "location" | "rating",
  "course_type": "engineering" | "management" | "medical" | "research" | null,
  "reasoning": "brief explanation of what the student wants"
}`,
        },
      ],
    })

    const filterText = filterCompletion.choices[0]?.message?.content || ''
    let filters: any = {}
    try {
      const jsonMatch = filterText.match(/\{[\s\S]*\}/)
      filters = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    } catch {
      filters = {}
    }

    // Step 2 — Query DB based on extracted filters
    const where: any = {}
    if (filters.preferred_type)  where.type  = { contains: filters.preferred_type,  mode: 'insensitive' }
    // Map regions to actual states
    const regionMap: Record<string, string[]> = {
      'north india':    ['Delhi', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Uttarakhand', 'Himachal Pradesh', 'Rajasthan', 'Jammu'],
      'south india':    ['Tamil Nadu', 'Karnataka', 'Kerala', 'Telangana', 'Andhra Pradesh'],
      'west india':     ['Maharashtra', 'Gujarat', 'Rajasthan', 'Goa'],
      'east india':     ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Assam'],
      'central india':  ['Madhya Pradesh', 'Chhattisgarh'],
      'northeast india':['Assam', 'Meghalaya', 'Manipur', 'Nagaland', 'Tripura'],
    }

    if (filters.preferred_state) {
      const regionKey = filters.preferred_state.toLowerCase()
      const mappedStates = regionMap[regionKey]
      if (mappedStates) {
        where.state = { in: mappedStates }
      } else {
        where.state = { contains: filters.preferred_state, mode: 'insensitive' }
      }
    }
    if (filters.max_fees) {
      where.courses = { some: { fees_per_year: { lte: filters.max_fees } } }
    }
    if (filters.course_type === 'medical') {
      where.OR = [
        { name: { contains: 'Medical',  mode: 'insensitive' } },
        { name: { contains: 'AIIMS',    mode: 'insensitive' } },
        { name: { contains: 'Medicine', mode: 'insensitive' } },
      ]
    } else if (filters.course_type === 'management') {
      where.OR = [
        { name: { contains: 'Management', mode: 'insensitive' } },
        { name: { contains: 'IIM',        mode: 'insensitive' } },
        { name: { contains: 'Business',   mode: 'insensitive' } },
      ]
    }

    const orderBy = filters.priority === 'fees'
      ? { total_seats: 'desc' as const }
      : { nirf_rank: 'asc' as const }

    const colleges = await prisma.college.findMany({
      where,
      take: 20,
      orderBy,
      select: {
        id: true, name: true, slug: true,
        city: true, state: true, type: true,
        nirf_rank: true, naac_grade: true,
        description: true,
        placements: {
          where: { year: 2024 },
          select: { average_package_lpa: true, placement_rate_percent: true },
        },
        courses: {
          take: 1,
          orderBy: { fees_per_year: 'asc' },
          select: { fees_per_year: true, name: true },
        },
        reviews: { select: { overall_rating: true } },
      },
    })

    // Step 3 — Ask Groq to pick and rank top colleges with reasons
    const collegeList = colleges.map((c, i) => ({
      index:    i,
      name:     c.name,
      type:     c.type,
      state:    c.state,
      nirf:     c.nirf_rank,
      fees:     c.courses[0]?.fees_per_year || 0,
      avg_pkg:  c.placements[0]?.average_package_lpa || 0,
      place_rt: c.placements[0]?.placement_rate_percent || 0,
      rating:   c.reviews.length
        ? parseFloat((c.reviews.reduce((s, r) => s + r.overall_rating, 0) / c.reviews.length).toFixed(1))
        : 0,
    }))

    const rankCompletion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  800,
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content: 'You are a college counselor. Rank colleges for a student based on their needs. Return ONLY valid JSON.',
        },
        {
          role: 'user',
          content: `Student description: "${data.description}"
Student priorities: ${JSON.stringify(filters)}

Available colleges:
${JSON.stringify(collegeList)}

Pick the best ${data.max_results} colleges for this student. Return JSON:
{
  "recommendations": [
    { "index": 0, "reason": "why this college fits", "match_score": 85 }
  ]
}
Sort by match_score descending.`,
        },
      ],
    })

    const rankText = rankCompletion.choices[0]?.message?.content || ''
    let ranked: any = { recommendations: [] }
    try {
      const jsonMatch = rankText.match(/\{[\s\S]*\}/)
      ranked = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [] }
    } catch {
      ranked = { recommendations: [] }
    }

    const recommendations = (ranked.recommendations || [])
      .slice(0, data.max_results)
      .map((r: any) => {
        const college = colleges[r.index]
        if (!college) return null
        return {
          ...college,
          avg_rating: college.reviews.length
            ? parseFloat((college.reviews.reduce((s, rv) => s + rv.overall_rating, 0) / college.reviews.length).toFixed(1))
            : null,
          min_fees:      college.courses[0]?.fees_per_year    || null,
          top_course:    college.courses[0]?.name             || null,
          placement_2024: college.placements[0]               || null,
          match_score:   r.match_score,
          reason:        r.reason,
          reviews:       undefined,
          courses:       undefined,
          placements:    undefined,
        }
      })
      .filter(Boolean)

    return successResponse({
      query:           data.description,
      filters_applied: filters,
      total_found:     colleges.length,
      recommendations,
    })
  } catch (err) {
    console.error('Shortlist error:', err)
    return errorResponse('Internal server error')
  }
}
