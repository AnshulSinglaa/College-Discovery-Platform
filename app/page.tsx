'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CollegeCard from '@/components/CollegeCard'

export default function HomePage() {
  const [search, setSearch]       = useState('')
  const [colleges, setColleges]   = useState<any[]>([])
  const [trending, setTrending]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch('/api/colleges?limit=6&sortBy=nirf_rank').then(r => r.json()),
      fetch('/api/colleges/trending?limit=4').then(r => r.json()),
    ]).then(([col, trend]) => {
      setColleges(col.data?.colleges || [])
      setTrending(trend.data?.trending || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (search.length < 2) { setSuggestions([]); return }
    const t = setTimeout(() => {
      fetch(`/api/colleges/search-suggestions?q=${search}`)
        .then(r => r.json())
        .then(d => setSuggestions(d.data?.suggestions || []))
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/colleges?search=${encodeURIComponent(search)}`)
  }

  const stats = [
    { label: 'Colleges Listed', value: '100+' },
    { label: 'Student Reviews', value: '200+' },
    { label: 'Placement Records', value: '300+' },
    { label: 'Cutoff Datasets', value: '2200+' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1F4E79 0%, #2E86AB 100%)', padding: '80px 24px 60px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '42px', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>
          Discover Your Academic Future<br />
          <span style={{ color: '#60CFFF' }}>With Data.</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '0 0 36px' }}>
          Empowering students with transparent, comparative insights into institutions across the nation.
        </p>

        {/* Search */}
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '6px 6px 6px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              <span style={{ color: '#9CA3AF', marginRight: '8px', lineHeight: '42px' }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search colleges, courses, cities..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: '#111827' }}
              />
              <button type="submit" style={{ background: '#1F4E79', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                Search
              </button>
            </div>
          </form>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '54px', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 50, overflow: 'hidden' }}>
              {suggestions.map(s => (
                <div key={s.id} onClick={() => { router.push(`/colleges/${s.slug}`); setSuggestions([]) }}
                  style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{s.city}, {s.state}</div>
                  </div>
                  <span style={{ fontSize: '11px', background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '20px' }}>{s.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          {['IIT', 'NIT', 'IIM', 'AIIMS', 'Government', 'Private'].map(chip => (
            <button key={chip} onClick={() => router.push(`/colleges?search=${chip}`)}
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1F4E79' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Institutions */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>Top Institutions</h2>
            <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '14px' }}>Ranked by NIRF India 2025</p>
          </div>
          <Link href="/colleges" style={{ color: '#1F4E79', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            View All →
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: '#E5E7EB', borderRadius: '12px', height: '200px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {colleges.map(c => <CollegeCard key={c.id} college={c} />)}
          </div>
        )}
      </div>

      {/* Trending */}
      <div style={{ background: 'white', borderTop: '1px solid #E5E7EB', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 700, color: '#111827' }}>Trending Currently 🔥</h2>
          <p style={{ margin: '0 0 24px', color: '#6B7280', fontSize: '14px' }}>Most searched colleges this week</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {trending.map((c: any) => (
              <Link key={c.id} href={`/colleges/${c.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#EFF6FF')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
                >
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>📍 {c.city}</div>
                  <div style={{ fontSize: '11px', color: '#10B981', marginTop: '6px', fontWeight: 600 }}>
                    #{c.nirf_rank} NIRF
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* AI Features Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1F4E79, #2E86AB)', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: '0 0 12px' }}>
            🤖 AI-Powered College Intelligence
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', margin: '0 0 28px' }}>
            Get real student sentiment from Reddit &amp; Quora, personalized recommendations, and data-driven predictions
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/predict" style={{ background: 'white', color: '#1F4E79', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
              Try Predictor
            </Link>
            <Link href="/colleges" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', border: '1px solid rgba(255,255,255,0.3)' }}>
              Explore Colleges
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#111827', color: 'rgba(255,255,255,0.6)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎓</span>
              <span style={{ color: 'white', fontWeight: 700 }}>CampusIQ</span>
              <span style={{ fontSize: '12px' }}>© 2026</span>
            </div>
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
              {['About Us', 'Contact', 'Privacy Policy', 'NIRF Rankings', 'Placement Data'].map(l => (
                <span key={l} style={{ cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
