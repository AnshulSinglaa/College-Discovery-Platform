import { NextResponse } from 'next/server'

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'CampusIQ API',
    version: '1.0.0',
    description: 'College Discovery Platform API — Built for The AI Signal Internship Task',
    contact: { name: 'CampusIQ', email: 'support@campusiq.in' },
  },
  servers: [{ url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', description: 'Development Server' }],
  components: {
    securitySchemes: {
      BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  tags: [
    { name: 'Auth',      description: 'Authentication endpoints' },
    { name: 'Colleges',  description: 'College listing, search, detail' },
    { name: 'Compare',   description: 'Side-by-side college comparison' },
    { name: 'Predictor', description: 'Rank-based college predictor' },
    { name: 'Saved',     description: 'Save and track colleges' },
    { name: 'Reviews',   description: 'Student reviews' },
    { name: 'Q&A',       description: 'Discussions and answers' },
    { name: 'AI',        description: 'AI-powered features' },
    { name: 'Analytics', description: 'Platform analytics' },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Register a new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['name','email','password'], properties: {
            name:     { type: 'string', example: 'Rahul Singh' },
            email:    { type: 'string', example: 'rahul@gmail.com' },
            password: { type: 'string', example: 'password123' },
          }}}}
        },
        responses: { '201': { description: 'User registered successfully' }, '409': { description: 'Email already exists' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['email','password'], properties: {
            email:    { type: 'string', example: 'rahul@gmail.com' },
            password: { type: 'string', example: 'password123' },
          }}}}
        },
        responses: { '200': { description: 'Login successful with JWT token' }, '401': { description: 'Invalid credentials' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'], summary: 'Get current logged in user',
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Current user data' }, '401': { description: 'Unauthorized' } },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'], summary: 'Logout user',
        responses: { '200': { description: 'Logged out successfully' } },
      },
    },
    '/api/colleges': {
      get: {
        tags: ['Colleges'], summary: 'List colleges with search, filter and pagination',
        parameters: [
          { name: 'search',    in: 'query', schema: { type: 'string' },  description: 'Search by name, city, state' },
          { name: 'state',     in: 'query', schema: { type: 'string' },  description: 'Filter by state' },
          { name: 'type',      in: 'query', schema: { type: 'string' },  description: 'Government / Private / Deemed' },
          { name: 'minFees',   in: 'query', schema: { type: 'integer' }, description: 'Min fees per year' },
          { name: 'maxFees',   in: 'query', schema: { type: 'integer' }, description: 'Max fees per year' },
          { name: 'minRating', in: 'query', schema: { type: 'number' },  description: 'Min average rating (1-5)' },
          { name: 'exam',      in: 'query', schema: { type: 'string' },  description: 'Entrance exam filter' },
          { name: 'sortBy',    in: 'query', schema: { type: 'string', enum: ['nirf_rank','nirf_score','name','established_year'] } },
          { name: 'order',     in: 'query', schema: { type: 'string', enum: ['asc','desc'] } },
          { name: 'page',      in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit',     in: 'query', schema: { type: 'integer', default: 12 } },
        ],
        responses: { '200': { description: 'List of colleges with pagination' } },
      },
    },
    '/api/colleges/{id}': {
      get: {
        tags: ['Colleges'], summary: 'Get college detail by ID or slug',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'College ID or slug (e.g. iit-madras)' }],
        responses: { '200': { description: 'Full college detail' }, '404': { description: 'College not found' } },
      },
    },
    '/api/colleges/trending': {
      get: {
        tags: ['Colleges'], summary: 'Get trending colleges (most saved)',
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 8 } }],
        responses: { '200': { description: 'Trending colleges list' } },
      },
    },
    '/api/colleges/search-suggestions': {
      get: {
        tags: ['Colleges'], summary: 'Autocomplete search suggestions',
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query (min 2 chars)' }],
        responses: { '200': { description: 'List of matching colleges' } },
      },
    },
    '/api/colleges/compare': {
      get: {
        tags: ['Compare'], summary: 'Compare 2-3 colleges side by side with weighted scoring',
        parameters: [
          { name: 'ids',        in: 'query', required: true, schema: { type: 'string' }, description: 'Comma separated college IDs (e.g. 1,2,3)' },
          { name: 'wPlacement', in: 'query', schema: { type: 'number', default: 0.4 },   description: 'Weight for placements (0-1)' },
          { name: 'wFees',      in: 'query', schema: { type: 'number', default: 0.3 },   description: 'Weight for fees (0-1)' },
          { name: 'wRating',    in: 'query', schema: { type: 'number', default: 0.3 },   description: 'Weight for rating (0-1)' },
        ],
        responses: { '200': { description: 'Comparison data with winners' } },
      },
    },
    '/api/predict': {
      post: {
        tags: ['Predictor'], summary: 'Predict colleges based on exam rank and preferences',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['exam','rank'], properties: {
            exam:            { type: 'string', enum: ['JEE_ADV','JEE_MAIN','NEET','CAT','BITSAT','XAT','GATE'], example: 'JEE_ADV' },
            rank:            { type: 'number', example: 150 },
            category:        { type: 'string', enum: ['General','OBC','SC','ST','EWS'], default: 'General' },
            preferredCourse: { type: 'string', example: 'Computer Science' },
            preferredState:  { type: 'string', example: 'Tamil Nadu' },
            maxFees:         { type: 'number', example: 300000 },
          }}}}
        },
        responses: { '200': { description: 'Safe, Moderate and Reach colleges' } },
      },
    },
    '/api/colleges/{id}/reviews': {
      get: {
        tags: ['Reviews'], summary: 'Get reviews for a college',
        parameters: [
          { name: 'id',    in: 'path',  required: true, schema: { type: 'string' } },
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { '200': { description: 'Reviews with rating breakdown' } },
      },
      post: {
        tags: ['Reviews'], summary: 'Submit a review for a college',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['overall_rating','academics_rating','placement_rating','infrastructure_rating','faculty_rating','review_text','pros','cons','batch_year'], properties: {
            overall_rating:        { type: 'number', minimum: 1, maximum: 5, example: 4.5 },
            academics_rating:      { type: 'number', minimum: 1, maximum: 5, example: 4.8 },
            placement_rating:      { type: 'number', minimum: 1, maximum: 5, example: 4.9 },
            infrastructure_rating: { type: 'number', minimum: 1, maximum: 5, example: 4.5 },
            faculty_rating:        { type: 'number', minimum: 1, maximum: 5, example: 4.7 },
            review_text:           { type: 'string', example: 'Amazing college with world class research facilities...' },
            pros:                  { type: 'string', example: 'Great placements, excellent faculty' },
            cons:                  { type: 'string', example: 'High academic pressure' },
            batch_year:            { type: 'integer', example: 2024 },
          }}}}
        },
        responses: { '201': { description: 'Review submitted' }, '409': { description: 'Already reviewed' } },
      },
    },
    '/api/saved': {
      get: {
        tags: ['Saved'], summary: 'Get all saved colleges for logged in user',
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'List of saved colleges' } },
      },
      post: {
        tags: ['Saved'], summary: 'Save a college',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['college_id'], properties: {
            college_id: { type: 'integer', example: 1 },
            status:     { type: 'string', enum: ['shortlisted','applied','rejected','admitted'], default: 'shortlisted' },
            notes:      { type: 'string', example: 'Top choice for CSE' },
          }}}}
        },
        responses: { '201': { description: 'College saved' }, '409': { description: 'Already saved' } },
      },
    },
    '/api/saved/summary': {
      get: {
        tags: ['Saved'], summary: 'Get saved colleges summary by status',
        security: [{ BearerAuth: [] }],
        responses: { '200': { description: 'Count of colleges by application status' } },
      },
    },
    '/api/saved/{id}': {
      patch: {
        tags: ['Saved'], summary: 'Update status or notes of a saved college',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: {
            status: { type: 'string', enum: ['shortlisted','applied','rejected','admitted'] },
            notes:  { type: 'string' },
          }}}}
        },
        responses: { '200': { description: 'Updated successfully' } },
      },
      delete: {
        tags: ['Saved'], summary: 'Remove a saved college',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Removed successfully' } },
      },
    },
    '/api/discussions': {
      get: {
        tags: ['Q&A'], summary: 'Get all questions',
        parameters: [
          { name: 'collegeId', in: 'query', schema: { type: 'integer' }, description: 'Filter by college' },
          { name: 'tag',       in: 'query', schema: { type: 'string' },  description: 'Filter by tag' },
          { name: 'sort',      in: 'query', schema: { type: 'string', enum: ['latest','popular'] } },
          { name: 'page',      in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: { '200': { description: 'List of questions' } },
      },
      post: {
        tags: ['Q&A'], summary: 'Post a new question',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['title','body'], properties: {
            title:      { type: 'string', example: 'What is the hostel life like at IIT Madras?' },
            body:       { type: 'string', example: 'I got admission and want to know more about hostel facilities...' },
            college_id: { type: 'integer', example: 1 },
            tags:       { type: 'array', items: { type: 'string' }, example: ['hostel','campus-life'] },
          }}}}
        },
        responses: { '201': { description: 'Question posted' } },
      },
    },
    '/api/discussions/{id}/answers': {
      post: {
        tags: ['Q&A'], summary: 'Answer a question',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['body'], properties: {
            body: { type: 'string', example: 'The hostel life at IIT Madras is excellent...' },
          }}}}
        },
        responses: { '201': { description: 'Answer posted' } },
      },
    },
    '/api/discussions/{id}/vote': {
      post: {
        tags: ['Q&A'], summary: 'Upvote a question',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Vote registered' } },
      },
    },
    '/api/colleges/{id}/real-talk': {
      get: {
        tags: ['AI'], summary: '🤖 Real Talk — AI fetches honest Reddit/Quora student sentiment',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'College ID or slug' }],
        responses: {
          '200': { description: 'Pros, cons, hidden gems, complaints and sentiment score (cached 7 days)' },
          '503': { description: 'AI service unavailable' },
        },
      },
    },
    '/api/ai/shortlist': {
      post: {
        tags: ['AI'], summary: '🤖 Smart Shortlister — AI recommends colleges from your description',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['description'], properties: {
            description: { type: 'string', example: 'I scored 95 percentile in CAT, budget 20 lakhs, want MBA in North India' },
            max_results: { type: 'integer', default: 5, minimum: 1, maximum: 10 },
          }}}}
        },
        responses: { '200': { description: 'Personalized college recommendations with match score and reasoning' } },
      },
    },
    '/api/analytics': {
      get: {
        tags: ['Analytics'], summary: 'Get platform analytics and stats',
        responses: { '200': { description: 'Stats, trending, top rated, top placement colleges' } },
      },
    },
  },
}

export async function GET() {
  return NextResponse.json(swaggerSpec)
}
