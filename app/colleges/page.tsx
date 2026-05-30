'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CollegeCard from '@/components/CollegeCard'

function CollegesContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [colleges,    setColleges]    = useState<any[]>([])
  const [pagination,  setPagination]  = useState<any>(null)
  const [loading,     setLoading]     = useState(true)
  const [filters, setFilters] = useState({
    search:    searchParams.get('search') || '',
    state:     searchParams.get('state')  || '',
    type:      searchParams.get('type')   || '',
    minFees:   searchParams.get('minFees') || '',
    maxFees:   searchParams.get('maxFees') || '',
    minRating: searchParams.get('minRating') || '',
    sortBy:    searchParams.get('sortBy') || 'nirf_rank',
    order:     searchParams.get('order')  || 'asc',
    page:      parseInt(searchParams.get('page') || '1'),
  })

  const states = ['Andhra Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Delhi','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Odisha','Pondicherry','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal']

  useEffect(() => {
    fetchColleges()
  }, [filters])

  const fetchColleges = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)) })
    params.set('limit', '12')
    const res  = await fetch(`/api/colleges?${params}`)
    const data = await res.json()
    setColleges(data.data?.colleges || [])
    setPagination(data.data?.pagination || null)
    setLoading(false)
  }

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB',
    borderRadius: '8px', fontSize: '13px', color: '#111827', background: 'white',
    boxSizing: 'border-box' as const, outline: 'none',
  }

  const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Sidebar Filters */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB', position: 'sticky', top: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>🔽 Filters</h3>
            <button onClick={() => setFilters({ search:'', state:'', type:'', minFees:'', maxFees:'', minRating:'', sortBy:'nirf_rank', order:'asc', page:1 })}
              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
              Clear All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Search */}
            <div>
              <label style={labelStyle}>Search</label>
              <input value={filters.search} onChange={e => updateFilter('search', e.target.value)}
                placeholder="College name, city..." style={inputStyle} />
            </div>

            {/* State */}
            <div>
              <label style={labelStyle}>State</label>
              <select value={filters.state} onChange={e => updateFilter('state', e.target.value)} style={inputStyle}>
                <option value="">All States</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Type */}
            <div>
              <label style={labelStyle}>Institution Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['', 'Government', 'Private', 'Deemed'].map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                    <input type="radio" name="type" value={t} checked={filters.type === t}
                      onChange={() => updateFilter('type', t)} style={{ accentColor: '#1F4E79' }} />
                    {t || 'All Types'}
                  </label>
                ))}
              </div>
            </div>

            {/* Fees */}
            <div>
              <label style={labelStyle}>Max Fees/Year (₹)</label>
              <select value={filters.maxFees} onChange={e => updateFilter('maxFees', e.target.value)} style={inputStyle}>
                <option value="">Any</option>
                <option value="50000">Under ₹50K</option>
                <option value="200000">Under ₹2L</option>
                <option value="500000">Under ₹5L</option>
                <option value="1000000">Under ₹10L</option>
                <option value="2000000">Under ₹20L</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label style={labelStyle}>Min Rating</label>
              <select value={filters.minRating} onChange={e => updateFilter('minRating', e.target.value)} style={inputStyle}>
                <option value="">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label style={labelStyle}>Sort By</label>
              <select value={filters.sortBy} onChange={e => updateFilter('sortBy', e.target.value)} style={inputStyle}>
                <option value="nirf_rank">NIRF Rank</option>
                <option value="nirf_score">NIRF Score</option>
                <option value="name">Name (A-Z)</option>
                <option value="established_year">Established Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                {filters.search ? `Results for "${filters.search}"` : 'Explore Colleges'}
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
                {pagination ? `Showing ${colleges.length} of ${pagination.total} colleges` : 'Loading...'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => updateFilter('order', filters.order === 'asc' ? 'desc' : 'asc')}
                style={{ background: 'white', border: '1px solid #D1D5DB', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                {filters.order === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.search || filters.state || filters.type || filters.maxFees) && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {filters.search && (
                <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🔍 {filters.search}
                  <span onClick={() => updateFilter('search', '')} style={{ cursor: 'pointer' }}>×</span>
                </span>
              )}
              {filters.state && (
                <span style={{ background: '#F0FDF4', color: '#16A34A', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📍 {filters.state}
                  <span onClick={() => updateFilter('state', '')} style={{ cursor: 'pointer' }}>×</span>
                </span>
              )}
              {filters.type && (
                <span style={{ background: '#FFF7ED', color: '#C2410C', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🏛 {filters.type}
                  <span onClick={() => updateFilter('type', '')} style={{ cursor: 'pointer' }}>×</span>
                </span>
              )}
            </div>
          )}

          {/* College Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background: '#E5E7EB', borderRadius: '12px', height: '220px' }} />
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6B7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ margin: '0 0 8px', color: '#111827' }}>No colleges found</h3>
              <p style={{ margin: 0 }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {colleges.map(c => <CollegeCard key={c.id} college={c} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
              <button disabled={!pagination.hasPrev} onClick={() => updateFilter('page', filters.page - 1)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', background: pagination.hasPrev ? 'white' : '#F9FAFB', cursor: pagination.hasPrev ? 'pointer' : 'not-allowed', color: pagination.hasPrev ? '#111827' : '#9CA3AF', fontSize: '13px' }}>
                ← Prev
              </button>

              {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => updateFilter('page', p)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: filters.page === p ? '#1F4E79' : 'white', color: filters.page === p ? 'white' : '#111827', cursor: 'pointer', fontWeight: filters.page === p ? 700 : 400, fontSize: '13px' }}>
                  {p}
                </button>
              ))}

              <button disabled={!pagination.hasNext} onClick={() => updateFilter('page', filters.page + 1)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', background: pagination.hasNext ? 'white' : '#F9FAFB', cursor: pagination.hasNext ? 'pointer' : 'not-allowed', color: pagination.hasNext ? '#111827' : '#9CA3AF', fontSize: '13px' }}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CollegesPage() {
  return (
    <Suspense fallback={<div style={{ display:'flex', justifyContent:'center', padding:'80px', fontSize:'16px', color:'#6B7280' }}>Loading colleges...</div>}>
      <CollegesContent />
    </Suspense>
  )
}
