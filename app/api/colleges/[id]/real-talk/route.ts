import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/validate'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const college = await prisma.college.findFirst({
      where: isNaN(Number(id)) ? { slug: id } : { id: Number(id) },
      select: { id: true, name: true, city: true, state: true, type: true },
    })
    if (!college) return errorResponse('College not found', 404)

    // Check cache (valid 7 days)
    const cached = await prisma.realTalkCache.findUnique({
      where: { college_id: college.id },
    })
    if (cached && new Date() < cached.expires_at) {
      return successResponse({
        college_name: college.name,
        source:       'cache',
        last_updated: cached.fetched_at,
        pros:         cached.pros,
        cons:         cached.cons,
        hidden_gems:  cached.hidden_gems,
        common_complaints: cached.complaints,
        sentiment:    cached.sentiment,
        sources:      cached.sources,
      })
    }

    // Call Groq AI
    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  1200,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `You are a college research assistant that provides honest, balanced analysis of Indian colleges based on publicly known student experiences from Reddit, Quora, and student forums. Always respond with valid JSON only — no markdown, no extra text.`,
        },
        {
          role: 'user',
          content: `Based on widely known student experiences and publicly available information about "${college.name}" (${college.city}, ${college.state}, India), provide an honest analysis.

Return ONLY this JSON structure:
{
  "pros": ["specific pro 1", "specific pro 2", "specific pro 3", "specific pro 4", "specific pro 5"],
  "cons": ["specific con 1", "specific con 2", "specific con 3", "specific con 4"],
  "hidden_gems": ["lesser known positive 1", "lesser known positive 2"],
  "common_complaints": ["complaint 1", "complaint 2", "complaint 3"],
  "sentiment": "Mostly Positive",
  "sources": ["reddit.com/r/india", "quora.com", "shiksha.com"]
}

Sentiment must be one of: "Mostly Positive", "Mixed", "Mostly Negative"
Focus on: academics, placements, campus life, faculty quality, hostel, food, and overall student satisfaction.`,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content || ''

    let parsed: any
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch {
      parsed = null
    }

    if (!parsed) return errorResponse('Could not generate analysis. Try again.', 503)

    // Cache for 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.realTalkCache.upsert({
      where:  { college_id: college.id },
      create: {
        college_id:   college.id,
        college_name: college.name,
        pros:         parsed.pros              || [],
        cons:         parsed.cons              || [],
        hidden_gems:  parsed.hidden_gems       || [],
        complaints:   parsed.common_complaints || [],
        sentiment:    parsed.sentiment         || 'Mixed',
        sources:      parsed.sources           || [],
        expires_at:   expiresAt,
      },
      update: {
        pros:        parsed.pros              || [],
        cons:        parsed.cons              || [],
        hidden_gems: parsed.hidden_gems       || [],
        complaints:  parsed.common_complaints || [],
        sentiment:   parsed.sentiment         || 'Mixed',
        sources:     parsed.sources           || [],
        fetched_at:  new Date(),
        expires_at:  expiresAt,
      },
    })

    return successResponse({
      college_name:      college.name,
      source:            'live',
      last_updated:      new Date(),
      pros:              parsed.pros              || [],
      cons:              parsed.cons              || [],
      hidden_gems:       parsed.hidden_gems       || [],
      common_complaints: parsed.common_complaints || [],
      sentiment:         parsed.sentiment         || 'Mixed',
      sources:           parsed.sources           || [],
    })
  } catch (err) {
    console.error('Real Talk error:', err)
    return errorResponse('Internal server error')
  }
}
